import models from '@/models/index.js';
import { ITokenDB } from '@/models/interfaces/IToken.js';
import { ModelStatic } from 'sequelize';
import SuperDao from './SuperDao.js';

const Token = models.token as unknown as ModelStatic<ITokenDB>;

export default class TokenDao extends SuperDao<ITokenDB> {
    public readonly Token: ModelStatic<ITokenDB>;

    constructor() {
        super(Token);
        this.Token = Token;
    }
}
