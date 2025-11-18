const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Feedback = sequelize.define("Feedback", {
    id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    feedback_text: { 
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Texto do feedback é obrigatório" }
      }
    },
    pontos_melhorar: { 
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Pontos a melhorar são obrigatórios" }
      }
    },
    data: { 
      type: DataTypes.DATE, 
      defaultValue: DataTypes.NOW 
    },
    enviado: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: false 
    },
    funcionarioId: { 
      type: DataTypes.INTEGER, 
      allowNull: false 
    },
    gestorId: { 
      type: DataTypes.INTEGER, 
      allowNull: false 
    }
  }, {
    tableName: 'feedbacks',
    timestamps: true
  });

  return Feedback;
};