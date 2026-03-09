import httpStatus from 'http-status';
import RoleDao from '@/dao/RoleDao.js';
import responseHandler from '@/helpers/responseHandler.js';
import { logger } from '@/configs/logger.js';
import snakeCase from 'lodash/snakeCase.js';
import {
    CreateRoleRequestSchemaType,
    UpdateRoleRequestSchemaType,
    BulkUpdateRoleRequestSchemaType,
} from '@/schemas/roles.schema.js';
import { IRole } from '@/models/interfaces/IRole.js';
import { useI18n } from '@/middlewares/asyncContext.js';
import { ApiResponse, BulkOperationResponse } from '@/types/api.types.js';
import models from '@/models/index.js';

export default class RoleService {
    private roleDao: RoleDao;

    constructor() {
        this.roleDao = new RoleDao();
    }

    createRole = async (
        roleData: CreateRoleRequestSchemaType
    ): Promise<ApiResponse<IRole | null>> => {
        const i18n = useI18n();
        const transaction = await models.sequelize.transaction();
        try {
            const newRoleId = snakeCase(roleData.role_name);
            const existingRole = await this.roleDao.findById(newRoleId);
            if (existingRole) {
                await transaction.rollback();
                return responseHandler.returnError(
                    httpStatus.BAD_REQUEST,
                    i18n.__('role.errors.name_taken')
                );
            }

            const role = await this.roleDao.create(
                {
                    id: newRoleId,
                    role_name: roleData.role_name,
                    permissions: roleData.permissions,
                },
                { transaction }
            );

            await transaction.commit();

            return responseHandler.returnSuccess(
                httpStatus.CREATED,
                i18n.__('role.success.created'),
                role
            );
        } catch (error) {
            await transaction.rollback();
            logger.error('createRole', error);
            throw Error(i18n.__('role.errors.create_failed'));
        }
    };

    updateRole = async (
        roleId: string,
        roleData: UpdateRoleRequestSchemaType
    ): Promise<ApiResponse<IRole | null>> => {
        const i18n = useI18n();
        try {
            const existingRole = await this.roleDao.findById(roleId);
            if (!existingRole) {
                return responseHandler.returnError(
                    httpStatus.NOT_FOUND,
                    i18n.__('role.errors.not_found')
                );
            }

            const updatedRoleData: Partial<UpdateRoleRequestSchemaType> = {};

            if (roleData.role_name !== undefined) {
                updatedRoleData.role_name = roleData.role_name;
            }

            if (roleData.permissions !== undefined) {
                updatedRoleData.permissions = {
                    ...existingRole.permissions,
                    ...roleData.permissions,
                };
            }

            if (Object.keys(updatedRoleData).length === 0) {
                return responseHandler.returnError(
                    httpStatus.BAD_REQUEST,
                    i18n.__('role.errors.no_fields')
                );
            }

            const updatedRole = await this.roleDao.updateById(updatedRoleData, {
                id: roleId,
            });
            return responseHandler.returnSuccess(
                httpStatus.OK,
                i18n.__('role.success.updated'),
                updatedRole ? await this.roleDao.findById(roleId) : null
            );
        } catch (error) {
            logger.error('updateRole', error);
            throw Error(i18n.__('role.errors.update_failed'));
        }
    };

    deleteRole = async (roleId: string): Promise<ApiResponse<null>> => {
        const i18n = useI18n();
        try {
            const existingRole = await this.roleDao.findById(roleId);
            if (!existingRole) {
                return responseHandler.returnError(
                    httpStatus.NOT_FOUND,
                    i18n.__('role.errors.not_found')
                );
            }

            await this.roleDao.deleteByWhere({ id: roleId });
            return responseHandler.returnSuccess(
                httpStatus.OK,
                i18n.__('role.success.deleted'),
                null
            );
        } catch (error) {
            logger.error('deleteRole', error);
            throw Error(i18n.__('role.errors.delete_failed'));
        }
    };

    getRoleById = async (roleId: string): Promise<ApiResponse<IRole | null>> => {
        const i18n = useI18n();
        try {
            const role = await this.roleDao.findById(roleId);
            if (!role) {
                return responseHandler.returnError(
                    httpStatus.NOT_FOUND,
                    i18n.__('role.errors.not_found')
                );
            }

            return responseHandler.returnSuccess(
                httpStatus.OK,
                i18n.__('common.success.retrieved'),
                role
            );
        } catch (error) {
            logger.error('getRoleById', error);
            throw Error(i18n.__('role.errors.retrieve_failed'));
        }
    };

    getAllRoles = async (): Promise<ApiResponse<IRole[]>> => {
        const i18n = useI18n();
        try {
            const roles = await this.roleDao.findAll();
            return responseHandler.returnSuccess(
                httpStatus.OK,
                i18n.__('common.success.retrieved'),
                roles
            );
        } catch (error) {
            logger.error('getAllRoles', error);
            throw Error(i18n.__('role.errors.retrieve_failed'));
        }
    };

    bulkUpdateRoles = async (
        roles: BulkUpdateRoleRequestSchemaType[]
    ): Promise<ApiResponse<BulkOperationResponse<IRole>>> => {
        const i18n = useI18n();
        const transaction = await models.sequelize.transaction();
        try {
            const results = await Promise.all(
                roles.map(async (roleData) => {
                    try {
                        const result = await this.updateRole(roleData.id, {
                            role_name: roleData.role_name,
                            permissions: roleData.permissions,
                        });
                        return {
                            id: roleData.id,
                            success: true,
                            data: result.data || undefined,
                        };
                    } catch (error) {
                        logger.error(`Error updating role ${roleData.id}:`, error);
                        return {
                            id: roleData.id,
                            success: false,
                            error:
                                error instanceof Error
                                    ? error.message
                                    : i18n.__('common.errors.unknown_error'),
                        };
                    }
                })
            );

            await transaction.commit();

            return responseHandler.returnSuccess(httpStatus.OK, i18n.__('common.success.updated'), {
                updated: results.filter((r) => r.success).length,
                failed: results.filter((r) => !r.success).length,
                details: results,
            });
        } catch (error) {
            await transaction.rollback();
            logger.error('bulkUpdateRoles', error);
            throw Error(i18n.__('role.errors.update_failed'));
        }
    };
}
