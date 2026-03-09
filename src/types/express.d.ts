import { IUserDB } from '@/models/interfaces/IUser.js';

declare global {
    namespace Express {
        interface Request {
            userInfo?: IUserDB;
            id: string;
        }
    }
}

declare module 'express-serve-static-core' {
    interface Request {
        /** The authenticated user information */
        userInfo?: IUserDB;
        /** Unique request identifier generated for each HTTP request */
        id: string;
    }
}
