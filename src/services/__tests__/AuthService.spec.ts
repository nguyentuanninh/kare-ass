// import { describe, it, expect, beforeEach, vi } from 'vitest';
// import httpStatus from 'http-status';
// import * as bcrypt from 'bcrypt';
// import { IUserDB, IUserResponse } from '@/models/interfaces/IUser.js';
// import { ITokenDB, ITokens } from '@/models/interfaces/IToken.js';
// import { tokenTypes } from '@/configs/tokens.js';
// import { UserStatus } from '@/configs/constant.js';
// import { UserCreateRequestSchemaType } from '@/schemas/users.schema.js';
// import ApiError from '@/helpers/ApiError.js';
// import UserDao from '@/dao/UserDao.js';
// import TokenDao from '@/dao/TokenDao.js';
// import TokenService from '@/services/TokenService.js';
// import UserService from '@/services/UserService.js';
// import RedisService from '@/services/RedisService.js';
// import { mockRequest } from '@/__tests__/utils/mockI18n.js';
// import AuthService from '../AuthService.js';

// // Type definitions for mock data
// type MockUser = IUserDB & {
//     toJSON: () => IUserResponse;
// };

// type MockRegistrationRequest = UserCreateRequestSchemaType;

// type MockRefreshToken = ITokenDB;

// // Mock factories
// const createMockRegistrationRequest = (
//     overrides: Partial<MockRegistrationRequest> = {}
// ): MockRegistrationRequest => ({
//     username: 'johndoe',
//     password: '123123Asd',
//     confirm_password: '123123Asd',
//     role_id: 'admin',
//     display_name: 'John Doe',
//     metadata: {},
//     ...overrides,
// });

// const createMockUser = (overrides: Partial<MockUser> = {}): MockUser =>
//     ({
//         display_name: 'John Doe',
//         username: 'johndoe',
//         uuid: '4d85f12b-6e5b-468b-a971-eabe8acc9d08',
//         id: 1,
//         password: bcrypt.hashSync('123123Asd', 8),
//         role_id: 'admin',
//         status: UserStatus.ACTIVE,
//         created_at: new Date(),
//         updated_at: new Date(),
//         toJSON: () => ({
//             display_name: 'John Doe',
//             username: 'johndoe',
//             uuid: '4d85f12b-6e5b-468b-a971-eabe8acc9d08',
//             status: UserStatus.ACTIVE,
//         }),
//         ...overrides,
//     } as unknown as MockUser);

// const createMockTokens = (overrides: Partial<ITokens> = {}): ITokens => ({
//     access: { token: 'access-token', expires: new Date(), type: tokenTypes.ACCESS },
//     refresh: { token: 'refresh-token', expires: new Date(), type: tokenTypes.REFRESH },
//     ...overrides,
// });

// const createMockRefreshToken = (overrides: Partial<MockRefreshToken> = {}): MockRefreshToken => ({
//     id: 1,
//     user_uuid: '4d85f12b-6e5b-468b-a971-eabe8acc9d08',
//     token: 'refresh-token',
//     type: tokenTypes.REFRESH,
//     expires: new Date(),
//     blacklisted: false,
//     created_at: new Date(),
//     updated_at: new Date(),
//     ...overrides,
// });

// // Mock service instances
// const mockUserService = vi.mocked(new UserService());
// const mockTokenService = vi.mocked(new TokenService());
// const mockRedisService = vi.mocked(new RedisService());
// const mockUserDao = vi.mocked(new UserDao());
// const mockTokenDao = vi.mocked(new TokenDao());

// let authService: AuthService;
// const loginData = {
//     username: 'johndoe',
//     password: '123123Asd',
// } as const;

// describe('AuthService', () => {
//     beforeEach(() => {
//         // Create AuthService with mocked dependencies
//         authService = new AuthService();
//         (authService as any).userService = mockUserService;
//         (authService as any).tokenService = mockTokenService;
//         (authService as any).redisService = mockRedisService;
//         (authService as any).userDao = mockUserDao;
//         (authService as any).tokenDao = mockTokenDao;

//         // Mock i18n
//         vi.mock('@/middlewares/asyncContext', () => ({
//             useI18n: () => mockRequest,
//         }));

//         vi.clearAllMocks();
//     });

//     describe('registerUser', () => {
//         it('should successfully register a new user', async () => {
//             const mockUser = createMockUser();
//             const mockTokens = createMockTokens();
//             const registrationRequest = createMockRegistrationRequest();

//             vi.spyOn(mockUserService, 'createUser').mockResolvedValue({
//                 success: true,
//                 code: httpStatus.CREATED,
//                 message: mockRequest.__('user.success.created'),
//                 data: mockUser.toJSON(),
//             });

//             vi.spyOn(mockTokenService, 'generateAuthTokens').mockResolvedValue(mockTokens);

//             const result = await authService.registerUser(registrationRequest);

//             expect(result).toEqual({
//                 success: true,
//                 code: httpStatus.CREATED,
//                 message: mockRequest.__('auth.success.registered'),
//                 data: {
//                     user: mockUser.toJSON(),
//                     tokens: mockTokens,
//                 },
//             });
//         });

//         it('should handle registration failure', async () => {
//             const errorResponse = {
//                 success: false,
//                 code: httpStatus.BAD_REQUEST,
//                 message: mockRequest.__('user.errors.username_taken'),
//                 error: {
//                     code: httpStatus.BAD_REQUEST,
//                     isOperational: true,
//                     name: 'ValidationError',
//                     message: mockRequest.__('user.errors.username_taken'),
//                 } as ApiError,
//             } as const;

//             const registrationRequest = createMockRegistrationRequest();

//             vi.spyOn(mockUserService, 'createUser').mockResolvedValue(errorResponse);

//             const result = await authService.registerUser(registrationRequest);

//             expect(result).toEqual(errorResponse);
//         });

//         it('should handle unexpected errors during registration', async () => {
//             const registrationRequest = createMockRegistrationRequest();

//             vi.spyOn(mockUserService, 'createUser').mockRejectedValue(new Error('Database error'));

//             await expect(authService.registerUser(registrationRequest)).rejects.toThrow(
//                 mockRequest.__('auth.errors.register_failed')
//             );
//         });
//     });

//     describe('loginWithUsernamePassword', () => {
//         it('should show INVALID USERNAME message', async () => {
//             const expectedResponse = {
//                 success: false,
//                 code: httpStatus.BAD_REQUEST,
//                 message: mockRequest.__('auth.errors.invalid_username'),
//                 error: expect.any(Object),
//             } as const;

//             vi.spyOn(mockUserDao, 'findByUsername').mockResolvedValue(null);

//             const response = await authService.loginWithUsernamePassword('testuser', '23232132');
//             expect(response).toEqual(expectedResponse);
//         });

//         it('should show WRONG PASSWORD message', async () => {
//             const expectedResponse = {
//                 success: false,
//                 code: httpStatus.BAD_REQUEST,
//                 message: mockRequest.__('auth.errors.wrong_password'),
//                 error: expect.any(Object),
//             } as const;

//             const mockUser = createMockUser({
//                 password: bcrypt.hashSync('2322342343', 8),
//             });

//             vi.spyOn(mockUserDao, 'findByUsername').mockResolvedValue(mockUser);

//             const response = await authService.loginWithUsernamePassword(
//                 loginData.username,
//                 loginData.password
//             );
//             expect(response).toEqual(expectedResponse);
//         });

//         it('should successfully login with valid credentials', async () => {
//             const mockUser = createMockUser({
//                 password: bcrypt.hashSync(loginData.password, 8),
//             });
//             const mockTokens = createMockTokens();

//             vi.spyOn(mockUserDao, 'findByUsername').mockResolvedValue(mockUser);
//             vi.spyOn(mockTokenService, 'generateAuthTokens').mockResolvedValue(mockTokens);

//             const response = await authService.loginWithUsernamePassword(
//                 loginData.username,
//                 loginData.password
//             );

//             expect(response).toEqual({
//                 success: true,
//                 code: httpStatus.OK,
//                 message: mockRequest.__('auth.success.logged_in'),
//                 data: {
//                     user: mockUser.toJSON(),
//                     tokens: mockTokens,
//                 },
//             });
//         });

//         it('should handle unexpected errors during login', async () => {
//             vi.spyOn(mockUserDao, 'findByUsername').mockRejectedValue(new Error('Database error'));

//             await expect(
//                 authService.loginWithUsernamePassword(loginData.username, loginData.password)
//             ).rejects.toThrow(mockRequest.__('auth.errors.login_failed'));
//         });
//     });

//     describe('refreshTokens', () => {
//         it('should successfully refresh tokens', async () => {
//             const mockRefreshToken = createMockRefreshToken();
//             const mockUser = createMockUser();
//             const mockTokens = createMockTokens();

//             vi.spyOn(mockTokenService, 'verifyToken').mockResolvedValue(mockRefreshToken);
//             vi.spyOn(mockUserService, 'getUserByUuid').mockResolvedValue(mockUser);
//             vi.spyOn(mockTokenService, 'removeTokenById').mockResolvedValue(true);
//             vi.spyOn(mockTokenService, 'generateAuthTokens').mockResolvedValue(mockTokens);

//             const result = await authService.refreshTokens('refresh-token');

//             expect(result).toEqual({
//                 success: true,
//                 code: httpStatus.OK,
//                 message: mockRequest.__('auth.success.tokens_refreshed'),
//                 data: mockTokens,
//             });
//         });

//         it('should handle user not found error', async () => {
//             const mockRefreshToken = createMockRefreshToken();

//             vi.spyOn(mockTokenService, 'verifyToken').mockResolvedValue(mockRefreshToken);
//             vi.spyOn(mockUserService, 'getUserByUuid').mockResolvedValue(null);

//             const result = await authService.refreshTokens('refresh-token');

//             expect(result).toEqual({
//                 success: false,
//                 code: httpStatus.BAD_GATEWAY,
//                 message: mockRequest.__('user.errors.not_found'),
//                 error: expect.any(Object),
//             });
//         });

//         it('should handle invalid refresh token document', async () => {
//             const mockRefreshToken = createMockRefreshToken();

//             vi.spyOn(mockTokenService, 'verifyToken').mockResolvedValue(mockRefreshToken);
//             vi.spyOn(mockTokenDao, 'findOne').mockRejectedValue(new Error('Token not found'));

//             const result = await authService.refreshTokens('refresh-token');

//             expect(result).toEqual({
//                 success: false,
//                 code: httpStatus.BAD_GATEWAY,
//                 message: mockRequest.__('user.errors.not_found'),
//                 error: expect.any(Object),
//             });
//         });

//         it('should handle unexpected errors during token refresh', async () => {
//             vi.spyOn(mockTokenService, 'verifyToken').mockRejectedValue(
//                 new Error('Token verification failed')
//             );

//             await expect(authService.refreshTokens('refresh-token')).rejects.toThrow(
//                 mockRequest.__('auth.errors.refresh_failed')
//             );
//         });
//     });

//     describe('logout', () => {
//         it('should successfully logout', async () => {
//             const mockRefreshToken = createMockRefreshToken();

//             vi.spyOn(mockTokenDao, 'findOne').mockResolvedValue(mockRefreshToken);
//             vi.spyOn(mockTokenDao, 'remove').mockResolvedValue(true);
//             vi.spyOn(mockRedisService, 'removeToken').mockResolvedValue(1);

//             const result = await authService.logout('access-token', 'refresh-token');

//             expect(result).toEqual({
//                 success: true,
//                 code: httpStatus.OK,
//                 message: mockRequest.__('auth.success.logged_out'),
//                 data: undefined,
//             });
//         });

//         it('should handle invalid refresh token', async () => {
//             vi.spyOn(mockTokenDao, 'findOne').mockResolvedValue(null);

//             const result = await authService.logout('access-token', 'refresh-token');

//             expect(result).toEqual({
//                 success: false,
//                 code: httpStatus.BAD_REQUEST,
//                 message: mockRequest.__('token.errors.invalid_refresh'),
//                 error: expect.any(Object),
//             });
//         });

//         it('should handle unexpected errors during logout', async () => {
//             vi.spyOn(mockTokenDao, 'findOne').mockRejectedValue(new Error('Database error'));

//             await expect(authService.logout('access-token', 'refresh-token')).rejects.toThrow(
//                 mockRequest.__('auth.errors.logout_failed')
//             );
//         });
//     });
// });
