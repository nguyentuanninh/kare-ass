import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import request from 'supertest';
import express from 'express';
import httpStatus from 'http-status';
import { errorConverter, errorHandler } from '@/middlewares/error.js';
import { ApiResponse } from '@/types/api.types.js';
import { ActionType, ResourceType } from '@/configs/constant.js';
import RoleService from '@/services/RoleService.js';
import { mockRequest } from '@/__tests__/utils/mockI18n.js';
import rolesRoute from '../rolesRoute.js';

// Test data
const validRoleData = {
    role_name: 'Test Role',
    permissions: {
        [ResourceType.ROLE]: [ActionType.VIEW, ActionType.CREATE],
    },
};

// Mock the RoleService with proper typing
vi.mock('@/services/RoleService.js', () => {
    const mockCreateRole = vi.fn();
    const mockUpdateRole = vi.fn();
    const mockDeleteRole = vi.fn();
    return {
        default: vi.fn().mockImplementation(() => ({
            createRole: mockCreateRole,
            updateRole: mockUpdateRole,
            deleteRole: mockDeleteRole,
        })),
    };
});

// Mock the auth middleware
vi.mock('@/middlewares/auth.js', () => ({
    auth: () => (req: any, res: any, next: any) => {
        if (req.headers.authorization === 'Bearer access-token') {
            req.userInfo = {
                role_id: 'admin',
            };
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

class NotFoundError extends Error {
    status: number;

    constructor(message: string) {
        super(message);
        this.name = 'NotFoundError';
        this.status = httpStatus.NOT_FOUND;
    }
}

describe('Role Routes', () => {
    let app: express.Application;
    let mockCreateRole: Mock;
    let mockDeleteRole: Mock;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use((req, res, next) => {
            Object.assign(req, mockRequest);
            next();
        });
        app.use('/roles', rolesRoute);
        app.use(errorConverter);
        app.use(errorHandler);
        vi.clearAllMocks();
        const roleService = new RoleService() as any;
        mockCreateRole = roleService.createRole;
        mockDeleteRole = roleService.deleteRole;
    });

    describe('POST /roles', () => {
        describe('Successful Role Creation', () => {
            it('should create a new role and return role data', async () => {
                const mockResponse: ApiResponse = {
                    success: true,
                    code: httpStatus.CREATED,
                    message: mockRequest.__('role.success.created'),
                    data: {
                        id: 'test_role',
                        ...validRoleData,
                    },
                };

                mockCreateRole.mockResolvedValue(mockResponse);

                const response = await request(app)
                    .post('/roles')
                    .set('Authorization', 'Bearer access-token')
                    .send(validRoleData)
                    .expect(httpStatus.CREATED);

                expect(response.body).toMatchObject({
                    success: true,
                    code: httpStatus.CREATED,
                    message: mockRequest.__('role.success.created'),
                    data: {
                        id: 'test_role',
                        role_name: validRoleData.role_name,
                        permissions: validRoleData.permissions,
                    },
                });
            });

            it('should transform role name with spaces to snake_case for role ID', async () => {
                const roleData = {
                    role_name: 'Dental Practitioner',
                    permissions: validRoleData.permissions,
                };

                const mockResponse: ApiResponse = {
                    success: true,
                    code: httpStatus.CREATED,
                    message: mockRequest.__('role.success.created'),
                    data: {
                        id: 'dental_practitioner',
                        ...roleData,
                    },
                };

                mockCreateRole.mockResolvedValue(mockResponse);

                const response = await request(app)
                    .post('/roles')
                    .set('Authorization', 'Bearer access-token')
                    .send(roleData)
                    .expect(httpStatus.CREATED);

                expect(response.body.data.id).toBe('dental_practitioner');
            });

            it('should transform role name with camelCase to snake_case for role ID', async () => {
                const roleData = {
                    role_name: 'dentalPractitioner',
                    permissions: validRoleData.permissions,
                };

                const mockResponse: ApiResponse = {
                    success: true,
                    code: httpStatus.CREATED,
                    message: mockRequest.__('role.success.created'),
                    data: {
                        id: 'dental_practitioner',
                        ...roleData,
                    },
                };

                mockCreateRole.mockResolvedValue(mockResponse);

                const response = await request(app)
                    .post('/roles')
                    .set('Authorization', 'Bearer access-token')
                    .send(roleData)
                    .expect(httpStatus.CREATED);

                expect(response.body.data.id).toBe('dental_practitioner');
            });

            it('should handle duplicate role names with different cases', async () => {
                const roleData1 = {
                    role_name: 'Dental Practitioner',
                    permissions: validRoleData.permissions,
                };

                const roleData2 = {
                    role_name: 'dentalPractitioner',
                    permissions: validRoleData.permissions,
                };

                // First request succeeds
                mockCreateRole.mockResolvedValueOnce({
                    success: true,
                    code: httpStatus.CREATED,
                    message: mockRequest.__('role.success.created'),
                    data: {
                        id: 'dental_practitioner',
                        ...roleData1,
                    },
                });

                // Second request fails due to duplicate role ID
                mockCreateRole.mockResolvedValueOnce({
                    success: false,
                    code: httpStatus.BAD_REQUEST,
                    message: mockRequest.__('role.errors.name_taken'),
                    error: {
                        code: httpStatus.BAD_REQUEST,
                        isOperational: true,
                        name: 'ValidationError',
                        message: mockRequest.__('role.errors.name_taken'),
                    },
                });

                // First request should succeed
                await request(app)
                    .post('/roles')
                    .set('Authorization', 'Bearer access-token')
                    .send(roleData1)
                    .expect(httpStatus.CREATED);

                // Second request should fail
                const response = await request(app)
                    .post('/roles')
                    .set('Authorization', 'Bearer access-token')
                    .send(roleData2)
                    .expect(httpStatus.BAD_REQUEST);

                expect(response.body.message).toBe(mockRequest.__('role.errors.name_taken'));
            });
        });

        describe('Validation Errors', () => {
            it('should return 400 if role name is already taken', async () => {
                const errorResponse: ApiResponse = {
                    success: false,
                    code: httpStatus.BAD_REQUEST,
                    message: mockRequest.__('role.errors.name_taken'),
                    error: {
                        code: httpStatus.BAD_REQUEST,
                        isOperational: true,
                        name: 'ValidationError',
                        message: mockRequest.__('role.errors.name_taken'),
                    },
                };

                mockCreateRole.mockResolvedValue(errorResponse);

                const response = await request(app)
                    .post('/roles')
                    .set('Authorization', 'Bearer access-token')
                    .send(validRoleData)
                    .expect(httpStatus.BAD_REQUEST);

                expect(response.body).toMatchObject({
                    success: false,
                    code: httpStatus.BAD_REQUEST,
                    message: mockRequest.__('role.errors.name_taken'),
                });
            });

            it('should return 400 if role name is missing', async () => {
                const invalidRoleData = {
                    permissions: validRoleData.permissions,
                };

                const response = await request(app)
                    .post('/roles')
                    .set('Authorization', 'Bearer access-token')
                    .send(invalidRoleData)
                    .expect(httpStatus.BAD_REQUEST);

                expect(response.body).toHaveProperty('message');
                expect(response.body.message).toContain(
                    mockRequest.__('validation.required.role_name')
                );
            });

            it('should return 400 if module is invalid', async () => {
                const invalidRoleData = {
                    role_name: validRoleData.role_name,
                    permissions: {
                        INVALID_MODULE: [ActionType.VIEW],
                    },
                };

                const response = await request(app)
                    .post('/roles')
                    .set('Authorization', 'Bearer access-token')
                    .send(invalidRoleData)
                    .expect(httpStatus.BAD_REQUEST);

                expect(response.body).toHaveProperty('message');
                expect(response.body.message).toContain('Invalid enum value');
                expect(response.body.message).toContain('Expected');
                expect(response.body.message).toContain("received 'INVALID_MODULE'");
            });

            it('should return 400 if actions array is empty', async () => {
                const invalidRoleData = {
                    role_name: validRoleData.role_name,
                    permissions: {
                        [ResourceType.ROLE]: [],
                    },
                };

                const response = await request(app)
                    .post('/roles')
                    .set('Authorization', 'Bearer access-token')
                    .send(invalidRoleData)
                    .expect(httpStatus.BAD_REQUEST);

                expect(response.body).toHaveProperty('message');
                expect(response.body.message).toContain(
                    mockRequest.__('validation.at_least_one_action')
                );
            });

            it('should return 400 if actions array contains invalid value', async () => {
                const invalidRoleData = {
                    role_name: validRoleData.role_name,
                    permissions: {
                        [ResourceType.ROLE]: ['INVALID_ACTION'],
                    },
                };

                const response = await request(app)
                    .post('/roles')
                    .set('Authorization', 'Bearer access-token')
                    .send(invalidRoleData)
                    .expect(httpStatus.BAD_REQUEST);

                expect(response.body).toHaveProperty('message');
                expect(response.body.message).toContain('Invalid enum value');
                expect(response.body.message).toContain('Expected');
                expect(response.body.message).toContain("received 'INVALID_ACTION'");
            });
        });

        describe('Authentication Errors', () => {
            it('should return 401 if not authenticated', async () => {
                const response = await request(app)
                    .post('/roles')
                    .send(validRoleData)
                    .expect(httpStatus.UNAUTHORIZED);

                expect(response.body).toHaveProperty('message');
                expect(response.body.message).toContain(
                    mockRequest.__('token.errors.unauthorized')
                );
            });
        });

        describe('Server Errors', () => {
            it('should handle server errors gracefully', async () => {
                const error = new Error(mockRequest.__('role.errors.create_failed'));
                error.name = 'DatabaseError';
                mockCreateRole.mockRejectedValue(error);

                const response = await request(app)
                    .post('/roles')
                    .set('Authorization', 'Bearer access-token')
                    .send(validRoleData)
                    .expect(httpStatus.INTERNAL_SERVER_ERROR);

                expect(response.body).toHaveProperty('message');
                expect(response.body.message).toContain(
                    mockRequest.__('role.errors.create_failed')
                );
            });
        });
    });

    describe('PUT /roles/:roleId', () => {
        let mockUpdateRole: Mock;

        beforeEach(() => {
            const roleService = new RoleService() as any;
            mockUpdateRole = roleService.updateRole;
        });

        describe('Successful Role Update', () => {
            it('should update an existing role and return success response', async () => {
                const roleId = 'test_role';
                const updateData = {
                    role_name: 'Updated Role Name',
                    permissions: {
                        [ResourceType.ROLE]: [ActionType.VIEW, ActionType.EDIT],
                    },
                };

                const mockResponse: ApiResponse = {
                    success: true,
                    code: httpStatus.OK,
                    message: mockRequest.__('role.success.updated'),
                };

                mockUpdateRole.mockResolvedValue(mockResponse);

                const response = await request(app)
                    .put(`/roles/${roleId}`)
                    .set('Authorization', 'Bearer access-token')
                    .send(updateData)
                    .expect(httpStatus.OK);

                expect(response.body).toMatchObject({
                    success: true,
                    code: httpStatus.OK,
                    message: mockRequest.__('role.success.updated'),
                });
            });
        });

        describe('Validation Errors', () => {
            it('should return 400 if module is invalid', async () => {
                const roleId = 'test_role';
                const invalidData = {
                    role_name: 'Test Role',
                    permissions: {
                        INVALID_MODULE: [ActionType.VIEW],
                    },
                };

                const response = await request(app)
                    .put(`/roles/${roleId}`)
                    .set('Authorization', 'Bearer access-token')
                    .send(invalidData)
                    .expect(httpStatus.BAD_REQUEST);

                expect(response.body).toHaveProperty('message');
                expect(response.body.message).toContain('Invalid enum value');
                expect(response.body.message).toContain('Expected');
                expect(response.body.message).toContain("received 'INVALID_MODULE'");
            });

            it('should return 400 if actions array contains invalid value', async () => {
                const roleId = 'test_role';
                const invalidData = {
                    role_name: 'Test Role',
                    permissions: {
                        [ResourceType.ROLE]: ['INVALID_ACTION'],
                    },
                };

                const response = await request(app)
                    .put(`/roles/${roleId}`)
                    .set('Authorization', 'Bearer access-token')
                    .send(invalidData)
                    .expect(httpStatus.BAD_REQUEST);

                expect(response.body).toHaveProperty('message');
                expect(response.body.message).toContain('Invalid enum value');
                expect(response.body.message).toContain('Expected');
                expect(response.body.message).toContain("received 'INVALID_ACTION'");
            });

            it('should allow empty actions array in permissions', async () => {
                const roleId = 'test_role';
                const validData = {
                    role_name: 'Test Role',
                    permissions: {
                        [ResourceType.ROLE]: [],
                    },
                };

                const mockResponse: ApiResponse = {
                    success: true,
                    code: httpStatus.OK,
                    message: mockRequest.__('role.success.updated'),
                };

                mockUpdateRole.mockResolvedValue(mockResponse);

                const response = await request(app)
                    .put(`/roles/${roleId}`)
                    .set('Authorization', 'Bearer access-token')
                    .send(validData)
                    .expect(httpStatus.OK);

                expect(response.body).toMatchObject({
                    success: true,
                    code: httpStatus.OK,
                    message: mockRequest.__('role.success.updated'),
                });
            });
        });

        describe('Authentication Errors', () => {
            it('should return 401 if not authenticated', async () => {
                const roleId = 'test_role';
                const response = await request(app)
                    .put(`/roles/${roleId}`)
                    .send(validRoleData)
                    .expect(httpStatus.UNAUTHORIZED);

                expect(response.body).toHaveProperty('message');
                expect(response.body.message).toContain(
                    mockRequest.__('token.errors.unauthorized')
                );
            });
        });

        describe('Server Errors', () => {
            it('should handle server errors gracefully', async () => {
                const roleId = 'test_role';
                const error = new Error(mockRequest.__('role.errors.update_failed'));
                error.name = 'DatabaseError';
                mockUpdateRole.mockRejectedValue(error);

                const response = await request(app)
                    .put(`/roles/${roleId}`)
                    .set('Authorization', 'Bearer access-token')
                    .send(validRoleData)
                    .expect(httpStatus.INTERNAL_SERVER_ERROR);

                expect(response.body).toHaveProperty('message');
                expect(response.body.message).toContain(
                    mockRequest.__('role.errors.update_failed')
                );
            });
        });
    });

    describe('DELETE /roles/:roleId', () => {
        describe('Successful Role Deletion', () => {
            it('should delete an existing role and return success response', async () => {
                const roleId = 'test_role';
                const mockResponse: ApiResponse = {
                    success: true,
                    code: httpStatus.OK,
                    message: mockRequest.__('role.success.deleted'),
                };

                mockDeleteRole.mockResolvedValue(mockResponse);

                const response = await request(app)
                    .delete(`/roles/${roleId}`)
                    .set('Authorization', 'Bearer access-token')
                    .expect(httpStatus.OK);

                expect(response.body).toMatchObject({
                    success: true,
                    code: httpStatus.OK,
                    message: mockRequest.__('role.success.deleted'),
                });
            });
        });

        describe('Authentication Errors', () => {
            it('should return 401 if not authenticated', async () => {
                const roleId = 'test_role';
                const response = await request(app)
                    .delete(`/roles/${roleId}`)
                    .expect(httpStatus.UNAUTHORIZED);

                expect(response.body).toHaveProperty('message');
                expect(response.body.message).toContain(
                    mockRequest.__('token.errors.unauthorized')
                );
            });
        });

        describe('Server Errors', () => {
            it('should handle server errors gracefully', async () => {
                const roleId = 'test_role';
                const error = new Error(mockRequest.__('role.errors.delete_failed'));
                error.name = 'DatabaseError';
                mockDeleteRole.mockRejectedValue(error);

                const response = await request(app)
                    .delete(`/roles/${roleId}`)
                    .set('Authorization', 'Bearer access-token')
                    .expect(httpStatus.INTERNAL_SERVER_ERROR);

                expect(response.body).toHaveProperty('message');
                expect(response.body.message).toContain(
                    mockRequest.__('role.errors.delete_failed')
                );
            });
        });
    });
});
