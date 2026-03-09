import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { RequestHandler } from 'express';
import { config } from './config';

// Define log levels and their colors
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};

// Add colors to winston
winston.addColors(colors);

// Custom format for error objects
const enumerateErrorFormat = winston.format((info) => {
    if (info instanceof Error) {
        return {
            ...info,
            message: info.message,
            stack: info.stack,
        };
    }

    if (info.message instanceof Error) {
        return {
            ...info,
            message: info.message,
            stack: info.message.stack,
        };
    }

    return info;
});

// Custom format for redacting sensitive data
const deepObjectRedactor = (obj: any): any => {
    const sensitiveKeys = [
        'password',
        'confirm_password',
        'token',
        'authorization',
        'uuid',
        'email',
        'phone_number',
        'address',
        'ip',
        'ip_address',
        'client_ip',
        'remote_address',
    ].map((key) => key.toLowerCase());

    if (!obj || typeof obj !== 'object') return obj;

    const result = { ...obj };
    Object.keys(result).forEach((key) => {
        if (typeof result[key] === 'object') {
            result[key] = deepObjectRedactor(result[key]);
        } else if (sensitiveKeys.includes(key.toLowerCase()) && result[key]) {
            result[key] = '[REDACTED]';
        }
    });
    return result;
};

const redactSensitiveData = winston.format((info) => {
    // Skip redaction in non-production environments
    if (config.nodeEnv !== 'production') return info;

    // Redact the entire info object
    return deepObjectRedactor(info);
});

// Create the transport with improved configuration
const transport = new DailyRotateFile({
    filename: config.logFolder + config.logFile,
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '3',
    format: winston.format.combine(
        enumerateErrorFormat(),
        winston.format.timestamp(),
        redactSensitiveData(),
        winston.format.json(),
        ...(config.nodeEnv === 'production' ? [] : [winston.format.prettyPrint()])
    ),
});

// Create console transport with colors
const consoleTransport = new winston.transports.Console({
    level: config.logLevel,
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
    ),
});

export const logger = winston.createLogger({
    level: config.logLevel,
    levels,
    format: winston.format.combine(
        enumerateErrorFormat(),
        winston.format.timestamp(),
        redactSensitiveData()
    ),
    transports: [transport, consoleTransport],
    // Don't exit on error
    exitOnError: false,
});

// Add HTTP request logging middleware
export const httpLogger: RequestHandler = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        // Only log successful requests (2xx)
        if (res.statusCode >= 200 && res.statusCode < 300) {
            const port = req.socket.localPort;
            const logMessage =
                config.nodeEnv === 'production'
                    ? `[${req.id}] [${res.statusCode}]: ${req.method} ${req.originalUrl}`
                    : `[${req.id}] [${req.ip}]:${port} [${res.statusCode}]: ${req.method} ${req.originalUrl}`;

            logger.log('http', logMessage, {
                requestId: req.id,
                method: req.method,
                path: req.originalUrl,
                status: res.statusCode,
                duration: `${duration}ms`,
                ip: req.ip,
                port,
                userAgent: req.get('user-agent'),
                body: req.body,
                params: req.params,
                query: req.query,
            });
        }
    });
    next();
};
