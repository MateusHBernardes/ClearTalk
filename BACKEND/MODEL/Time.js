const { DataTypes } = require("sequelize");
const sequelize = require("../BANCO/db");

const Time = sequelize.define("Time", {
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

module.exports = Time;
