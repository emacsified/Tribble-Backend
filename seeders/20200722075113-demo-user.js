'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
     await queryInterface.bulkInsert('Users', [{
        name: 'John Doe',
        password: '1234',
        role: 'manager',
        verified: true,
        points: 0,
         updatedAt: new Date(),
         createdAt: new Date(),
         email: 'johndoe@company.test'
     },
        {
             name: "Jane Doe",
             password: '1234',
             role: 'manager',
             verified: true,
             points: 1000,
             updatedAt: new Date(),
            createdAt: new Date(),
            email: 'janedoe@company.test'
         }], {});
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
