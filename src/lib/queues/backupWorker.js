import { Worker } from "bullmq";
import { redis } from "../redis";
import { backupService } from "../../services/backup.service";
import { getS3Client } from "../../../utils/s3Utility";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import prisma from "../prisma";

let worker = null;

/**
 * Uploads a JSON backup to the configured S3/Backblaze B2 bucket.
 * Path: backups/<siteId>/<type>/<YYYY-MM-DD_HH-mm-ss>.json
 */
async function uploadBackupToS3(siteId, type, backupData) {
  const bucket = process.env.S3_BUCKET || process.env.BUCKET || process.env.AWS_BUCKET_NAME;
  const endpoint = process.env.S3_ENDPOINT || process.env.ENDPOINT;

  if (!bucket) throw new Error("S3_BUCKET is not configured in environment variables.");

  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, "-").slice(0, 19); // e.g. 2026-07-20_02-00-00
  const key = `backups/${siteId}/${type}/${timestamp}.json`;

  const json = JSON.stringify(backupData, null, 2);
  const body = Buffer.from(json, "utf-8");

  const s3 = getS3Client();
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: "application/json",
    })
  );

  // Build the public URL for the uploaded file
  const region = process.env.S3_REGION || process.env.REGION || "us-east-1";
  const fileUrl = endpoint
    ? `${endpoint}/${bucket}/${key}`
    : `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

  return { key, fileUrl, sizeBytes: body.length };
}

export function startBackupWorker() {
  if (worker) return worker; // idempotent guard

  worker = new Worker(
    "db-backup",
    async (job) => {
      const { siteId, type } = job.data;
      console.log(`🔄 [BackupWorker] Starting ${type} backup for site: ${siteId}`);

      // 1. Create the Prisma snapshot
      const backupData = await backupService.createBackup(siteId);

      // 2. Upload JSON to S3 / Backblaze B2
      const { key, fileUrl, sizeBytes } = await uploadBackupToS3(siteId, type, backupData);
      console.log(`📦 [BackupWorker] Uploaded to S3: ${key}`);

      // 3. Log the backup to history (stores the S3 URL for download)
      const backupId = await backupService.logBackupHistory(siteId, type, sizeBytes, fileUrl);

      // 4. Create a dashboard notification alert
      try {
        await prisma.notificationAlert.create({
          data: {
            siteId,
            title: `Automated ${type === "weekly" ? "Weekly" : "Daily"} Backup Completed`,
            message: `Backup saved to S3 — Size: ${(sizeBytes / 1024).toFixed(1)} KB — ID: ${backupId}`,
            type: "BLOG_ALERT",
          },
        });
      } catch (notifErr) {
        console.error("[BackupWorker] Failed to create notification alert:", notifErr.message);
      }

      console.log(`✅ [BackupWorker] ${type} backup complete — ID: ${backupId} | URL: ${fileUrl}`);
      return { backupId, sizeBytes, fileUrl };
    },
    { connection: redis, concurrency: 1 }
  );

  worker.on("completed", (job, result) => {
    console.log(`[BackupWorker] Job ${job.id} done. File: ${result.fileUrl}`);
  });

  worker.on("failed", (job, err) => {
    console.error(`[BackupWorker] Job ${job?.id} failed:`, err.message);
  });

  return worker;
}

