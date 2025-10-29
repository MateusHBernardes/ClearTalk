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

// ✅ INICIALIZAR MODELOS
const User = require("./MODEL/User")(sequelize);
const Feedback = require("./MODEL/Feedback")(sequelize);
const Time = require("./MODEL/Time")(sequelize);

// ✅ CONFIGURAR ASSOCIAÇÕES
User.hasMany(Feedback, { foreignKey: "gestorId", as: "FeedbacksCriados" });
Feedback.belongsTo(User, { foreignKey: "gestorId", as: "Gestor" });

User.hasMany(Feedback, { foreignKey: "funcionarioId", as: "FeedbacksRecebidos" });
Feedback.belongsTo(User, { foreignKey: "funcionarioId", as: "Funcionario" });

const app = express();

// ✅ CONFIGURAÇÃO CORRETA DO CORS - CORRIGIDA
app.use(cors({
  origin: true, // Permite todas as origens (para desenvolvimento)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middleware para headers CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

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

// ✅ ROTA PARA BUSCAR TODOS OS USUÁRIOS (com filtro por setor do gestor)
app.get("/users-all", async (req, res) => {
  try {
    const { gestorId } = req.query;
    
    let whereCondition = {};
    
    // Se gestorId for fornecido, filtrar apenas funcionários do mesmo setor
    if (gestorId) {
      const gestor = await User.findByPk(gestorId);
      if (gestor && gestor.setor) {
        whereCondition.setor = gestor.setor;
      }
    }
    
    // Sempre filtrar apenas funcionários (cargo 'funcionario')
    whereCondition.cargo = 'funcionario';
    whereCondition.status = true;

    const users = await User.findAll({
      attributes: ['id', 'nome', 'setor', 'cargo', 'status', 'cpf'],
      where: whereCondition,
      order: [['nome', 'ASC']]
    });
    
    res.json({ success: true, data: users });
  } catch (err) {
    console.error('Erro ao buscar usuários:', err);
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

// ✅ ROTA PARA VERIFICAR ACESSO DO GESTOR
app.get("/gestor/:id/setor", async (req, res) => {
  try {
    const gestor = await User.findByPk(req.params.id);
    if (!gestor) {
      return res.status(404).json({ success: false, error: "Gestor não encontrado" });
    }
    
    res.json({ success: true, data: { setor: gestor.setor } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ ROTA PARA BUSCAR FEEDBACKS DE UM FUNCIONÁRIO ESPECÍFICO
app.get("/feedbacks/funcionario/:funcionarioId", async (req, res) => {
  try {
    const feedbacks = await Feedback.findAll({
      where: { 
        funcionarioId: req.params.funcionarioId,
        enviado: true
      },
      include: [
        { model: User, as: 'Funcionario', attributes: ['id', 'nome', 'setor'] },
        { model: User, as: 'Gestor', attributes: ['id', 'nome', 'setor'] }
      ],
      order: [['data', 'DESC']]
    });
    
    res.json({ success: true, data: feedbacks });
  } catch (err) {
    console.error('Erro ao buscar feedbacks do funcionário:', err);
    res.status(500).json({ success: false, error: "Erro ao buscar feedbacks" });
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