import { RequestHandler } from 'express';
import RoleService from '@/services/RoleService.js';

export default class RoleController {
    private roleService: RoleService;

    constructor() {
        this.roleService = new RoleService();
    }

    createRole: RequestHandler = async (req, res, next) => {
        try {
            const response = await this.roleService.createRole(req.body);
            if (response.success) {
                res.status(response.code).send(response);
            } else {
                next(response.error);
            }
        } catch (error) {
            next(error);
        }
    };

    updateRole: RequestHandler = async (req, res, next) => {
        try {
            const response = await this.roleService.updateRole(req.params.roleId, req.body);
            if (response.success) {
                res.status(response.code).send(response);
            } else {
                next(response.error);
            }
        } catch (error) {
            next(error);
        }
    };

    deleteRole: RequestHandler = async (req, res, next) => {
        try {
            const response = await this.roleService.deleteRole(req.params.roleId);
            if (response.success) {
                res.status(response.code).send(response);
            } else {
                next(response.error);
            }
        } catch (error) {
            next(error);
        }
    };

    getAllRoles: RequestHandler = async (req, res, next) => {
        try {
            const response = await this.roleService.getAllRoles();
            if (response.success) {
                res.status(response.code).send(response);
            } else {
                next(response.error);
            }
        } catch (error) {
            next(error);
        }
    };

    getRoleById: RequestHandler = async (req, res, next) => {
        try {
            const response = await this.roleService.getRoleById(req.params.roleId);
            if (response.success) {
                res.status(response.code).send(response);
            } else {
                next(response.error);
            }
        } catch (error) {
            next(error);
        }
    };

    bulkUpdateRoles: RequestHandler = async (req, res, next) => {
        try {
            const response = await this.roleService.bulkUpdateRoles(req.body);
            if (response.success) {
                res.status(response.code).send(response);
            } else {
                next(response.error);
            }
        } catch (error) {
            next(error);
        }
    };
}
