import { z } from 'zod';
import { ActionType, ResourceType } from '@/configs/constant.js';
import { validationMessages, validationRules } from '@/configs/validation.js';

// Request Body Schema
const RoleCreateRequestBodySchema = z.object({
    role_name: validationRules.required('role_name'),
    permissions: z
        .record(
            z.nativeEnum(ResourceType),
            z.array(z.nativeEnum(ActionType)).min(1, { message: 'validation.at_least_one_action' }),
            { required_error: validationMessages.REQUIRED_FIELD('permissions') }
        )
        .refine((permissions) => Object.keys(permissions).length > 0, {
            message: 'validation.at_least_one_permission',
        }),
});

export const CreateRoleRequestSchema = z.object({
    body: RoleCreateRequestBodySchema,
});

// Update Role Schema
const RoleUpdateRequestBodySchema = z.object({
    role_name: z.string().optional(),
    permissions: z.record(z.nativeEnum(ResourceType), z.array(z.nativeEnum(ActionType))).optional(),
});

export const UpdateRoleRequestSchema = z.object({
    body: RoleUpdateRequestBodySchema,
    params: z.object({
        roleId: z.string({ required_error: validationMessages.REQUIRED_FIELD('roleId') }),
    }),
});

// Bulk Update Role Schema
const BulkRoleUpdateRequestBodySchema = z.object({
    id: z.string({ required_error: validationMessages.REQUIRED_FIELD('id') }),
    role_name: z.string().optional(),
    permissions: z.record(z.nativeEnum(ResourceType), z.array(z.nativeEnum(ActionType))).optional(),
});

export const BulkUpdateRoleRequestSchema = z.object({
    body: z.array(BulkRoleUpdateRequestBodySchema).min(1, {
        message: 'validation.at_least_one_role',
    }),
});

// Delete Role Schema
export const DeleteRoleRequestSchema = z.object({
    params: z.object({
        roleId: z.string({ required_error: validationMessages.REQUIRED_FIELD('roleId') }),
    }),
});

// Types
export type CreateRoleRequestSchemaType = z.infer<typeof RoleCreateRequestBodySchema>;
export type UpdateRoleRequestSchemaType = z.infer<typeof RoleUpdateRequestBodySchema>;
export type BulkUpdateRoleRequestSchemaType = z.infer<typeof BulkRoleUpdateRequestBodySchema>;
