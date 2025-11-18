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
      allowNull: false,
      validate: {
        notEmpty: { msg: "Nome é obrigatório" },
        len: { args: [2, 100], msg: "Nome deve ter entre 2 e 100 caracteres" }
      }
    },
    cpf: { 
      type: DataTypes.STRING, 
      allowNull: false,
      unique: true, // ✅ MANTÉM UNIQUE MAS SEM INDEX EXPLÍCITO PROBLEMÁTICO
      validate: {
        notEmpty: { msg: "CPF é obrigatório" },
        len: { args: [11, 14], msg: "CPF deve ter entre 11 e 14 caracteres" }
      }
    },
    cargo: { 
      type: DataTypes.STRING, 
      allowNull: false,
      validate: {
        isIn: { 
          args: [['admin', 'gestor', 'funcionario']], 
          msg: "Cargo deve ser: admin, gestor ou funcionario" 
        }
      }
    },
    setor: { 
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Geral',
      validate: {
        notEmpty: { msg: "Setor é obrigatório" }
      }
    },
    status: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: true,
      comment: 'true = ativo, false = inativo (não pode fazer login)'
    }
  }, {
    tableName: 'users',
    timestamps: true
    // ✅ REMOVIDO INDEXES EXPLÍCITOS QUE CAUSAM CONFLITO
  });

  return User;
};