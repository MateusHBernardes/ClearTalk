const { DataTypes } = require("sequelize");
const sequelize = require("../BANCO/db");

const Feedback = sequelize.define("Feedback", {
  data: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW, // coloca data atual automaticamente
  },
  feedback: {
    type: DataTypes.TEXT, // pode ser longo
    allowNull: false
  },
  pontosMelhoria: {
    type: DataTypes.TEXT,
  },
  enviar: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }
});

module.exports = Feedback;
