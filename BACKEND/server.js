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

// ✅ CONFIGURAR ASSOCIAÇÕES CORRETAMENTE
User.hasMany(Feedback, { 
  foreignKey: "gestorId", 
  as: "FeedbacksCriados" 
});

Feedback.belongsTo(User, { 
  foreignKey: "gestorId", 
  as: "Gestor" 
});

User.hasMany(Feedback, { 
  foreignKey: "funcionarioId", 
  as: "FeedbacksRecebidos" 
});

Feedback.belongsTo(User, { 
  foreignKey: "funcionarioId", 
  as: "Funcionario" 
});

const app = express();

// ✅ CONFIGURAÇÃO CORRETA DO CORS
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

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
const userRoutes = require("./CONTROLLER/user")(User, sequelize);
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
        whereCondition.cargo = 'funcionario';
      }
    }

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

// ✅ SINCRONIZAR E INICIAR COM TRATAMENTO DE ERRO
sequelize.authenticate()
  .then(() => {
    console.log("✅ Conectado ao banco SQLite!");
    
    // ✅ SINCRONIZAR SEM FORCE PARA MANTER DADOS EXISTENTES
    return sequelize.sync({ force: false, alter: true }).catch(syncError => {
      console.warn('⚠️ Aviso na sincronização:', syncError.message);
      console.log('🔄 Continuando com banco existente...');
      return Promise.resolve(); // Continua mesmo com erro
    });
  })
  .then(async () => {
    try {
      // ✅ VERIFICAR E CORRIGIR USUÁRIOS COM CPF NULL
      const usersComCPFNull = await User.findAll({
        where: {
          cpf: null
        }
      });
      
      if (usersComCPFNull.length > 0) {
        console.log(`🔄 Encontrados ${usersComCPFNull.length} usuários com CPF nulo. Corrigindo...`);
        
        for (const user of usersComCPFNull) {
          // Gerar CPF temporário único baseado no ID
          const cpfTemporario = `9999999999${user.id}`.slice(-11);
          await user.update({ cpf: cpfTemporario });
          console.log(`✅ Usuário ${user.nome} (ID: ${user.id}) recebeu CPF temporário: ${cpfTemporario}`);
        }
      }

      // ✅ CRIAR USUÁRIO ADMIN PADRÃO SE NÃO EXISTIR
      const adminExists = await User.findOne({ where: { cargo: 'admin', status: true } });
      if (!adminExists) {
        await User.create({
          nome: 'Administrador Sistema',
          cpf: '12345678900',
          cargo: 'admin',
          setor: 'TI',
          status: true
        });
        console.log('👤 Usuário admin criado (nome: Administrador Sistema, CPF: 12345678900)');
      }

      // ✅ CRIAR USUÁRIOS DE EXEMPLO PARA TESTE
      const usersExemplo = [
        { nome: 'João Silva - Gestor', cpf: '11122233344', cargo: 'gestor', setor: 'TI', status: true },
        { nome: 'Maria Santos - Funcionária', cpf: '22233344455', cargo: 'funcionario', setor: 'TI', status: true },
        { nome: 'Pedro Oliveira - Gestor', cpf: '33344455566', cargo: 'gestor', setor: 'RH', status: true },
        { nome: 'Ana Costa - Funcionária', cpf: '44455566677', cargo: 'funcionario', setor: 'RH', status: true },
        { nome: 'Carlos Lima - Funcionário Inativo', cpf: '55566677788', cargo: 'funcionario', setor: 'TI', status: false }
      ];

      for (const userData of usersExemplo) {
        const userExists = await User.findOne({ where: { cpf: userData.cpf } });
        if (!userExists) {
          await User.create(userData);
          console.log(`👤 Usuário ${userData.nome} criado`);
        }
      }

      const PORT = 3000;
      app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando na porta ${PORT}`);
        console.log(`📊 Acesse: http://localhost:${PORT}`);
        console.log(`👥 Todos usuários: http://localhost:${PORT}/users-all`);
        console.log(`📂 Setores: http://localhost:${PORT}/setores`);
        console.log(`📝 Feedbacks: http://localhost:${PORT}/feedbacks`);
        console.log('');
        console.log('🔑 USUÁRIOS PARA TESTE:');
        console.log('   Admin: nome="Administrador Sistema", CPF="12345678900"');
        console.log('   Gestor TI: nome="João Silva - Gestor", CPF="11122233344"');
        console.log('   Funcionário TI: nome="Maria Santos - Funcionária", CPF="22233344455"');
        console.log('   Funcionário Inativo: nome="Carlos Lima - Funcionário Inativo", CPF="55566677788"');
        console.log('');
        console.log('💡 DICA: Use o CPF como senha no login (apenas números, sem pontos ou traços)');
      });
    } catch (initError) {
      console.error('❌ Erro na inicialização:', initError);
    }
  })
  .catch(err => {
    console.error("❌ Erro fatal:", err);
  });