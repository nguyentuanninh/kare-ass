import cors from 'cors';
import passport from 'passport';
import express, { Express, NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import helmet from 'helmet';
import db from '@/models/index.js';
import createRequestId from '@/middlewares/requestId.js';
import { asyncContextMiddleware } from '@/middlewares/asyncContext.js';
import routes from '@/routes/index.js';
import docsRoute from '@/routes/docsRoute.js';
import { jwtStrategy } from '@/configs/passport.js';
import ApiError from '@/helpers/ApiError.js';
import { errorConverter, errorHandler } from '@/middlewares/error.js';
import redisClient from '@/configs/redisClient.js';
import { httpLogger, logger } from '@/configs/logger.js';
import responseHandler from '@/helpers/responseHandler.js';
import { config } from '@/configs/config.js';
import i18n from '@/i18n/index.js';

process.env.PWD = process.cwd();

export const app: Express = express();

// Add request ID middleware
app.use(createRequestId());

// Add async context middleware
app.use(asyncContextMiddleware);

// Add i18n middleware
app.use(i18n.init);

// Add HTTP request logging
app.use(httpLogger);

// enable cors
// options for cors middleware
app.use(
    cors({
        origin: '*',
    })
);

// To enable securities in HTTP headers
app.use(helmet());

app.use(express.static(`${process.env.PWD}/public`));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// jwt authentication
passport.use('jwt', jwtStrategy);
app.use(passport.initialize());

// Development-only test endpoints
if (config.nodeEnv !== 'production') {
    app.get('/api/v1/health', async (req: Request, res: Response) => {
        const healthData = {
            environment: config.nodeEnv,
            timestamp: new Date().toISOString(),
        };
        const response = responseHandler.returnSuccess(
            httpStatus.OK,
            req.__('common.success.created'),
            healthData
        );
        res.status(response.code).json(response);
    });
}

app.use('/api/v1', routes);

if (config.nodeEnv !== 'production') {
    // API documentation
    app.use('/api/v1/docs', docsRoute);
}

// send back a 404 error for any unknown api request
app.use((req: Request, res: Response, next: NextFunction) => {
    next(new ApiError(httpStatus.NOT_FOUND, req.__('common.errors.not_found')));
});

// convert error to ApiError, if needed
app.use(errorConverter);
// handle error
app.use(errorHandler);

redisClient.on('error', (err) => {
    logger.error('Redis client error', { error: err });
    redisClient.quit();
});
redisClient.connect();

if (config.nodeEnv !== 'development') {
    db.sequelize.sync({ force: true });
}
