import { logger } from '@/configs/logger.js';

export const encodeToBase64 = (string) => Buffer.from(string).toString('base64');

export const decodeToAscii = (encodedString) =>
    Buffer.from(encodedString, 'base64').toString('ascii');

export const sleep = (ms: number) =>
    new Promise((resolve) => {
        logger.info('Sleeping', { ms });
        setTimeout(resolve, ms);
    });
