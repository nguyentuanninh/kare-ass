import { validationRules } from '@/configs/validation.js';
import { z } from 'zod';

// Request Schemas
const LoginRequestBodySchema = z.object({
    username: validationRules.username,
    password: validationRules.password,
});

export const LoginRequestSchema = z.object({
    body: LoginRequestBodySchema,
});

const ChangePasswordRequestBodySchema = z
    .object({
        old_password: validationRules.password,
        password: validationRules.password,
        confirm_password: validationRules.password,
    })
    .refine((data) => data.password === data.confirm_password, {
        message: 'validation.password_mismatch',
        path: ['confirm_password'],
    });

export const ChangePasswordRequestSchema = z.object({
    body: ChangePasswordRequestBodySchema,
});

const CheckUsernameRequestBodySchema = z.object({
    username: validationRules.username,
});

export const CheckUsernameRequestSchema = z.object({
    body: CheckUsernameRequestBodySchema,
});

// Refresh Token Schema
const RefreshTokenRequestBodySchema = z.object({
    refresh_token: validationRules.required('refresh_token'),
});

export const RefreshTokenRequestSchema = z.object({
    body: RefreshTokenRequestBodySchema,
});

// Logout Schema
const LogoutRequestBodySchema = z.object({
    access_token: validationRules.required('access_token'),
    refresh_token: validationRules.required('refresh_token'),
});

export const LogoutRequestSchema = z.object({
    body: LogoutRequestBodySchema,
});

// Types
export type LoginRequestSchemaType = z.infer<typeof LoginRequestBodySchema>;
export type ChangePasswordRequestSchemaType = z.infer<typeof ChangePasswordRequestBodySchema>;
export type CheckEmailRequestSchemaType = z.infer<typeof CheckUsernameRequestBodySchema>;
export type RefreshTokenRequestSchemaType = z.infer<typeof RefreshTokenRequestBodySchema>;
export type LogoutRequestSchemaType = z.infer<typeof LogoutRequestBodySchema>;
