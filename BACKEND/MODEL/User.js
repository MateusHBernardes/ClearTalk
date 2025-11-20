const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const User = sequelize.define("User", {
    id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    nome: { 
      type: DataTypes.STRING, 
      allowNull: false
    },
    cpf: { 
      type: DataTypes.STRING, 
      allowNull: false
    },
    senha: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '123456'
    },
    cargo: { 
      type: DataTypes.STRING, 
      allowNull: false
    },
    setor: { 
      type: DataTypes.STRING
    },
    status: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: true 
    }
  }, {
    tableName: 'users'
  });

  return User;
};