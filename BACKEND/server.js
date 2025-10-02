const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Sequelize } = require("sequelize");

// ✅ CONFIGURAÇÃO DO BANCO SQLITE
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database.sqlite", // Arquivo na pasta BACKEND
  logging: false
});

// ✅ INICIALIZAR MODELOS
const User = require("./MODEL/User")(sequelize);
const Time = require("./MODEL/Time")(sequelize);
const Feedback = require("./MODEL/Feedback")(sequelize);

// ✅ CONFIGURAR ASSOCIAÇÕES MANUALMENTE (SEM associations.js)
Time.hasMany(User, { foreignKey: "timeId" });
User.belongsTo(Time, { foreignKey: "timeId" });

User.hasMany(Feedback, { foreignKey: "gestorId", as: "FeedbacksCriados" });
Feedback.belongsTo(User, { foreignKey: "gestorId", as: "Gestor" });

User.hasMany(Feedback, { foreignKey: "funcionarioId", as: "FeedbacksRecebidos" });
Feedback.belongsTo(User, { foreignKey: "funcionarioId", as: "Funcionario" });

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ ROTA DE TESTE
app.get("/", (req, res) => {
  res.json({ message: "✅ API ClearTalk funcionando!", status: "OK" });
});

// ✅ IMPORTAR ROTAS
const userRoutes = require("./CONTROLLER/user")(User);
const feedbackRoutes = require("./CONTROLLER/feedback")(Feedback, User);
const timeRoutes = require("./CONTROLLER/time")(Time);

app.use("/users", userRoutes);
app.use("/feedbacks", feedbackRoutes);
app.use("/times", timeRoutes);

// ✅ ROTA PARA BUSCAR USUÁRIOS COM SEUS TIMES
app.get("/users-with-teams", async (req, res) => {
  try {
    const users = await User.findAll({
      include: [{
        model: Time,
        attributes: ['id', 'nome']
      }]
    });
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ ROTA PARA ASSOCIAR USUÁRIO A TIME
app.put("/users/:id/team", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: "Usuário não encontrado" });

    await user.update({ timeId: req.body.timeId });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ✅ SINCRONIZAR E INICIAR
sequelize.authenticate()
  .then(() => {
    console.log("✅ Conectado ao banco SQLite!");
    return sequelize.sync({ force: false });
  })
  .then(async () => {
    // Criar um usuário admin padrão se não existir
    const adminExists = await User.findOne({ where: { cpf: '123' } });
    if (!adminExists) {
      await User.create({
        nome: 'Admin',
        cpf: '123',
        cargo: 'admin',
        setor: 'TI'
      });
      console.log('👤 Usuário admin criado (nome: Admin, CPF: 123)');
    }

    const PORT = 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📊 Acesse: http://localhost:${PORT}`);
      console.log(`👥 Users with teams: http://localhost:${PORT}/users-with-teams`);
    });
  })
  .catch(err => {
    console.error("❌ Erro:", err);
  });