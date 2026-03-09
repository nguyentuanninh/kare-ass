import httpStatus from 'http-status';
import { NextFunction, Request, Response } from 'express';
import { config } from '@/configs/config.js';
import { logger } from '@/configs/logger.js';
import ApiError from '@/helpers/ApiError.js';
import { ApiResponse } from '@/types/api.types.js';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    let { code, message } = err;

    if (config.nodeEnv === 'production' && !err.isOperational) {
        code = httpStatus.INTERNAL_SERVER_ERROR;
        message = req.__('common.errors.server_error');
    }

    res.locals.errorMessage = message;

    const response: ApiResponse = {
        success: false,
        code,
        message,
        ...(config.nodeEnv !== 'production' && { stack: err.stack }),
    };

    // Log error with context
    const port = req.socket.localPort;
    const logMessage =
        config.nodeEnv === 'production'
            ? `[${req.id}] [${code}]: ${req.method} ${req.path} - ${message}`
            : `[${req.id}] [${req.ip}]:${port} [${code}]: ${req.method} ${req.path} - ${message}`;

    logger.log('error', logMessage, {
        requestId: req.id,
        code,
        message,
        path: req.path,
        method: req.method,
        ip: req.ip,
        port,
        userAgent: req.get('user-agent'),
        body: req.body,
        params: req.params,
        query: req.query,
        ...(config.nodeEnv !== 'production' && { stack: err.stack }),
    });

    res.status(code).send(response);
};

export const errorConverter = (err: any, req: Request, res: Response, next: NextFunction) => {
    let error = err;
    if (!(error instanceof ApiError)) {
        const code = error.code ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;
        const message = error.message || req.__('common.errors.server_error');
        error = new ApiError(code, message, false, err.stack);
    }
    next(error);
};
