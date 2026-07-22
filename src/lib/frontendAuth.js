import Credentials from "next-auth/providers/credentials";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export const frontendAuthOptions = {
  session: {
    strategy: "jwt",
  },

  providers: [
    Credentials({
      name: "credentials",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
        recaptchaToken: {
          label: "reCAPTCHA Token",
          type: "text",
        },
      },

      async authorize(credentials, req) {
        const logFile = path.join(process.cwd(), "auth_debug.log");
        const writeLog = (msg) => {
          console.log(msg); // Also output to Vercel/NextJS server console
          try {
            fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${msg}\n`);
          } catch (e) {
            // Ephemeral file systems on Vercel will trigger this, which is fine
          }
        };

        writeLog(`[Frontend Auth] Attempt started. Email: ${credentials?.email}`);

        if (!credentials?.email || !credentials?.password) {
          writeLog("[Frontend Auth] Failed: Email or password missing");
          throw new Error("Email and password required");
        }

        try {
          // Query User table for VISITOR-role accounts
          const frontendUser = await prisma.user.findFirst({
            where: {
              email: credentials.email,
              globalRole: "VISITOR",
              isActive: true,
            }
          });

          if (frontendUser) {
            let authenticated = false;

            // 1. Try bcrypt (new accounts or already upgraded)
            if (frontendUser.passwordHash) {
              try {
                authenticated = await bcrypt.compare(credentials.password, frontendUser.passwordHash);
              } catch { /* bad hash format - fall through to legacy check */ }
            }

            // 2. Fall back to legacy SHA-256 hash (migrated accounts)
            if (!authenticated && frontendUser.legacyPasswordHash) {
              const sha256 = crypto.createHash("sha256").update(credentials.password).digest("hex");
              if (sha256 === frontendUser.legacyPasswordHash) {
                authenticated = true;
                // Transparently upgrade to bcrypt and clear legacy hash
                try {
                  const newHash = await bcrypt.hash(credentials.password, 10);
                  await prisma.user.update({
                    where: { id: frontendUser.id },
                    data: { passwordHash: newHash, legacyPasswordHash: null },
                  });
                  writeLog(`[Frontend Auth] Upgraded password hash to bcrypt for: ${frontendUser.email}`);
                } catch (upgradeErr) {
                  writeLog(`[Frontend Auth] Failed to upgrade password hash: ${upgradeErr.message}`);
                }
              }
            }

            if (authenticated) {
              writeLog(`[Frontend Auth] Frontend user authenticated successfully: ${frontendUser.email}`);
              return {
                id: String(frontendUser.id),
                email: frontendUser.email,
                name: frontendUser.name,
                globalRole: "VISITOR"
              };
            }
          }
        } catch (frontendErr) {
          writeLog(`[Frontend Auth] Frontend authentication error: ${frontendErr.message}`);
        }

        writeLog(`[Frontend Auth] All authentication methods failed for: ${credentials.email}`);
        throw new Error("Invalid credentials");
      },
    }),
  ],

  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? "__Secure-frontend-session-token" : "frontend-session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production"
      }
    }
  },

  callbacks: {
    async jwt({ token, user }) {
      const now = Date.now();
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.globalRole = user.globalRole || "USER";
        token.lastActivity = now;
      }

      // Simple static timeout for frontend users (e.g. 24 hours)
      const timeoutMs = 24 * 60 * 60 * 1000;

      if (token.lastActivity && now - token.lastActivity > timeoutMs) {
        token.error = "SessionExpired";
      } else {
        token.lastActivity = now;
      }

      return token;
    },

    async session({ session, token }) {
      if (token.error === "SessionExpired") {
        session.error = "SessionExpired";
        session.user = null;
        return session;
      }

      session.user = {
        id: token.id,
        email: token.email,
        globalRole: token.globalRole,
      };

      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return new URL(url, baseUrl).toString();
      }
      return url;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  useSecureCookies: false,
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
};
