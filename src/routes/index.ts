import { Router } from 'express';
import authRoute from './authRoute.js';
import rolesRoute from './rolesRoute.js';
import feedbackRoute from './feedbackRoute.js';

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
    {
        path: '/feedbacks',
        route: feedbackRoute,
    },
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

export default router;
