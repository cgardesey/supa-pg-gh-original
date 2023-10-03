'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('MtnPayments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      requestid: {
        type: Sequelize.STRING
      },
      name: {
        type: Sequelize.STRING
      },
      msisdn: {
        type: Sequelize.STRING
      },
      amount: {
        type: Sequelize.DOUBLE
      },
      description: {
        type: Sequelize.STRING
      },
      paymentref: {
        type: Sequelize.STRING
      },
      externalreferenceno: {
        type: Sequelize.STRING
      },
      message: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      },
      transactionstatusreason: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('MtnPayments');
  }
};