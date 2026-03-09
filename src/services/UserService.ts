import httpStatus from 'http-status';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';
import { logger } from '@/configs/logger.js';
import UserDao from '@/dao/UserDao.js';
import responseHandler from '@/helpers/responseHandler.js';
import { UserCreateRequestSchemaType } from '@/schemas/users.schema.js';
import { UserStatus } from '@/configs/constant.js';
import { useI18n } from '@/middlewares/asyncContext.js';
import { ApiResponse } from '@/types/api.types.js';
import { IUserDB, IUserResponse } from '@/models/interfaces/IUser.js';

export default class UserService {
    private userDao: UserDao;

    constructor() {
        this.userDao = new UserDao();
    }

    createUser = async (
        userBodyReq: UserCreateRequestSchemaType
    ): Promise<ApiResponse<IUserResponse | undefined>> => {
        const i18n = useI18n();
        try {
            if ((await this.userDao.getCountByWhere({ username: userBodyReq.username })) > 0) {
                return responseHandler.returnError(
                    httpStatus.BAD_REQUEST,
                    i18n.__('user.errors.username_taken')
                );
            }

            const uuidValue = uuidv4();

            const userData = await this.userDao.create({
                username: userBodyReq.username,
                password: bcrypt.hashSync(userBodyReq.password, 8),
                uuid: uuidValue,
                status: UserStatus.ACTIVE,
                display_name: userBodyReq.display_name || '',
                metadata: userBodyReq.metadata || {},
                role_id: userBodyReq.role_id,
                created_at: new Date(),
                updated_at: new Date(),
            });

            if (!userData) {
                return responseHandler.returnError(
                    httpStatus.BAD_REQUEST,
                    i18n.__('user.errors.create_failed')
                );
            }

            const { password, id, ...userResponse } = userData.toJSON();

            return responseHandler.returnSuccess(
                httpStatus.CREATED,
                i18n.__('user.success.created'),
                userResponse
            );
        } catch (e) {
            logger.error('createUser', e);
            throw Error(i18n.__('user.errors.create_failed'));
        }
    };

    isUsernameExists = async (username: string): Promise<ApiResponse> => {
        const i18n = useI18n();
        if ((await this.userDao.getCountByWhere({ username })) === 0) {
            return responseHandler.returnError(
                httpStatus.BAD_REQUEST,
                i18n.__('user.errors.username_not_found')
            );
        }
        return responseHandler.returnSuccess(httpStatus.OK, i18n.__('user.success.username_found'));
    };

    getUserByUuid = async (uuid: string): Promise<IUserDB | null> =>
        this.userDao.findOneByWhere({ uuid });

    changePassword = async (req: Request): Promise<ApiResponse> => {
        const i18n = useI18n();
        try {
            const { password, confirm_password, old_password } = req.body;
            if (req.userInfo === undefined) {
                return responseHandler.returnError(
                    httpStatus.UNAUTHORIZED,
                    i18n.__('user.errors.unauthorized')
                );
            }
            const user = await this.userDao.findOneByWhere({ uuid: req.userInfo.uuid });

            if (!user) {
                return responseHandler.returnError(
                    httpStatus.NOT_FOUND,
                    i18n.__('user.errors.not_found')
                );
            }

            if (password !== confirm_password) {
                return responseHandler.returnError(
                    httpStatus.BAD_REQUEST,
                    i18n.__('user.errors.password_mismatch')
                );
            }

            const isPasswordValid = await bcrypt.compare(old_password, user.password);
            if (!isPasswordValid) {
                return responseHandler.returnError(
                    httpStatus.BAD_REQUEST,
                    i18n.__('user.errors.wrong_old_password')
                );
            }
            const affectedRows = await this.userDao.updateWhere(
                { password: bcrypt.hashSync(password, 8) },
                { where: { uuid: user.uuid } }
            );

            if (affectedRows > 0) {
                return responseHandler.returnSuccess(
                    httpStatus.OK,
                    i18n.__('user.success.password_updated')
                );
            }

            return responseHandler.returnError(
                httpStatus.BAD_REQUEST,
                i18n.__('user.errors.password_update_failed')
            );
        } catch (e) {
            logger.error('changePassword', e);
            throw Error(i18n.__('user.errors.password_update_failed'));
        }
    };
}
