import { type Dialect } from 'sequelize';
import { logger } from '@/configs/logger.js';
import { config } from './config';

export default {
    logging: (message) => {
        // Only log errors and important events
        if (message.toLowerCase().includes('error')) {
            logger.error('Database error', { error: message });
        } else if (config.nodeEnv === 'development' && message.includes('Executing')) {
            // In development, log queries for debugging
            logger.debug('Database query', { query: message });
        }
    },
    username: config.dbUser,
    password: config.dbPass,
    database: config.dbName,
    host: config.dbHost,
    dialect: 'mysql' as Dialect,
    dialectOptions: {
        bigNumberStrings: true,
    },
    pool: {
        max: 30,
        min: 0,
        acquire: 15000,
        idle: 10000,
    },
};
