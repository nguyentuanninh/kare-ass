import { Router } from 'express';
import AuthController from '@/controllers/AuthController.js';
import { auth } from '@/middlewares/auth.js';
import { validate } from '@/middlewares/validate.js';
import { publicRateLimit, privateRateLimit } from '@/middlewares/rateLimit.js';
import {
    UserCreateRequestSchema,
    LoginRequestSchema,
    ChangePasswordRequestSchema,
    RefreshTokenRequestSchema,
    LogoutRequestSchema,
    CheckUsernameRequestSchema,
} from '@/schemas/index';

const router = Router();

const authController = new AuthController();

// Public routes with public rate limit
router.post(
    '/register',
    publicRateLimit,
    validate(UserCreateRequestSchema),
    authController.register
);
router.post(
    '/username-exists',
    publicRateLimit,
    validate(CheckUsernameRequestSchema),
    authController.checkUsername
);
router.post('/login', publicRateLimit, validate(LoginRequestSchema), authController.login);
router.post(
    '/refresh-token',
    publicRateLimit,
    validate(RefreshTokenRequestSchema),
    authController.refreshTokens
);

// Protected routes with private rate limit
router.post(
    '/logout',
    auth(),
    privateRateLimit,
    validate(LogoutRequestSchema),
    authController.logout
);
router.put(
    '/change-password',
    auth(),
    privateRateLimit,
    validate(ChangePasswordRequestSchema),
    authController.changePassword
);

export default router;
