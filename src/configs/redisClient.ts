import { createClient } from 'redis';
import { config } from '@/configs/config.js';
import { logger } from '@/configs/logger.js';

const url = `redis://${config.redisHost}:${config.redisPort}`;
const redisClient = createClient({
    url,
    password: config.redisUsePassword.toUpperCase() === 'YES' ? config.redisPassword : undefined,
});

redisClient.on('connect', () => {
    logger.info('Redis client initialized', {
        host: config.redisHost,
        port: config.redisPort,
        status: 'connected',
    });
});

redisClient.on('error', (err) => {
    logger.error('Redis client error', { error: err });
});

export default redisClient;
