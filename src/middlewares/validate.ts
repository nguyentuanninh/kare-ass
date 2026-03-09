import { ZodError, ZodTypeAny } from 'zod';
import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import ApiError from '@/helpers/ApiError.js';
import { logger } from '@/configs/logger.js';

export const validate =
    (schema: ZodTypeAny) => (req: Request, res: Response, next: NextFunction) => {
        try {
            const validatedData = schema.parse({
                body: req.body,
                query: req.query,
                params: req.params,
                headers: req.headers,
            });

            // Replace request data with validated data
            req.body = validatedData.body;
            req.query = validatedData.query;
            req.params = validatedData.params;
            req.headers = validatedData.headers;

            next();
        } catch (err) {
            logger.error(`[${req.id}] Validation error`, err);
            const error = err as ZodError;
            const message = req.__(error.issues[0]?.message ?? 'common.errors.validation_error');
            next(new ApiError(httpStatus.BAD_REQUEST, message));
        }
    };
