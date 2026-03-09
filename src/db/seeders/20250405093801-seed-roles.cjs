module.exports = {
    up: async (queryInterface, Sequelize) =>
        queryInterface.bulkInsert('roles', [
            {
                id: 'admin',
                role_name: 'Administrator',
                permissions: JSON.stringify({
                    user: ['view', 'create', 'edit', 'delete'],
                    role: ['view', 'create', 'edit', 'delete'],
                }),
            },
            {
                id: 'dentist',
                role_name: 'Dentist',
                permissions: JSON.stringify({
                    user: ['view'],
                    role: ['view'],
                }),
            },
            {
                id: 'receptionist',
                role_name: 'Receptionist',
                permissions: JSON.stringify({
                    user: ['view', 'create', 'edit'],
                    role: ['view'],
                }),
            },
            {
                id: 'salesperson',
                role_name: 'Salesperson',
                permissions: JSON.stringify({
                    user: ['view'],
                    role: ['view'],
                }),
            },
        ]),

    down: async (queryInterface, Sequelize) => queryInterface.bulkDelete('roles', null, {}),
};
