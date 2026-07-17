import { Queue } from "bullmq";
import { redis } from "../redis";

export const systemEmailQueue = new Queue("system-email", { connection: redis });
