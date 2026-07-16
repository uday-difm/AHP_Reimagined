import { redis } from "./redis";

export async function checkRateLimit(ip, limitRps = 60) {
  const key = `ratelimit:${ip}`;
  const now = Date.now();
  const windowStart = now - 1000;

  const pipeline = redis.pipeline();
  pipeline.zremrangebyscore(key, 0, windowStart);
  pipeline.zadd(key, now, `${now}-${Math.random()}`);
  pipeline.zcard(key);
  pipeline.expire(key, 2);
  const results = await pipeline.exec();

  return results[2][1] <= limitRps;
}
