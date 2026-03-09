import { Model } from 'sequelize';
import { FeedbackStatus } from '@/configs/constant.js';

export default (sequelize, DataTypes) => {
    class Feedback extends Model {
        static associate(_models) {}
    }

    Feedback.init(
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
            service_rating: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            staff_rating: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            hygiene_rating: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            would_recommend: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
            },
            comment: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            status: {
                type: DataTypes.ENUM(...Object.values(FeedbackStatus)),
                allowNull: false,
                defaultValue: FeedbackStatus.PENDING,
            },
            internal_note: {
                type: DataTypes.TEXT,
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
            modelName: 'feedback',
            underscored: true,
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        }
    );

    return Feedback;
};
