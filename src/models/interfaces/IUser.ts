import { UserStatus } from '@/configs/constant.js';
import { Model } from 'sequelize';
import { IRole } from './IRole.js';

/**
 * Interface representing a user as stored in the database
 * Contains all fields including internal and sensitive data
 */
export interface IUserDB extends Model {
    id: number;
    uuid: string;
    username: string;
    display_name: string;
    password: string;
    role: IRole;
    status: UserStatus;
    address?: string;
    phone_number?: string;
    metadata?: Record<string, any>;
    created_at: Date;
    updated_at: Date;
}

/**
 * Interface representing a user as returned in API responses
 * Contains only the fields that should be exposed to clients
 */
export interface IUserResponse {
    uuid: string;
    username: string;
    display_name: string;
    status: UserStatus;
    role: IRole;
    address?: string;
    phone_number?: string;
    metadata?: Record<string, any>;
}
