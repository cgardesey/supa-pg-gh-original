'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Payments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      client: {
        type: Sequelize.STRING,
      },
      refNo: {
        type: Sequelize.STRING,
        unique: true
      },
      name: {
        type: Sequelize.STRING
      },
      msisdn: {
        type: Sequelize.STRING
      },
      network: {
        type: Sequelize.STRING
      },
      amount: {
        type: Sequelize.DOUBLE
      },
      narration: {
        type: Sequelize.STRING
      },
      uniwalletTransactionId: {
        type: Sequelize.STRING
      },
      networkTransactionId: {
        type: Sequelize.STRING
      },
      responseCode: {
        type: Sequelize.STRING
      },
      responseMessage: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      },
      balance: {
        type: Sequelize.DOUBLE
      },
      payerid: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Payments');
  }
};