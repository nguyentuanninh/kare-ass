import { RateLimiterRedis } from 'rate-limiter-flexible';
import redisClient from '@/configs/redisClient.js';
import { RequestHandler } from 'express';
import { config } from '@/configs/config.js';

// Rate limiter for public routes
const publicRateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'rate-limiter-public',
    points: 3,
    duration: 1, // per 1 second by IP
    blockDuration: 60 * 60, // 1 hour
});

// Rate limiter for private routes with stricter limits
const privateRateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'rate-limiter-private',
    points: 10,
    duration: 1, // per 1 second by user uuid
    blockDuration: 60 * 60, // 1 hour
});

export const publicRateLimit: RequestHandler = async (req, res, next) => {
    try {
        if (config.nodeEnv === 'production' || config.nodeEnv === 'staging') {
            await publicRateLimiter.consume(String(req.ip));
        }
        next();
    } catch {
        res.status(429).send(req.__('common.errors.too_many_requests'));
    }
};

export const privateRateLimit: RequestHandler = async (req, res, next) => {
    try {
        if (config.nodeEnv === 'production' || config.nodeEnv === 'staging') {
            await privateRateLimiter.consume(String(req.userInfo?.uuid ?? req.ip));
        }
        next();
    } catch {
        res.status(429).send(req.__('common.errors.too_many_requests'));
    }
};
