import httpStatus from 'http-status';
import bcrypt from 'bcrypt';
import TokenDao from '@/dao/TokenDao.js';
import UserDao from '@/dao/UserDao.js';
import responseHandler from '@/helpers/responseHandler.js';
import { tokenTypes } from '@/configs/tokens.js';
import RedisService from '@/services/RedisService.js';
import { IUserResponse } from '@/models/interfaces/IUser.js';
import TokenService from '@/services/TokenService.js';
import UserService from '@/services/UserService.js';
import { logger } from '@/configs/logger.js';
import { UserCreateRequestSchemaType } from '@/schemas/users.schema.js';
import { useI18n } from '@/middlewares/asyncContext.js';
import { ApiResponse } from '@/types/api.types.js';
import { ITokens } from '@/models/interfaces/IToken.js';
import models from '@/models';

interface AuthResponse {
    user: IUserResponse;
    tokens: ITokens;
}

export default class AuthService {
    private userDao: UserDao;

    private tokenDao: TokenDao;

    private redisService: RedisService;

    private tokenService: TokenService;

    private userService: UserService;

    constructor() {
        this.userDao = new UserDao();
        this.tokenDao = new TokenDao();
        this.redisService = new RedisService();
        this.tokenService = new TokenService();
        this.userService = new UserService();
    }

    registerUser = async (
        userData: UserCreateRequestSchemaType
    ): Promise<ApiResponse<AuthResponse | undefined>> => {
        const i18n = useI18n();
        try {
            const createUserResponse = await this.userService.createUser(userData);
            if (!createUserResponse.success) {
                return { ...createUserResponse, data: undefined };
            }

            const tokens = await this.tokenService.generateAuthTokens(createUserResponse.data!);

            return responseHandler.returnSuccess(
                createUserResponse.code,
                i18n.__('auth.success.registered'),
                {
                    user: createUserResponse.data!,
                    tokens,
                }
            );
        } catch (error) {
            logger.error('registerUser', error);
            throw Error(i18n.__('auth.errors.register_failed'));
        }
    };

    loginWithUsernamePassword = async (
        username: string,
        password: string
    ): Promise<ApiResponse<AuthResponse>> => {
        const i18n = useI18n();
        try {
            const user = await this.userDao.findOneByWhere(
                { username },
                {
                    include: [
                        {
                            model: models.role,
                            as: 'role',
                        },
                    ],
                }
            );
            if (user === null || user === undefined) {
                return responseHandler.returnError(
                    httpStatus.BAD_REQUEST,
                    i18n.__('auth.errors.invalid_username')
                );
            }
            const isPasswordValid = await bcrypt.compare(password, user.password);
            const { password: unusedPassword, id, ...userWithoutSensitiveData } = user.toJSON();

            if (!isPasswordValid) {
                return responseHandler.returnError(
                    httpStatus.BAD_REQUEST,
                    i18n.__('auth.errors.wrong_password')
                );
            }

            const tokens = await this.tokenService.generateAuthTokens(userWithoutSensitiveData);
            return responseHandler.returnSuccess(httpStatus.OK, i18n.__('auth.success.logged_in'), {
                user: userWithoutSensitiveData,
                tokens,
            });
        } catch (error) {
            logger.error('loginWithUsernamePassword', error);
            throw Error(i18n.__('auth.errors.login_failed'));
        }
    };

    refreshTokens = async (refreshToken: string): Promise<ApiResponse<ITokens>> => {
        const i18n = useI18n();
        try {
            const refreshTokenDoc = await this.tokenService.verifyToken(
                refreshToken,
                tokenTypes.REFRESH
            );
            const user = await this.userService.getUserByUuid(refreshTokenDoc.user_uuid);
            if (user === null || user === undefined) {
                return responseHandler.returnError(
                    httpStatus.BAD_GATEWAY,
                    i18n.__('user.errors.not_found')
                );
            }
            if (refreshTokenDoc.id === undefined) {
                return responseHandler.returnError(
                    httpStatus.BAD_GATEWAY,
                    i18n.__('token.errors.invalid_refresh')
                );
            }
            await this.tokenService.removeTokenById(refreshTokenDoc.id);
            const tokens = await this.tokenService.generateAuthTokens(user);
            return responseHandler.returnSuccess(
                httpStatus.OK,
                i18n.__('auth.success.tokens_refreshed'),
                tokens
            );
        } catch (error) {
            logger.error('refreshTokens', error);
            throw Error(i18n.__('auth.errors.refresh_failed'));
        }
    };

    logout = async (accessToken: string, refreshToken: string): Promise<ApiResponse<undefined>> => {
        const i18n = useI18n();
        try {
            const refreshTokenDoc = await this.tokenDao.findOneByWhere({
                token: refreshToken,
                type: tokenTypes.REFRESH,
                blacklisted: false,
            });
            if (!refreshTokenDoc) {
                return responseHandler.returnError(
                    httpStatus.BAD_REQUEST,
                    i18n.__('token.errors.invalid_refresh')
                );
            }
            await this.tokenDao.deleteByWhere({
                token: refreshToken,
                type: tokenTypes.REFRESH,
                blacklisted: false,
            });
            await this.tokenDao.deleteByWhere({
                token: accessToken,
                type: tokenTypes.ACCESS,
                blacklisted: false,
            });
            await this.redisService.removeToken(accessToken, 'access_token');
            await this.redisService.removeToken(refreshToken, 'refresh_token');
            return responseHandler.returnSuccess(httpStatus.OK, i18n.__('auth.success.logged_out'));
        } catch (error) {
            logger.error('logout', error);
            throw Error(i18n.__('auth.errors.logout_failed'));
        }
    };
}
