import models from '@/models/index.js';
import { IRole } from '@/models/interfaces/IRole.js';
import { ModelStatic } from 'sequelize';
import SuperDao from './SuperDao.js';

const Role = models.role as unknown as ModelStatic<IRole>;

export default class RoleDao extends SuperDao<IRole> {
    public readonly Role: ModelStatic<IRole>;

    constructor() {
        super(Role);
        this.Role = Role;
    }
}
