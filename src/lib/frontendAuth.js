import Credentials from "next-auth/providers/credentials";
import fs from "fs";
import path from "path";
import crypto from "crypto";

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
          const shasum = crypto.createHash("sha256");
          shasum.update(credentials.password);
          const hashedPassword = shasum.digest("hex");

          const frontendUser = await prisma.auth.findFirst({
            where: {
              OR: [
                { email: credentials.email },
                { username: credentials.email }
              ]
            }
          });

          if (frontendUser && frontendUser.password === hashedPassword) {
            writeLog(`[Frontend Auth] Frontend user authenticated successfully: ${frontendUser.email}`);
            return {
              id: String(frontendUser.id),
              email: frontendUser.email,
              name: frontendUser.name,
              globalRole: "USER"
            };
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
