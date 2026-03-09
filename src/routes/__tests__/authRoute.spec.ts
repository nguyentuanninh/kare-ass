import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import request from 'supertest';
import express from 'express';
import httpStatus from 'http-status';
import { errorConverter, errorHandler } from '@/middlewares/error.js';
import { IUserDB, IUserResponse } from '@/models/interfaces/IUser.js';
import { ITokens } from '@/models/interfaces/IToken.js';
import { ApiResponse } from '@/types/api.types.js';
import { UserStatus } from '@/configs/constant.js';
import AuthService from '@/services/AuthService.js';
import UserService from '@/services/UserService.js';
import { mockRequest } from '@/__tests__/utils/mockI18n.js';
import authRoute from '../authRoute.js';

// Test data
const validUserData = {
    id: 1,
    uuid: '123e4567-e89b-12d3-a456-426614174000',
    username: 'testuser',
    password: 'password123',
    display_name: 'John Doe',
    role: {
        id: 'admin',
        role_name: 'Administrator',
        permissions: {
            user: ['view', 'create', 'edit', 'delete'],
            role: ['view', 'create', 'edit', 'delete'],
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    status: UserStatus.ACTIVE,
    metadata: {
        preferences: {
            theme: 'dark',
            language: 'en',
        },
        last_login_ip: '192.168.1.1',
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
} as unknown as IUserDB;

// Mock the AuthService with proper typing
vi.mock('@/services/AuthService.js', () => {
    const mockRegisterUser = vi.fn();
    const mockLoginWithUsernamePassword = vi.fn();
    const mockCheckUsername = vi.fn();
    const mockRefreshTokens = vi.fn();
    const mockLogout = vi.fn();
    const mockChangePassword = vi.fn();
    return {
        default: vi.fn().mockImplementation(() => ({
            registerUser: mockRegisterUser,
            loginWithUsernamePassword: mockLoginWithUsernamePassword,
            checkUsername: mockCheckUsername,
            refreshTokens: mockRefreshTokens,
            logout: mockLogout,
            changePassword: mockChangePassword,
        })),
    };
});

// Mock the UserService with proper typing
vi.mock('@/services/UserService.js', () => {
    const mockIsUsernameExists = vi.fn();
    const mockChangePassword = vi.fn();
    return {
        default: vi.fn().mockImplementation(() => ({
            isUsernameExists: mockIsUsernameExists,
            changePassword: mockChangePassword,
        })),
    };
});

// Mock the auth middleware
vi.mock('@/middlewares/auth.js', () => ({
    auth: () => (req: any, res: any, next: any) => {
        if (req.headers.authorization === 'Bearer access-token') {
            req.userInfo = validUserData;
            next();
        } else {
            res.status(httpStatus.UNAUTHORIZED).json({
                success: false,
                code: httpStatus.UNAUTHORIZED,
                message: mockRequest.__('token.errors.unauthorized'),
            });
        }
    },
}));

describe('Auth Routes', () => {
    let app: express.Application;
    let mockRegisterUser: Mock;
    let mockLoginWithUsernamePassword: Mock;
    let mockRefreshTokens: Mock;
    let mockLogout: Mock;
    let mockIsUsernameExists: Mock;
    let mockUserChangePassword: Mock;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use((req, res, next) => {
            Object.assign(req, mockRequest);
            next();
        });
        app.use('/auth', authRoute);
        app.use(errorConverter);
        app.use(errorHandler);
        vi.clearAllMocks();
        const authService = new AuthService() as any;
        const userService = new UserService() as any;
        mockRegisterUser = authService.registerUser;
        mockLoginWithUsernamePassword = authService.loginWithUsernamePassword;
        mockRefreshTokens = authService.refreshTokens;
        mockLogout = authService.logout;
        mockIsUsernameExists = userService.isUsernameExists;
        mockUserChangePassword = userService.changePassword;
    });

    describe('POST /auth/register', () => {
        describe('Successful Registration', () => {
            it('should register a new user and return user data with tokens', async () => {
                const expires = new Date();
                const mockResponse: ApiResponse<{ user: IUserResponse; tokens: ITokens }> = {
                    success: true,
                    code: httpStatus.CREATED,
                    message: mockRequest.__('auth.success.registered'),
                    data: {
                        user: {
                            uuid: validUserData.uuid,
                            username: validUserData.username,
                            display_name: validUserData.display_name,
                            status: validUserData.status,
                            role: validUserData.role,
                            metadata: validUserData.metadata,
                        },
                        tokens: {
                            access: { token: 'access-token', expires, type: 'access' },
                            refresh: { token: 'refresh-token', expires, type: 'refresh' },
                        },
                    },
                };

                mockRegisterUser.mockResolvedValue(mockResponse);

                const response = await request(app)
                    .post('/auth/register')
                    .send({
                        username: validUserData.username,
                        password: validUserData.password,
                        confirm_password: validUserData.password,
                        display_name: validUserData.display_name,
                        role_id: validUserData.role.id,
                        metadata: validUserData.metadata,
                    })
                    .expect(httpStatus.CREATED);

                expect(response.body).toMatchObject({
                    success: true,
                    code: httpStatus.CREATED,
                    message: mockRequest.__('auth.success.registered'),
                    data: {
                        user: {
                            ...mockResponse.data?.user,
                            role: validUserData.role,
                        },
                        tokens: {
                            access: { token: mockResponse.data?.tokens.access.token },
                            refresh: { token: mockResponse.data?.tokens.refresh.token },
                        },
                    },
                });
                expect(response.body.data.tokens.access.expires).toBeDefined();
                expect(response.body.data.tokens.refresh.expires).toBeDefined();
                expect(response.body.data.user.metadata).toEqual(validUserData.metadata);
                expect(response.body.data.user.role).toEqual(validUserData.role);
            });
        });

        describe('Validation Errors', () => {
            it('should return 400 if username is already taken', async () => {
                const errorResponse: ApiResponse = {
                    success: false,
                    code: httpStatus.BAD_REQUEST,
                    message: mockRequest.__('user.errors.username_taken'),
                    error: {
                        code: httpStatus.BAD_REQUEST,
                        isOperational: true,
                        name: 'ValidationError',
                        message: mockRequest.__('user.errors.username_taken'),
                    },
                };

                mockRegisterUser.mockResolvedValue(errorResponse);

                const response = await request(app)
                    .post('/auth/register')
                    .send({
                        username: validUserData.username,
                        password: validUserData.password,
                        confirm_password: validUserData.password,
                        display_name: validUserData.display_name,
                        role_id: validUserData.role.id,
                    })
                    .expect(httpStatus.BAD_REQUEST);

                expect(response.body).toMatchObject({
                    success: false,
                    code: httpStatus.BAD_REQUEST,
                    message: mockRequest.__('user.errors.username_taken'),
                });
            });

            it('should return 400 if passwords do not match', async () => {
                const invalidUserData = {
                    ...validUserData,
                    confirm_password: 'differentpassword',
                };

                const response = await request(app)
                    .post('/auth/register')
                    .send({
                        username: invalidUserData.username,
                        password: invalidUserData.password,
                        confirm_password: invalidUserData.confirm_password,
                        display_name: invalidUserData.display_name,
                        role_id: invalidUserData.role.id,
                    })
                    .expect(httpStatus.BAD_REQUEST);

                expect(response.body).toHaveProperty('message');
                expect(response.body.message).toContain(
                    mockRequest.__('validation.password_mismatch')
                );
            });

            it('should return 400 if username is invalid', async () => {
                const invalidUserData = {
                    ...validUserData,
                    username: 'invalid username',
                };

                const response = await request(app)
                    .post('/auth/register')
                    .send({
                        username: invalidUserData.username,
                        password: invalidUserData.password,
                        confirm_password: invalidUserData.password,
                        display_name: invalidUserData.display_name,
                        role_id: invalidUserData.role.id,
                    })
                    .expect(httpStatus.BAD_REQUEST);

                expect(response.body).toHaveProperty('message');
                expect(response.body.message).toContain(
                    mockRequest.__('validation.username_format')
                );
            });

            it('should return 400 if password is too short', async () => {
                const invalidUserData = {
                    ...validUserData,
                    password: '12345',
                    confirm_password: '12345',
                };

                const response = await request(app)
                    .post('/auth/register')
                    .send({
                        username: invalidUserData.username,
                        password: invalidUserData.password,
                        confirm_password: invalidUserData.confirm_password,
                        display_name: invalidUserData.display_name,
                        role_id: invalidUserData.role.id,
                    })
                    .expect(httpStatus.BAD_REQUEST);

                expect(response.body).toHaveProperty('message');
                expect(response.body.message).toContain(
                    mockRequest.__('validation.password_min_length')
                );
            });
        });

        describe('Server Errors', () => {
            it('should handle server errors gracefully', async () => {
                const error = new Error(mockRequest.__('auth.errors.register_failed'));
                error.name = 'DatabaseError';
                mockRegisterUser.mockRejectedValue(error);

                const response = await request(app)
                    .post('/auth/register')
                    .send({
                        username: validUserData.username,
                        password: validUserData.password,
                        confirm_password: validUserData.password,
                        display_name: validUserData.display_name,
                        role_id: validUserData.role.id,
                    })
                    .expect(httpStatus.INTERNAL_SERVER_ERROR);

                expect(response.body).toHaveProperty('message');
                expect(response.body.message).toContain(
                    mockRequest.__('auth.errors.register_failed')
                );
            });
        });
    });

    describe('POST /auth/username-exists', () => {
        it('should return 200 if username exists', async () => {
            const mockResponse = {
                success: true,
                code: httpStatus.OK,
                message: mockRequest.__('user.success.username_found'),
            };

            mockIsUsernameExists.mockResolvedValue(mockResponse);

            const response = await request(app)
                .post('/auth/username-exists')
                .send({ username: validUserData.username })
                .expect(httpStatus.OK);

            expect(response.body).toMatchObject({
                success: true,
                code: httpStatus.OK,
                message: mockRequest.__('user.success.username_found'),
            });
        });

        it('should return 400 if username does not exist', async () => {
            const mockResponse = {
                success: false,
                code: httpStatus.BAD_REQUEST,
                message: mockRequest.__('user.errors.username_not_found'),
                error: {
                    code: httpStatus.BAD_REQUEST,
                    isOperational: true,
                    name: 'ValidationError',
                    message: mockRequest.__('user.errors.username_not_found'),
                },
            };

            mockIsUsernameExists.mockResolvedValue(mockResponse);

            const response = await request(app)
                .post('/auth/username-exists')
                .send({ username: 'nonexistentuser' })
                .expect(httpStatus.BAD_REQUEST);

            expect(response.body).toMatchObject({
                success: false,
                code: httpStatus.BAD_REQUEST,
                message: mockRequest.__('user.errors.username_not_found'),
            });
        });

        it('should return 400 if username is invalid', async () => {
            const mockResponse = {
                success: false,
                code: httpStatus.BAD_REQUEST,
                message: mockRequest.__('user.errors.username_not_found'),
                error: {
                    code: httpStatus.BAD_REQUEST,
                    isOperational: true,
                    name: 'ValidationError',
                    message: mockRequest.__('user.errors.username_not_found'),
                },
            };

            mockIsUsernameExists.mockResolvedValue(mockResponse);

            const response = await request(app)
                .post('/auth/username-exists')
                .send({ username: 'invalid-username' })
                .expect(httpStatus.BAD_REQUEST);

            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toContain(mockRequest.__('validation.username_format'));
        });
    });

    describe('POST /auth/login', () => {
        describe('Successful Login', () => {
            it('should login user and return user data with tokens', async () => {
                const expires = new Date();
                const mockResponse: ApiResponse<{ user: IUserResponse; tokens: ITokens }> = {
                    success: true,
                    code: httpStatus.OK,
                    message: mockRequest.__('auth.success.logged_in'),
                    data: {
                        user: {
                            uuid: validUserData.uuid,
                            username: validUserData.username,
                            display_name: validUserData.display_name,
                            status: validUserData.status,
                            role: validUserData.role,
                            metadata: validUserData.metadata,
                        },
                        tokens: {
                            access: { token: 'access-token', expires, type: 'access' },
                            refresh: { token: 'refresh-token', expires, type: 'refresh' },
                        },
                    },
                };

                mockLoginWithUsernamePassword.mockResolvedValue(mockResponse);

                const response = await request(app)
                    .post('/auth/login')
                    .send({
                        username: validUserData.username,
                        password: validUserData.password,
                    })
                    .expect(httpStatus.OK);

                expect(response.body).toMatchObject({
                    success: true,
                    code: httpStatus.OK,
                    message: mockRequest.__('auth.success.logged_in'),
                    data: {
                        user: {
                            ...mockResponse.data?.user,
                            role: validUserData.role,
                        },
                        tokens: {
                            access: { token: mockResponse.data?.tokens.access.token },
                            refresh: { token: mockResponse.data?.tokens.refresh.token },
                        },
                    },
                });
                expect(response.body.data.tokens.access.expires).toBeDefined();
                expect(response.body.data.tokens.refresh.expires).toBeDefined();
                expect(response.body.data.user.metadata).toEqual(validUserData.metadata);
                expect(response.body.data.user.role).toEqual(validUserData.role);
            });
        });

        it('should return 400 if username is invalid', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    username: 'invalid username',
                    password: validUserData.password,
                })
                .expect(httpStatus.BAD_REQUEST);

            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toContain(mockRequest.__('validation.username_format'));
        });

        it('should return 400 if password is missing', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    username: validUserData.username,
                })
                .expect(httpStatus.BAD_REQUEST);

            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toContain(mockRequest.__('validation.required.password'));
        });
    });

    describe('POST /auth/refresh-token', () => {
        it('should refresh tokens successfully', async () => {
            const expires = new Date();
            const mockResponse: ApiResponse<ITokens> = {
                success: true,
                code: httpStatus.OK,
                message: mockRequest.__('auth.success.tokens_refreshed'),
                data: {
                    access: { token: 'new-access-token', expires, type: 'access' },
                    refresh: { token: 'new-refresh-token', expires, type: 'refresh' },
                },
            };

            mockRefreshTokens.mockResolvedValue(mockResponse);

            const response = await request(app)
                .post('/auth/refresh-token')
                .send({
                    refresh_token: 'old-refresh-token',
                })
                .expect(httpStatus.OK);

            expect(response.body).toMatchObject({
                success: true,
                code: httpStatus.OK,
                message: mockRequest.__('auth.success.tokens_refreshed'),
                data: {
                    access: { token: mockResponse.data?.access.token },
                    refresh: { token: mockResponse.data?.refresh.token },
                },
            });
        });

        it('should return 400 if refresh token is missing', async () => {
            const response = await request(app)
                .post('/auth/refresh-token')
                .send({})
                .expect(httpStatus.BAD_REQUEST);

            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toContain(
                mockRequest.__('validation.required.refresh_token')
            );
        });
    });

    describe('POST /auth/logout', () => {
        it('should logout successfully', async () => {
            const mockResponse: ApiResponse = {
                success: true,
                code: httpStatus.OK,
                message: mockRequest.__('auth.success.logged_out'),
            };

            mockLogout.mockResolvedValue(mockResponse);

            const response = await request(app)
                .post('/auth/logout')
                .set('Authorization', 'Bearer access-token')
                .send({
                    access_token: 'access-token',
                    refresh_token: 'refresh-token',
                })
                .expect(httpStatus.OK);

            expect(response.body).toMatchObject({
                success: true,
                code: httpStatus.OK,
                message: mockRequest.__('auth.success.logged_out'),
            });
        });

        it('should return 401 if not authenticated', async () => {
            const response = await request(app)
                .post('/auth/logout')
                .send({
                    access_token: 'access-token',
                    refresh_token: 'refresh-token',
                })
                .expect(httpStatus.UNAUTHORIZED);

            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toContain(mockRequest.__('token.errors.unauthorized'));
        });
    });

    describe('PUT /auth/change-password', () => {
        it('should change password successfully', async () => {
            const mockResponse = {
                success: true,
                code: httpStatus.OK,
                message: mockRequest.__('user.success.password_updated'),
                data: {},
            };

            mockUserChangePassword.mockResolvedValue(mockResponse);

            const response = await request(app)
                .put('/auth/change-password')
                .set('Authorization', 'Bearer access-token')
                .send({
                    old_password: validUserData.password,
                    password: 'newpassword123',
                    confirm_password: 'newpassword123',
                })
                .expect(httpStatus.OK);

            expect(response.body).toMatchObject({
                success: true,
                code: httpStatus.OK,
                message: mockRequest.__('user.success.password_updated'),
                data: {},
            });
        });

        it('should return 401 if not authenticated', async () => {
            const response = await request(app)
                .put('/auth/change-password')
                .send({
                    old_password: validUserData.password,
                    password: 'newpassword123',
                    confirm_password: 'newpassword123',
                })
                .expect(httpStatus.UNAUTHORIZED);

            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toContain(mockRequest.__('token.errors.unauthorized'));
        });

        it('should return 400 if passwords do not match', async () => {
            const response = await request(app)
                .put('/auth/change-password')
                .set('Authorization', 'Bearer access-token')
                .send({
                    old_password: validUserData.password,
                    password: 'newpassword123',
                    confirm_password: 'differentpassword',
                })
                .expect(httpStatus.BAD_REQUEST);

            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toContain(mockRequest.__('validation.password_mismatch'));
        });
    });
});
