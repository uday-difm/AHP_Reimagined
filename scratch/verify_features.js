/**
 * Feature Verification Script
 * Run: node scratch/verify_features.js
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const PASS = "✅ PASS";
const FAIL = "❌ FAIL";
const WARN = "⚠️  WARN";

async function run() {
  console.log("=".repeat(60));
  console.log("  FEATURE VERIFICATION REPORT");
  console.log("=".repeat(60));

  // ─────────────────────────────────────────────
  // 1. AUDIT LOGS
  // ─────────────────────────────────────────────
  console.log("\n📋 1. AUDIT LOGS");
  try {
    const total = await prisma.auditLog.count();
    const recent = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { user: { select: { email: true } } },
    });
    if (total === 0) {
      console.log(`   ${WARN} Audit log table is empty. Perform an action and re-run.`);
    } else {
      console.log(`   ${PASS} Found ${total} audit log entries.`);
      recent.forEach((log) => {
        const who = log.user?.email || "system";
        console.log(`         • [${log.action}] by ${who} at ${log.createdAt.toISOString()}`);
      });
    }
  } catch (e) {
    console.log(`   ${FAIL} Error querying audit logs: ${e.message}`);
  }

  // ─────────────────────────────────────────────
  // 2. 2FA STATUS
  // ─────────────────────────────────────────────
  console.log("\n🔐 2. TWO-FACTOR AUTHENTICATION");
  try {
    const users = await prisma.user.findMany({
      select: { email: true, twoFAEnabled: true, isActive: true },
    });
    users.forEach((u) => {
      const status = u.twoFAEnabled ? "2FA ON" : "2FA OFF";
      const active = u.isActive ? "" : " [INACTIVE]";
      console.log(`   ${u.twoFAEnabled ? PASS : WARN} ${u.email}${active} — ${status}`);
    });
    const twoFAUsers = await prisma.twoFactor.count();
    console.log(`   ${twoFAUsers > 0 ? PASS : WARN} TwoFactorAuth secrets stored: ${twoFAUsers}`);
  } catch (e) {
    console.log(`   ${FAIL} Error: ${e.message}`);
  }

  // ─────────────────────────────────────────────
  // 3. SHARP MODULE
  // ─────────────────────────────────────────────
  console.log("\n🖼️  3. SHARP IMAGE PROCESSING");
  try {
    const sharp = require("sharp");
    const v = sharp.versions;
    console.log(`   ${PASS} sharp v${v.sharp} loaded (vips ${v.vips}, webp ${v.webp})`);
    // Quick functional test - create a 1x1 pixel red image
    const buf = await sharp({
      create: { width: 1, height: 1, channels: 3, background: { r: 255, g: 0, b: 0 } }
    }).webp().toBuffer();
    console.log(`   ${PASS} WebP conversion works (output: ${buf.length} bytes)`);
  } catch (e) {
    console.log(`   ${FAIL} ${e.message}`);
  }

  // ─────────────────────────────────────────────
  // 4. ENVIRONMENT VARIABLES
  // ─────────────────────────────────────────────
  console.log("\n⚙️  4. ENVIRONMENT VARIABLES");
  require("dotenv").config({ path: ".env.local" });
  require("dotenv").config({ path: ".env" });

  const checks = [
    ["DATABASE_URL", "DB"],
    ["NEXTAUTH_SECRET", "Auth"],
    ["NEXTAUTH_URL", "Auth"],
    ["S3_ENDPOINT", "S3/MinIO"],
    ["S3_BUCKET", "S3/MinIO"],
    ["S3_ACCESS_KEY", "S3/MinIO"],
    ["S3_SECRET_KEY", "S3/MinIO"],
    ["CLOUDINARY_CLOUD_NAME", "Cloudinary (legacy)"],
  ];

  checks.forEach(([key, group]) => {
    const val = process.env[key];
    if (val) {
      const display = key.includes("SECRET") || key.includes("PASSWORD") ? "***" : val.substring(0, 40);
      console.log(`   ${PASS} [${group}] ${key} = ${display}`);
    } else {
      const isOptional = key.startsWith("CLOUDINARY");
      console.log(`   ${isOptional ? WARN : FAIL} [${group}] ${key} — NOT SET`);
    }
  });

  // ─────────────────────────────────────────────
  // 5. MEDIA ASSETS IN DB
  // ─────────────────────────────────────────────
  console.log("\n📁 5. MEDIA LIBRARY");
  try {
    const mediaCount = await prisma.media.count();
    const folderCount = await prisma.mediaFolder.count();
    console.log(`   ${mediaCount > 0 ? PASS : WARN} Media files in DB: ${mediaCount}`);
    console.log(`   ${PASS} Media folders in DB: ${folderCount}`);
    if (mediaCount > 0) {
      const sample = await prisma.media.findFirst({ orderBy: { createdAt: "desc" } });
      console.log(`   Last upload: ${sample.fileName} (${sample.mimeType}, ${sample.size} bytes)`);
    }
  } catch (e) {
    console.log(`   ${FAIL} ${e.message}`);
  }

  // ─────────────────────────────────────────────
  // 6. LOGIN HISTORY
  // ─────────────────────────────────────────────
  console.log("\n🔑 6. LOGIN HISTORY");
  try {
    const logins = await prisma.loginHistory.count();
    const recent = await prisma.loginHistory.findMany({
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { user: { select: { email: true } } },
    });
    console.log(`   ${logins > 0 ? PASS : WARN} Total login records: ${logins}`);
    recent.forEach((l) => {
      const result = l.success ? "SUCCESS" : "FAILED";
      console.log(`         • ${l.user?.email} — ${result} from ${l.ipAddress} at ${l.createdAt.toISOString()}`);
    });
  } catch (e) {
    console.log(`   ${FAIL} ${e.message}`);
  }

  // ─────────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────────
  console.log("\n" + "=".repeat(60));
  console.log("  END OF REPORT");
  console.log("=".repeat(60) + "\n");

  await prisma.$disconnect();
}

run().catch((e) => {
  console.error(e);
  prisma.$disconnect();
});
