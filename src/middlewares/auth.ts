import passport from 'passport';
import httpStatus from 'http-status';
import { NextFunction, Request, Response } from 'express';
import ApiError from '@/helpers/ApiError.js';
import { IUserDB } from '@/models/interfaces/IUser.js';
import { jwtVerifyManually } from '@/configs/passport.js';
import { logger } from '@/configs/logger.js';

const verifyCallback =
    (req: Request, res: Response, resolve: any, reject: any) =>
    // eslint-disable-next-line consistent-return
    async (err: any, user: IUserDB, info: any) => {
        if (err || info || !user) {
            return reject(
                new ApiError(httpStatus.UNAUTHORIZED, req.__('token.errors.unauthorized'))
            );
        }
        logger.info('User authenticated', { user });

        req.userInfo = user;

        resolve();
    };

export const auth = () => async (req: Request, res: Response, next: NextFunction) => {
    new Promise((resolve, reject) => {
        passport.authenticate('jwt', { session: false }, verifyCallback(req, res, resolve, reject))(
            req,
            res,
            next
        );
    })
        .then(() => next())
        .catch((err) => {
            next(err);
        });
};

export const authByManuallVerify =
    () => async (req: Request, res: Response, next: NextFunction) => {
        new Promise((resolve, reject) => {
            jwtVerifyManually(req, verifyCallback(req, res, resolve, reject));
        })
            .then(() => next())
            .catch((err) => {
                next(err);
            });
    };
