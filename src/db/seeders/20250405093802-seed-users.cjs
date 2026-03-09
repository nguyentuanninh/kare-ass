// eslint-disable-next-line @typescript-eslint/no-var-requires
const bcrypt = require('bcrypt');

module.exports = {
    up: async (queryInterface, Sequelize) =>
        queryInterface.bulkInsert('users', [
            {
                uuid: 'c7ba68db-c39d-478b-8df9-46be3de7c366',
                display_name: 'John Doe',
                username: 'johndoe',
                status: 'active',
                role_id: 'admin',
                password: bcrypt.hashSync('123456', 8),
                created_at: new Date(),
                updated_at: new Date(),
            },
        ]),

    down: async (queryInterface, Sequelize) => queryInterface.bulkDelete('users', null, {}),
};
