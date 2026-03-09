import { Strategy, ExtractJwt, VerifyCallbackWithRequest, StrategyOptions } from 'passport-jwt';
import jwt from 'jsonwebtoken';
import UserDao from '@/dao/UserDao.js';
import { config } from '@/configs/config.js';
import { tokenTypes } from '@/configs/tokens.js';
import TokenDao from '@/dao/TokenDao.js';
import RedisService from '@/services/RedisService.js';
import models from '@/models/index.js';
import { logger } from '@/configs/logger.js';

const User = models.user;
const jwtOptions: StrategyOptions = {
    secretOrKey: config.jwtSecret,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    passReqToCallback: true,
};

const jwtVerify: VerifyCallbackWithRequest = async (req, payload, done) => {
    try {
        if (payload.type !== tokenTypes.ACCESS) {
            throw new Error(req.__('token.errors.invalid_type'));
        }
        const userDao = new UserDao();
        const tokenDao = new TokenDao();
        const redisService = new RedisService();
        const authorization =
            req.headers.authorization !== undefined ? req.headers.authorization.split(' ') : [];
        if (authorization[1] === undefined) {
            return done(null, false);
        }
        let tokenDoc = await redisService.hasToken(authorization[1], 'access_token');
        if (!tokenDoc) {
            tokenDoc = Boolean(
                await tokenDao.findOneByWhere({
                    token: authorization[1],
                    type: tokenTypes.ACCESS,
                    blacklisted: false,
                })
            );
        }

        if (!tokenDoc) {
            return done(null, false);
        }
        let user = await redisService.getUser(payload.sub);
        if (user) {
            user = new User(user);
        }

        if (!user) {
            logger.warn('User Cache Missed!');
            user = await userDao.findOneByWhere(
                {
                    uuid: payload.sub,
                },
                {
                    include: [
                        {
                            model: models.role,
                            as: 'role',
                        },
                    ],
                }
            );
            if (user) {
                redisService.setUser(user);
            }
        }

        if (!user) {
            return done(null, false);
        }

        return done(null, user);
    } catch (error) {
        return done(error, false);
    }
};

const jwtVerifyManually = async (req, done) => {
    try {
        const authorization =
            req.headers.authorization !== undefined ? req.headers.authorization.split(' ') : [];
        if (authorization[1] === undefined) {
            return done(null, false);
        }
        const payload: any = await jwt.verify(
            authorization[1],
            config.jwtSecret,
            (err, decoded) => {
                if (err) {
                    throw new Error(req.__('token.errors.not_found'));
                }
                // if everything is good, save to request for use in other routes
                return decoded;
            }
        );

        const userDao = new UserDao();
        const tokenDao = new TokenDao();
        const redisService = new RedisService();

        let tokenDoc = await redisService.hasToken(authorization[1], 'access_token');
        if (!tokenDoc) {
            logger.warn('Cache Missed!');
            tokenDoc = Boolean(
                await tokenDao.findOneByWhere({
                    token: authorization[1],
                    type: tokenTypes.ACCESS,
                    blacklisted: false,
                })
            );
        }

        if (!tokenDoc) {
            return done(null, false);
        }
        let user = await redisService.getUser(payload.sub);
        if (user) {
            user = new User(user);
        }

        if (!user) {
            logger.warn('User Cache Missed!');
            user = await userDao.findOneByWhere(
                { uuid: payload.sub },
                {
                    include: [
                        {
                            model: models.role,
                            as: 'role',
                        },
                    ],
                }
            );
            redisService.setUser(user);
        }

        if (!user) {
            return done(null, false);
        }

        return done(null, user);
    } catch (error) {
        return done(error, false);
    }
};

const jwtStrategy = new Strategy(jwtOptions, jwtVerify);

export { jwtStrategy, jwtVerifyManually };
