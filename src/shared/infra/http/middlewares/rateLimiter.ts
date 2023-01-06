import { NextFunction, Request, Response } from "express";
import { RateLimiterRedis } from "rate-limiter-flexible";
import * as redis from "redis";

const redisClient = redis.createClient({
  legacyMode: true,
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  },
});

const limiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "rateLimiter",
  points: 5, // 5 requests
  duration: 5, // per 5 seconds by IP
  blockDuration: 60,
});

export default async function rateLimiter(
  request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    await redisClient.connect();
    await limiter.consume(request.ip);

    return next();
  } catch (err) {
    throw new Error("Too many requests");
  } finally {
    redisClient.disconnect();
  }
}
