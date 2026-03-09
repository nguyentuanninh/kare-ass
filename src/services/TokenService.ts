import jwt from 'jsonwebtoken';
import { Op, WhereOptions } from 'sequelize';
import { addDays, addMinutes, getUnixTime } from 'date-fns';
import { tokenTypes } from '@/configs/tokens.js';
import TokenDao from '@/dao/TokenDao.js';
import RedisService from '@/services/RedisService.js';
import { config } from '@/configs/config.js';
import { IUserResponse } from '@/models/interfaces/IUser.js';
import { parseTime } from '@/helpers/timeHelper.js';
import { ITokenDB, ITokens } from '@/models/interfaces/IToken.js';
import { useI18n } from '@/middlewares/asyncContext.js';

export default class TokenService {
    private tokenDao: TokenDao;

    private redisService: RedisService;

    constructor() {
        this.tokenDao = new TokenDao();
        this.redisService = new RedisService();
    }

    generateToken = (
        uuid: string,
        expires: Date,
        type: string,
        secret = config.jwtSecret
    ): string => {
        const payload = {
            sub: uuid,
            iat: getUnixTime(new Date()),
            exp: getUnixTime(parseTime(expires)),
            type,
        };
        return jwt.sign(payload, secret);
    };

    verifyToken = async (token: string, type: string): Promise<ITokenDB> => {
        const i18n = useI18n();
        const payload: any = await jwt.verify(token, config.jwtSecret, (err, decoded) => {
            if (err) {
                throw new Error(i18n.__('token.errors.not_found'));
            } else {
                return decoded;
            }
        });

        const tokenDoc = await this.tokenDao.findOneByWhere({
            token,
            type,
            user_uuid: payload.sub,
            blacklisted: false,
        });
        if (!tokenDoc) {
            throw new Error(i18n.__('token.errors.not_found'));
        }
        return tokenDoc;
    };

    saveToken = async (
        token: string,
        userId: number,
        expires: Date,
        type: string,
        blacklisted = false
    ): Promise<ITokenDB> =>
        this.tokenDao.create({
            token,
            user_id: userId,
            expires,
            type,
            blacklisted,
        });

    saveMultipleTokens = async (tokens: Partial<ITokenDB>[]): Promise<ITokenDB[]> =>
        this.tokenDao.bulkCreate(tokens);

    removeTokenById = async (id: number): Promise<boolean> => {
        const affectedRows = await this.tokenDao.deleteByWhere({ id });
        return affectedRows > 0;
    };

    generateAuthTokens = async (user: IUserResponse): Promise<ITokens> => {
        try {
            const accessTokenExpires: Date = addMinutes(
                new Date(),
                config.jwtAccessExpirationMinutes
            );
            const accessToken = this.generateToken(
                user.uuid,
                accessTokenExpires,
                tokenTypes.ACCESS
            );
            const refreshTokenExpires: Date = addDays(new Date(), config.jwtRefreshExpirationDays);
            const refreshToken = this.generateToken(
                user.uuid,
                refreshTokenExpires,
                tokenTypes.REFRESH
            );
            const authTokens: Partial<ITokenDB>[] = [];
            authTokens.push({
                token: accessToken,
                user_uuid: user.uuid,
                expires: accessTokenExpires,
                type: tokenTypes.ACCESS,
                blacklisted: false,
            });
            authTokens.push({
                token: refreshToken,
                user_uuid: user.uuid,
                expires: refreshTokenExpires,
                type: tokenTypes.REFRESH,
                blacklisted: false,
            });

            await this.saveMultipleTokens(authTokens);
            const expiredAccessTokenWhere: WhereOptions<ITokenDB> = {
                expires: {
                    [Op.lt]: new Date(),
                },
                type: tokenTypes.ACCESS,
            };
            await this.tokenDao.deleteByWhere(expiredAccessTokenWhere);
            const expiredRefreshTokenWhere: WhereOptions<ITokenDB> = {
                expires: {
                    [Op.lt]: new Date(),
                },
                type: tokenTypes.REFRESH,
            };
            await this.tokenDao.deleteByWhere(expiredRefreshTokenWhere);
            const tokens: ITokens = {
                access: {
                    token: accessToken,
                    expires: accessTokenExpires,
                    type: tokenTypes.ACCESS,
                },
                refresh: {
                    token: refreshToken,
                    expires: refreshTokenExpires,
                    type: tokenTypes.REFRESH,
                },
            };
            await this.redisService.createTokens(user.uuid, tokens);

            return tokens;
        } catch (error) {
            return Promise.reject(error);
        }
    };
}
