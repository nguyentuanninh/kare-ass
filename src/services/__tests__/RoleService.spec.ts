// import { describe, it, expect, beforeEach, vi } from 'vitest';
// import httpStatus from 'http-status';
// import {
//     CreateRoleRequestSchemaType,
//     UpdateRoleRequestSchemaType,
// } from '@/schemas/roles.schema.js';
// import { IPermissions, IRole } from '@/models/interfaces/IRole.js';
// import { ActionType, ResourceType } from '@/configs/constant.js';
// import RoleDao from '@/dao/RoleDao.js';
// import { mockRequest } from '@/__tests__/utils/mockI18n.js';
// import RoleService from '../RoleService.js';

// // Type definitions for mock data
// type MockRole = {
//     id: string;
//     role_name: string;
//     permissions: IPermissions;
//     created_at: Date;
//     updated_at: Date;
// };

// // Mock factories
// const createMockRole = (overrides: Partial<MockRole> = {}): MockRole => ({
//     id: 'admin',
//     role_name: 'Admin',
//     permissions: {
//         [ResourceType.ROLE]: [
//             ActionType.VIEW,
//             ActionType.CREATE,
//             ActionType.EDIT,
//             ActionType.DELETE,
//         ],
//     },
//     created_at: new Date(),
//     updated_at: new Date(),
//     ...overrides,
// });

// const createMockCreateRoleRequest = (
//     overrides: Partial<CreateRoleRequestSchemaType> = {}
// ): CreateRoleRequestSchemaType => ({
//     role_name: 'Admin',
//     permissions: {
//         [ResourceType.ROLE]: [
//             ActionType.VIEW,
//             ActionType.CREATE,
//             ActionType.EDIT,
//             ActionType.DELETE,
//         ],
//     },
//     ...overrides,
// });

// const createMockUpdateRoleRequest = (
//     overrides: Partial<UpdateRoleRequestSchemaType> = {}
// ): UpdateRoleRequestSchemaType => ({
//     role_name: 'Updated Admin',
//     permissions: {
//         [ResourceType.ROLE]: [ActionType.VIEW, ActionType.CREATE, ActionType.EDIT],
//     },
//     ...overrides,
// });

// // Mock service instances
// const mockRoleDao = vi.mocked(new RoleDao());

// let roleService: RoleService;

// describe('RoleService', () => {
//     beforeEach(() => {
//         // Create RoleService with mocked dependencies
//         roleService = new RoleService();
//         (roleService as any).roleDao = mockRoleDao;

//         // Mock i18n
//         vi.mock('@/middlewares/asyncContext', () => ({
//             useI18n: () => mockRequest,
//         }));

//         vi.clearAllMocks();
//     });

//     describe('createRole', () => {
//         it('should successfully create a new role', async () => {
//             const mockRole = createMockRole();
//             const createRoleRequest = createMockCreateRoleRequest();

//             vi.spyOn(mockRoleDao, 'findById').mockResolvedValue(null);
//             vi.spyOn(mockRoleDao, 'create').mockResolvedValue(mockRole);

//             const result = await roleService.createRole(createRoleRequest);

//             expect(result).toEqual({
//                 success: true,
//                 code: httpStatus.CREATED,
//                 message: mockRequest.__('role.success.created'),
//                 data: mockRole,
//             });
//         });

//         it('should handle duplicate role name', async () => {
//             const mockRole = createMockRole();
//             const createRoleRequest = createMockCreateRoleRequest();

//             vi.spyOn(mockRoleDao, 'findById').mockResolvedValue(mockRole);

//             const result = await roleService.createRole(createRoleRequest);

//             expect(result).toEqual({
//                 success: false,
//                 code: httpStatus.BAD_REQUEST,
//                 message: mockRequest.__('role.errors.name_taken'),
//                 error: expect.any(Object),
//             });
//         });

//         it('should handle unexpected errors during role creation', async () => {
//             const createRoleRequest = createMockCreateRoleRequest();

//             vi.spyOn(mockRoleDao, 'findById').mockRejectedValue(new Error('Database error'));

//             await expect(roleService.createRole(createRoleRequest)).rejects.toThrow(
//                 mockRequest.__('role.errors.create_failed')
//             );
//         });
//     });

//     describe('updateRole', () => {
//         it('should successfully update an existing role', async () => {
//             const mockRole = createMockRole();
//             const updatedMockRole = { ...mockRole, role_name: 'Updated Admin' };
//             const updateRoleRequest = createMockUpdateRoleRequest();

//             vi.spyOn(mockRoleDao, 'findById').mockResolvedValue(mockRole);
//             vi.spyOn(mockRoleDao, 'update').mockResolvedValue(updatedMockRole);

//             const result = await roleService.updateRole('admin', updateRoleRequest);

//             expect(result).toEqual({
//                 success: true,
//                 code: httpStatus.OK,
//                 message: mockRequest.__('role.success.updated'),
//                 data: updatedMockRole,
//             });
//         });

//         it('should handle non-existent role', async () => {
//             const updateRoleRequest = createMockUpdateRoleRequest();

//             vi.spyOn(mockRoleDao, 'findById').mockResolvedValue(null);

//             const result = await roleService.updateRole('non-existent', updateRoleRequest);

//             expect(result).toEqual({
//                 success: false,
//                 code: httpStatus.NOT_FOUND,
//                 message: mockRequest.__('role.errors.not_found'),
//                 error: expect.any(Object),
//             });
//         });

//         it('should handle unexpected errors during role update', async () => {
//             const mockRole = createMockRole();
//             const updateRoleRequest = createMockUpdateRoleRequest();

//             vi.spyOn(mockRoleDao, 'findById').mockResolvedValue(mockRole);
//             vi.spyOn(mockRoleDao, 'update').mockRejectedValue(new Error('Database error'));

//             await expect(roleService.updateRole('admin', updateRoleRequest)).rejects.toThrow(
//                 mockRequest.__('role.errors.update_failed')
//             );
//         });
//     });

//     describe('deleteRole', () => {
//         it('should successfully delete an existing role', async () => {
//             const mockRole = createMockRole();
//             vi.spyOn(mockRoleDao, 'findById').mockResolvedValue(mockRole);
//             vi.spyOn(mockRoleDao, 'delete').mockResolvedValue(true);

//             const result = await roleService.deleteRole('admin');

//             expect(result).toEqual({
//                 success: true,
//                 code: httpStatus.OK,
//                 message: mockRequest.__('role.success.deleted'),
//                 data: null,
//             });
//             expect(mockRoleDao.delete).toHaveBeenCalledWith('admin');
//         });

//         it('should handle non-existent role', async () => {
//             vi.spyOn(mockRoleDao, 'findById').mockResolvedValue(null);

//             const result = await roleService.deleteRole('non-existent');

//             expect(result).toEqual({
//                 success: false,
//                 code: httpStatus.NOT_FOUND,
//                 message: mockRequest.__('role.errors.not_found'),
//                 error: expect.any(Object),
//             });
//             expect(mockRoleDao.delete).not.toHaveBeenCalled();
//         });

//         it('should handle unexpected errors during role deletion', async () => {
//             const mockRole = createMockRole();
//             vi.spyOn(mockRoleDao, 'findById').mockResolvedValue(mockRole);
//             vi.spyOn(mockRoleDao, 'delete').mockRejectedValue(new Error('Database error'));

//             await expect(roleService.deleteRole('admin')).rejects.toThrow(
//                 mockRequest.__('role.errors.delete_failed')
//             );
//         });
//     });

//     describe('getRoleById', () => {
//         it('should successfully retrieve an existing role', async () => {
//             const mockRole = createMockRole();
//             vi.spyOn(mockRoleDao, 'findById').mockResolvedValue(mockRole);

//             const result = await roleService.getRoleById('admin');

//             expect(result).toEqual({
//                 success: true,
//                 code: httpStatus.OK,
//                 message: mockRequest.__('role.success.retrieved'),
//                 data: mockRole,
//             });
//             expect(mockRoleDao.findById).toHaveBeenCalledWith('admin');
//         });

//         it('should handle non-existent role', async () => {
//             vi.spyOn(mockRoleDao, 'findById').mockResolvedValue(null);

//             const result = await roleService.getRoleById('non-existent');

//             expect(result).toEqual({
//                 success: false,
//                 code: httpStatus.NOT_FOUND,
//                 message: mockRequest.__('role.errors.not_found'),
//                 error: expect.any(Object),
//             });
//             expect(mockRoleDao.findById).toHaveBeenCalledWith('non-existent');
//         });

//         it('should handle unexpected errors during role retrieval', async () => {
//             vi.spyOn(mockRoleDao, 'findById').mockRejectedValue(new Error('Database error'));

//             await expect(roleService.getRoleById('admin')).rejects.toThrow(
//                 mockRequest.__('role.errors.retrieve_failed')
//             );
//             expect(mockRoleDao.findById).toHaveBeenCalledWith('admin');
//         });
//     });
// });
