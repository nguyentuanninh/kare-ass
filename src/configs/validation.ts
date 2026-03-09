import { z } from 'zod';

export const validationMessages = {
    REQUIRED_FIELD: (field: string) => `validation.required.${field}`,
} as const;

export const validationRules = {
    username: z
        .string({ required_error: validationMessages.REQUIRED_FIELD('username') })
        .min(6, { message: 'validation.username_min_length' })
        .max(30, { message: 'validation.username_max_length' })
        .regex(/^[a-zA-Z0-9_]+$/, {
            message: 'validation.username_format',
        }),
    password: z
        .string({ required_error: validationMessages.REQUIRED_FIELD('password') })
        .min(6, { message: 'validation.password_min_length' }),
    required: (field: string) =>
        z.string({ required_error: validationMessages.REQUIRED_FIELD(field) }),
} as const;
