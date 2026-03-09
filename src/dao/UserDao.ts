import models from '@/models/index.js';
import { IUserDB } from '@/models/interfaces/IUser.js';
import { ModelStatic } from 'sequelize';
import SuperDao from './SuperDao.js';

const User = models.user as unknown as ModelStatic<IUserDB>;

export default class UserDao extends SuperDao<IUserDB> {
    public readonly User: ModelStatic<IUserDB>;

    constructor() {
        super(User);
        this.User = User;
    }
}
