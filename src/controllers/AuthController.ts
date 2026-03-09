import { RequestHandler } from 'express';
import AuthService from '@/services/AuthService.js';
import UserService from '@/services/UserService.js';

export default class AuthController {
    private userService: UserService;

    private authService: AuthService;

    constructor() {
        this.userService = new UserService();
        this.authService = new AuthService();
    }

    register: RequestHandler = async (req, res, next) => {
        try {
            const response = await this.authService.registerUser(req.body);
            if (response.success) {
                res.status(response.code).send(response);
            } else {
                next(response.error);
            }
        } catch (error) {
            next(error);
        }
    };

    checkUsername: RequestHandler = async (req, res, next) => {
        try {
            const response = await this.userService.isUsernameExists(req.body.username);
            if (response.success) {
                res.status(response.code).send(response);
            } else {
                next(response.error);
            }
        } catch (error) {
            next(error);
        }
    };

    login: RequestHandler = async (req, res, next) => {
        try {
            const { username, password } = req.body;
            console.log('hello');
            const loginResponse = await this.authService.loginWithUsernamePassword(
                username,
                password
            );

            if (loginResponse.success) {
                res.status(loginResponse.code).send(loginResponse);
            } else {
                next(loginResponse.error);
            }
        } catch (error) {
            next(error);
        }
    };

    logout: RequestHandler = async (req, res, next) => {
        try {
            const { access_token, refresh_token } = req.body;
            const response = await this.authService.logout(access_token, refresh_token);
            if (response.success) {
                res.status(response.code).send(response);
            } else {
                next(response.error);
            }
        } catch (error) {
            next(error);
        }
    };

    refreshTokens: RequestHandler = async (req, res, next) => {
        try {
            const response = await this.authService.refreshTokens(req.body.refresh_token);
            if (response.success) {
                res.status(response.code).send(response);
            } else {
                next(response.error);
            }
        } catch (error) {
            next(error);
        }
    };

    changePassword: RequestHandler = async (req, res, next) => {
        try {
            const response = await this.userService.changePassword(req);
            if (response.success) {
                res.status(response.code).send(response);
            } else {
                next(response.error);
            }
        } catch (error) {
            next(error);
        }
    };
}
