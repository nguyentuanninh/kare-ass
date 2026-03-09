module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('roles', {
            id: {
                allowNull: false,
                type: Sequelize.STRING,
                primaryKey: true,
            },
            role_name: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
            },
            permissions: {
                type: Sequelize.JSON,
                allowNull: false,
                defaultValue: {},
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
        await queryInterface.dropTable('roles');
    },
};
