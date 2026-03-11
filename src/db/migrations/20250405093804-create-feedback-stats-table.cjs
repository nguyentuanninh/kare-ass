module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('feedback_stats', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            date: {
                allowNull: false,
                type: Sequelize.DATEONLY,
                unique: true,
            },
            count: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: 'Number of new feedbacks created on this day',
            },
            sum_service_rating: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            sum_staff_rating: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            sum_hygiene_rating: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            recommend_count: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            pending_delta: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: '+1 per feedback created, -1 per feedback reviewed',
            },
            reviewed_delta: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: '+1 per feedback reviewed',
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('feedback_stats');
    },
};
