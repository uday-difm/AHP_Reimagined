import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";

/**
 * Frontend user registration and legacy login handler.
 *
 * Registration: Creates a User record with globalRole=VISITOR and bcrypt passwordHash.
 * Login (legacy): Kept for backward compatibility with older quiz flow callers.
 *   Actual session-based login is handled by frontendAuth.js + NextAuth.
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { action, name, username, email, password } = body;

    if (action === "register") {
      if (!email || !password || !name) {
        return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
      }

      // Check if user already exists in User table
      const existingUser = await prisma.user.findFirst({
        where: { email }
      });

      if (existingUser) {
        return NextResponse.json({ error: "Email already registered" }, { status: 400 });
      }

      // Hash password with bcrypt (new accounts skip SHA-256 entirely)
      const passwordHash = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          globalRole: "VISITOR",
          isActive: true,
        }
      });

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        }
      });
    }

    if (action === "login") {
      // Legacy lookup — real login flow is handled by NextAuth frontendAuth.js.
      // This path is kept for backward-compatible callers that do their own fetch.
      if (!email && !username || !password) {
        return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
      }

      const loginEmail = email || username;

      const user = await prisma.user.findFirst({
        where: { email: loginEmail, globalRole: "VISITOR", isActive: true }
      });

      if (!user) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }

      let authenticated = false;

      // Try bcrypt first
      if (user.passwordHash) {
        try { authenticated = await bcrypt.compare(password, user.passwordHash); } catch { /* ignore */ }
      }

      // Fall back to legacy SHA-256
      if (!authenticated && user.legacyPasswordHash) {
        const sha256 = crypto.createHash("sha256").update(password).digest("hex");
        if (sha256 === user.legacyPasswordHash) {
          authenticated = true;
          // Upgrade to bcrypt transparently
          const newHash = await bcrypt.hash(password, 10);
          await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash: newHash, legacyPasswordHash: null }
          }).catch(() => { /* non-critical */ });
        }
      }

      if (!authenticated) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }

      return NextResponse.json({
        success: true,
        user: { id: user.id, name: user.name, email: user.email }
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("POST /api/quizess/auth error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
