import { ActionType, ResourceType } from '@/configs/constant.js';
import { Model } from 'sequelize';

export type IPermissions = Partial<Record<ResourceType, ActionType[]>>;

export interface IRole extends Model {
    id: string;
    role_name: string;
    permissions: IPermissions;
    created_at: Date;
    updated_at: Date;
}
