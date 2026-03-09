import { z } from 'zod';
import { fromError } from 'zod-validation-error';
import { AppConfig } from '@/types/config.types.js';

import 'dotenv/config';

const envValidation = z
    .object({
        NODE_ENV: z.enum(['development', 'ci', 'staging', 'production']),
        PORT: z.coerce.number().default(3000),
        DB_HOST: z.string().default('localhost'),
        DB_USER: z.string(),
        DB_PASS: z.string(),
        DB_NAME: z.string(),
        JWT_SECRET: z.string().describe('JWT secret key'),
        JWT_ACCESS_EXPIRATION_MINUTES: z.coerce
            .number()
            .default(30)
            .describe('minutes after which access tokens expire'),
        JWT_REFRESH_EXPIRATION_DAYS: z.coerce
            .number()
            .default(30)
            .describe('days after which refresh tokens expire'),
        JWT_RESET_PASSWORD_EXPIRATION_MINUTES: z.coerce
            .number()
            .default(10)
            .describe('minutes after which reset password token expires'),
        LOG_FOLDER: z.string(),
        LOG_FILE: z.string(),
        LOG_LEVEL: z.string(),
        REDIS_HOST: z.string().default('127.0.0.1'),
        REDIS_PORT: z.coerce.number().default(6379),
        REDIS_USE_PASSWORD: z.string().default('no'),
        REDIS_PASSWORD: z.string().optional(),
    })
    .passthrough();

export const config: AppConfig = (() => {
    try {
        const envVar = envValidation.parse(process.env);

        return {
            nodeEnv: envVar.NODE_ENV,
            port: envVar.PORT,
            dbHost: envVar.DB_HOST,
            dbUser: envVar.DB_USER,
            dbPass: envVar.DB_PASS,
            dbName: envVar.DB_NAME,
            jwtSecret: envVar.JWT_SECRET,
            jwtAccessExpirationMinutes: envVar.JWT_ACCESS_EXPIRATION_MINUTES,
            jwtRefreshExpirationDays: envVar.JWT_REFRESH_EXPIRATION_DAYS,
            jwtResetPasswordExpirationMinutes: envVar.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
            logFolder: envVar.LOG_FOLDER,
            logFile: envVar.LOG_FILE,
            logLevel: envVar.LOG_LEVEL,
            redisHost: envVar.REDIS_HOST,
            redisPort: envVar.REDIS_PORT,
            redisUsePassword: envVar.REDIS_USE_PASSWORD,
            redisPassword: envVar.REDIS_PASSWORD,
        };
    } catch (error) {
        const validationError = fromError(error);
        throw new Error(`Config validation error: ${validationError.message}`);
    }
})();
