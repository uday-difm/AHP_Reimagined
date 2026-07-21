import { Queue } from "bullmq";
import { redis } from "../redis";

export const searchQueue = new Queue("search-index", {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: false, // Keep failed jobs for inspection
  },
});

export async function queueUpsertContent(type, sourceId) {
  try {
    await searchQueue.add(
      "upsert-content",
      { type, sourceId },
      { jobId: `upsert:${type}:${sourceId}` } // Idempotent job ID
    );
  } catch (error) {
    console.error(`[SearchQueue] Failed to queue upsert for ${type}:${sourceId}`, error);
  }
}

export async function queueDeleteContent(type, sourceId) {
  try {
    await searchQueue.add(
      "delete-content",
      { type, sourceId },
      { jobId: `delete:${type}:${sourceId}` } // Idempotent job ID
    );
  } catch (error) {
    console.error(`[SearchQueue] Failed to queue delete for ${type}:${sourceId}`, error);
  }
}
