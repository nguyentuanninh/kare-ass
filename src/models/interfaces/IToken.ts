import { Model } from 'sequelize';

/**
 * Interface representing a token as stored in the database
 * Contains all fields including internal and sensitive data
 */
export interface ITokenDB extends Model {
    id: number;
    token: string;
    user_uuid: string;
    type: string;
    expires: Date;
    blacklisted: boolean;
    created_at: Date;
    updated_at: Date;
}

/**
 * Interface representing a token as returned in API responses
 * Contains only the fields that should be exposed to clients
 */
export interface ITokenResponse {
    token: string;
    expires: Date;
    type: string;
}

export interface ITokens {
    access: ITokenResponse;
    refresh: ITokenResponse;
}
