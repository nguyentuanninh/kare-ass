import { Router } from 'express';
import RoleController from '@/controllers/RoleController.js';
import { auth } from '@/middlewares/auth.js';
import { validate } from '@/middlewares/validate.js';
import { privateRateLimit } from '@/middlewares/rateLimit.js';
import {
    CreateRoleRequestSchema,
    UpdateRoleRequestSchema,
    DeleteRoleRequestSchema,
    BulkUpdateRoleRequestSchema,
} from '@/schemas/index';

const router = Router();

const roleController = new RoleController();

// List all roles
router.get('/', auth(), privateRateLimit, roleController.getAllRoles);

// Get a specific role
router.get('/:roleId', auth(), privateRateLimit, roleController.getRoleById);

// Create a new role
router.post(
    '/',
    auth(),
    privateRateLimit,
    validate(CreateRoleRequestSchema),
    roleController.createRole
);

// Update multiple roles
router.put(
    '/',
    auth(),
    privateRateLimit,
    validate(BulkUpdateRoleRequestSchema),
    roleController.bulkUpdateRoles
);

// Update a specific role
router.put(
    '/:roleId',
    auth(),
    privateRateLimit,
    validate(UpdateRoleRequestSchema),
    roleController.updateRole
);

// Delete a specific role
router.delete(
    '/:roleId',
    auth(),
    privateRateLimit,
    validate(DeleteRoleRequestSchema),
    roleController.deleteRole
);

export default router;
