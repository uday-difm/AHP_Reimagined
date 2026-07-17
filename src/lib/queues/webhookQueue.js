import { Queue } from "bullmq";
import { redis } from "../redis";

export const webhookQueue = new Queue("webhook-delivery", { connection: redis });
