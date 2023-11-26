'use strict';

module.exports = {
  // email: DataTypes.STRING,
  //   password: DataTypes.STRING,
  //   firstName: DataTypes.STRING,
  //   email: DataTypes.STRING,
  //   address: DataTypes.STRING,
  //   gender: DataTypes.BOOLEAN,
  //   roleid: DataTypes.STRING,
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Users', [{
      email: 'admin@gmail.com',
      password: '123456',
      firstName: 'TUAN',
      lastName: 'NGUYEN',
      address: 'USA',
      phonenumber:'12345678',
      gender: 1,
      image: 'avataTA',

      roleId: 'ROLE',
      positionId: 'R1',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {});
  }
};
