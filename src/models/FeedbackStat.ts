import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
    class FeedbackStat extends Model {
        static associate(_models) {}
    }

    FeedbackStat.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            date: {
                type: DataTypes.DATEONLY,
                allowNull: false,
                unique: true,
            },
            count: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            sum_service_rating: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            sum_staff_rating: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            sum_hygiene_rating: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            recommend_count: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            pending_delta: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            reviewed_delta: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
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
            modelName: 'feedbackStat',
            tableName: 'feedback_stats',
            underscored: true,
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        }
    );

    return FeedbackStat;
};
