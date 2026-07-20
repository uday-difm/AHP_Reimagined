import Redis from "ioredis";

const globalForRedis = globalThis;

let redisClient;
if (globalForRedis.redis) {
  redisClient = globalForRedis.redis;
} else {
  redisClient = new Redis(
    process.env.REDIS_URL || "redis://localhost:6379",
    { maxRetriesPerRequest: null }
  );
  redisClient.on("error", (error) => {
    console.error("Redis client connection error:", error);
  });
}

export const redis = redisClient;

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}
