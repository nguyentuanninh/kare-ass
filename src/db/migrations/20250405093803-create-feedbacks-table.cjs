module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('feedbacks', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            uuid: {
                allowNull: false,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                unique: true,
            },
            service_rating: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            staff_rating: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            hygiene_rating: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            would_recommend: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
            },
            comment: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            status: {
                type: Sequelize.ENUM('pending', 'reviewed'),
                allowNull: false,
                defaultValue: 'pending',
            },
            internal_note: {
                type: Sequelize.TEXT,
                allowNull: true,
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
        await queryInterface.dropTable('feedbacks');
    },
};
