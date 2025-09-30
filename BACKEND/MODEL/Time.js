const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Time = sequelize.define("Time", {
    id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    nome: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    gestorId: { 
      type: DataTypes.INTEGER, 
      allowNull: true 
    }
  }, {
    tableName: 'times'
  });

  return Time;
};