import { Router } from 'express';
import authRoute from './authRoute.js';
import rolesRoute from './rolesRoute.js';

const router = Router();

const defaultRoutes = [
    {
        path: '/auth',
        route: authRoute,
    },
    {
        path: '/roles',
        route: rolesRoute,
    },
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

export default router;
