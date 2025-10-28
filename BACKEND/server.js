const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Sequelize, Op } = require("sequelize");

// ✅ CONFIGURAÇÃO DO BANCO SQLITE
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database.sqlite",
  logging: false
});

// ✅ INICIALIZAR MODELOS - APENAS USUÁRIOS E FEEDBACKS
const User = require("./MODEL/User")(sequelize);
const Feedback = require("./MODEL/Feedback")(sequelize);

// ✅ CONFIGURAR ASSOCIAÇÕES - SEM TIMES
User.hasMany(Feedback, { foreignKey: "gestorId", as: "FeedbacksCriados" });
Feedback.belongsTo(User, { foreignKey: "gestorId", as: "Gestor" });

User.hasMany(Feedback, { foreignKey: "funcionarioId", as: "FeedbacksRecebidos" });
Feedback.belongsTo(User, { foreignKey: "funcionarioId", as: "Funcionario" });

const app = express();

// ✅ CONFIGURAÇÃO CORRETA DO CORS
app.use(cors({
  origin: ["http://127.0.0.1:5500", "http://localhost:5500", "http://localhost:3000"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());

// ✅ ROTA DE TESTE
app.get("/", (req, res) => {
  res.json({ message: "✅ API ClearTalk funcionando!", status: "OK" });
});

// ✅ IMPORTAR ROTAS - SEM TIMES
const userRoutes = require("./CONTROLLER/user")(User);
const feedbackRoutes = require("./CONTROLLER/feedback")(Feedback, User);

app.use("/users", userRoutes);
app.use("/feedbacks", feedbackRoutes);

// ✅ ROTA PARA BUSCAR TODOS OS USUÁRIOS
app.get("/users-all", async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'nome', 'setor', 'cargo', 'status', 'cpf'],
      order: [['setor', 'ASC'], ['nome', 'ASC']]
    });
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ ROTA PARA OBTER SETORES ÚNICOS
app.get("/setores", async (req, res) => {
  try {
    const setores = await User.findAll({
      attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('setor')), 'setor']],
      where: {
        setor: {
          [Op.ne]: null
        }
      },
      order: [['setor', 'ASC']]
    });
    
    const setoresList = setores.map(item => item.setor).filter(Boolean);
    res.json({ success: true, data: setoresList });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
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
      console.log(`👥 Todos usuários: http://localhost:${PORT}/users-all`);
      console.log(`📂 Setores: http://localhost:${PORT}/setores`);
      console.log(`📝 Feedbacks: http://localhost:${PORT}/feedbacks`);
    });
  })
  .catch(err => {
    console.error("❌ Erro:", err);
  });