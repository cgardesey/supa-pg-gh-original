'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MtnPayment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  MtnPayment.init({
    requestid: DataTypes.STRING,
    name: DataTypes.STRING,
    msisdn: DataTypes.STRING,
    amount: DataTypes.DOUBLE,
    description: DataTypes.STRING,
    paymentref: DataTypes.STRING,
    externalreferenceno: DataTypes.STRING,
    message: DataTypes.STRING,
    status: DataTypes.STRING,
    transactionstatusreason: DataTypes.STRING,
    payerid: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'MtnPayment',
  });
  return MtnPayment;
};