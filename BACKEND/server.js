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
  origin: ['http://localhost', 'http://127.0.0.1', 'http://localhost:5500', 'http://127.0.0.1:5500'],
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

app.options('*', cors());
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
    
    let whereCondition = { status: true }; // ✅ SOMENTE USUÁRIOS ATIVOS
    
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
        { 
          model: User, 
          as: 'Funcionario', 
          attributes: ['id', 'nome', 'setor'] 
        },
        { 
          model: User, 
          as: 'Gestor', 
          attributes: ['id', 'nome', 'setor'] 
        }
      ],
      order: [['data', 'DESC']]
    });
    
    res.json({ success: true, data: feedbacks });
  } catch (err) {
    console.error('Erro ao buscar feedbacks do funcionário:', err);
    res.status(500).json({ success: false, error: "Erro ao buscar feedbacks" });
  }
});

// ✅ FUNÇÃO PARA ADICIONAR COLUNA SENHA SE NÃO EXISTIR
async function migrarBanco() {
  try {
    // Verificar se a coluna senha existe
    const result = await sequelize.query(`
      PRAGMA table_info(users);
    `);
    
    const colunas = result[0];
    const colunaSenhaExiste = colunas.some(coluna => coluna.name === 'senha');
    
    if (!colunaSenhaExiste) {
      console.log('🔄 Adicionando coluna "senha" à tabela users...');
      
      // Adicionar coluna senha
      await sequelize.query(`
        ALTER TABLE users ADD COLUMN senha VARCHAR(255) DEFAULT '123456';
      `);
      
      console.log('✅ Coluna "senha" adicionada com sucesso!');
      
      // Atualizar senha do admin existente
      await sequelize.query(`
        UPDATE users SET senha = 'admin123' WHERE cargo = 'admin';
      `);
      
      console.log('✅ Senha do admin atualizada para "admin123"');
    }
  } catch (error) {
    console.warn('⚠️ Aviso na migração:', error.message);
  }
}

// ✅ FUNÇÃO PARA GARANTIR UNICIDADE DO CPF
async function garantirUnicidadeCPF() {
    try {
        // Verificar se a constraint única já existe
        const result = await sequelize.query(`
            PRAGMA index_list(users);
        `);
        
        const indices = result[0];
        const indiceCPFExiste = indices.some(indice => 
            indice.name === 'users_cpf' || indice.name.includes('cpf')
        );
        
        if (!indiceCPFExiste) {
            console.log('🔄 Criando índice único para CPF...');
            
            // Criar índice único para CPF
            await sequelize.query(`
                CREATE UNIQUE INDEX IF NOT EXISTS idx_users_cpf_unique ON users(cpf);
            `);
            
            console.log('✅ Índice único para CPF criado com sucesso!');
        }
    } catch (error) {
        console.warn('⚠️ Aviso na criação do índice único:', error.message);
    }
}

// ✅ SINCRONIZAR E INICIAR
sequelize.authenticate()
  .then(() => {
    console.log("✅ Conectado ao banco SQLite!");
    return migrarBanco();
  })
  .then(() => {
    return garantirUnicidadeCPF();
  })
  .then(() => {
    return sequelize.sync({ force: false });
  })
  .then(async () => {
    // Criar um usuário admin padrão se não existir
    const adminExists = await User.findOne({ where: { cargo: 'admin' } });
    if (!adminExists) {
      await User.create({
        nome: 'Admin',
        cpf: '12345678900',
        senha: 'admin123',
        cargo: 'admin',
        setor: 'TI',
        status: true
      });
      console.log('👤 Usuário admin criado (nome: Admin, senha: admin123)');
    }

    const PORT = 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📊 Acesse: http://localhost:${PORT}`);
      console.log(`👥 Todos usuários: http://localhost:${PORT}/users-all`);
      console.log(`📂 Setores: http://localhost:${PORT}/setores`);
      console.log(`📝 Feedbacks: http://localhost:${PORT}/feedbacks`);
      console.log('');
      console.log('🔑 USUÁRIO ADMIN PARA TESTE:');
      console.log('   Nome: Admin');
      console.log('   Senha: admin123');
      console.log('');
      console.log('📝 REGRAS DA SENHA:');
      console.log('   - Mínimo 5 caracteres');
      console.log('   - Deve conter letras e números');
    });
  })
  .catch(err => {
    console.error("❌ Erro:", err);
  });