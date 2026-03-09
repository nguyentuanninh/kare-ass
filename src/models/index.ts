import { Sequelize, DataTypes } from 'sequelize';
import dbConfig from '@/configs/database.js';
import User from './User.js';
import Token from './Token.js';
import Role from './Role.js';
import Feedback from './Feedback.js';

let sequelize;
if (dbConfig.database && dbConfig.username) {
    sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig);
}

const db = {
    user: User(sequelize, DataTypes),
    token: Token(sequelize, DataTypes),
    role: Role(sequelize, DataTypes),
    feedback: Feedback(sequelize, DataTypes),
    sequelize,
    Sequelize,
};

// // // After all models are imported, run the associations (if defined)
Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
