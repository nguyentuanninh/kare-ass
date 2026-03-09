import { validationRules } from '@/configs/validation.js';
import { z } from 'zod';

// Request Body Schemas
const UserCreateRequestBodySchema = z
    .object({
        username: validationRules.username,
        password: validationRules.password,
        confirm_password: validationRules.password,
        display_name: z.string().min(1).optional(),
        metadata: z.record(z.any()).optional(),
        role_id: validationRules.required('role_id'),
    })
    .refine((data) => data.password === data.confirm_password, {
        message: 'validation.password_mismatch',
        path: ['confirm_password'],
    });

export const UserCreateRequestSchema = z.object({
    body: UserCreateRequestBodySchema,
});

const UserUpdateRequestBodySchema = z.object({
    username: validationRules.username,
    display_name: z.string().min(1).optional(),
    metadata: z.record(z.any()).optional(),
    role_id: z.string().optional(),
});

export const UserUpdateRequestSchema = z.object({
    body: UserUpdateRequestBodySchema,
});

// Types
export type UserCreateRequestSchemaType = z.infer<typeof UserCreateRequestBodySchema>;
export type UserUpdateRequestSchemaType = z.infer<typeof UserUpdateRequestBodySchema>;
