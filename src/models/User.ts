import { Model } from 'sequelize';
import { UserStatus } from '@/configs/constant.js';

export default (sequelize, DataTypes) => {
    class User extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            User.belongsTo(models.role, {
                foreignKey: 'role_id',
                as: 'role',
            });
        }
    }

    User.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            uuid: {
                type: DataTypes.UUID,
                allowNull: false,
                unique: true,
            },
            display_name: DataTypes.STRING,
            username: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            password: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            role_id: {
                type: DataTypes.STRING,
                allowNull: true,
                references: {
                    model: 'roles',
                    key: 'id',
                },
            },
            status: {
                type: DataTypes.ENUM(...Object.values(UserStatus)),
                allowNull: false,
            },
            address: DataTypes.STRING,
            phone_number: DataTypes.STRING,
            metadata: {
                type: DataTypes.JSON,
                allowNull: true,
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            updated_at: {
                type: DataTypes.DATE,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'user',
            underscored: true,
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        }
    );
    return User;
};
