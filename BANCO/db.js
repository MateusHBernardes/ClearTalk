const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("cleartalk", "root", "sua_senha", {
  host: "localhost",
  dialect: "mysql",
});

sequelize.authenticate()
  .then(() => console.log("Conectado ao banco com sucesso!"))
  .catch(err => console.error("Erro ao conectar:", err));

module.exports = sequelize;
