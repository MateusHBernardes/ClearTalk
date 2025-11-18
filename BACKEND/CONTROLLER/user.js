const express = require("express");

module.exports = (User, sequelize) => {
  const router = express.Router();

  // ✅ Rota de login MELHORADA - CPF como senha
  router.post("/login", async (req, res) => {
    try {
      const { nome, cpf } = req.body;
      
      if (!nome || !cpf) {
        return res.status(400).json({ success: false, error: "Nome e CPF são obrigatórios" });
      }

      // Remover caracteres não numéricos do CPF para validação
      const cpfLimpo = cpf.replace(/\D/g, '');
      
      const user = await User.findOne({ 
        where: { 
          nome: nome.trim(),
          cpf: cpfLimpo
        } 
      });
      
      if (!user) {
        return res.status(401).json({ success: false, error: "Credenciais inválidas" });
      }

      if (!user.status) {
        return res.status(403).json({ 
          success: false, 
          error: "Usuário inativo. Contate o administrador do sistema." 
        });
      }

      res.json({ 
        success: true, 
        data: {
          id: user.id,
          nome: user.nome,
          cargo: user.cargo,
          setor: user.setor,
          cpf: user.cpf
        }
      });
    } catch (err) {
      console.error('Erro no login:', err);
      res.status(500).json({ success: false, error: "Erro no servidor" });
    }
  });

  // ✅ Rota: listar todos os usuários (INCLUINDO INATIVOS)
  router.get("/", async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: ['id', 'nome', 'setor', 'cargo', 'status', 'cpf', 'createdAt', 'updatedAt'],
        order: [['status', 'DESC'], ['nome', 'ASC']] // Ativos primeiro
      });
      res.json({ success: true, data: users });
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
      res.status(500).json({ success: false, error: "Erro ao buscar usuários" });
    }
  });

  // ✅ Rota: criar um novo usuário
  router.post("/", async (req, res) => {
    try {
      const { nome, cpf, cargo, setor } = req.body;
      
      if (!nome || !cpf || !cargo) {
        return res.status(400).json({ 
          success: false, 
          error: "Campos obrigatórios: nome, CPF e cargo" 
        });
      }

      // Limpar CPF (remover pontos e traços)
      const cpfLimpo = cpf.replace(/\D/g, '');

      const novoUser = await User.create({
        nome: nome.trim(),
        cpf: cpfLimpo,
        cargo,
        setor: setor || 'Geral',
        status: true
      });
      
      res.status(201).json({ 
        success: true, 
        data: novoUser,
        message: "Usuário criado com sucesso! A senha é o CPF (apenas números)."
      });
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ 
          success: false, 
          error: "CPF já cadastrado no sistema" 
        });
      }
      console.error('Erro ao criar usuário:', err);
      res.status(400).json({ 
        success: false, 
        error: "Erro ao criar usuário", 
        details: err.message 
      });
    }
  });

  // ✅ Rota: buscar usuário por ID
  router.get("/:id", async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ success: false, error: "Usuário não encontrado" });
      res.json({ success: true, data: user });
    } catch (err) {
      console.error('Erro ao buscar usuário:', err);
      res.status(500).json({ success: false, error: "Erro ao buscar usuário" });
    }
  });

  // ✅ Rota: atualizar usuário (AGORA INCLUI REATIVAÇÃO)
  router.put("/:id", async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ success: false, error: "Usuário não encontrado" });
      
      // Se estiver atualizando CPF, limpar caracteres
      if (req.body.cpf) {
        req.body.cpf = req.body.cpf.replace(/\D/g, '');
      }
      
      await user.update(req.body);
      
      const acao = req.body.status !== undefined ? 
        (req.body.status ? 'reativado' : 'inativado') : 'atualizado';
      
      res.json({ 
        success: true, 
        data: user,
        message: `Usuário ${acao} com sucesso!` 
      });
    } catch (err) {
      console.error('Erro ao atualizar usuário:', err);
      res.status(400).json({ success: false, error: "Erro ao atualizar usuário", details: err.message });
    }
  });

  // ✅ Rota: inativar usuário (NÃO EXCLUI - APENAS MARCA COMO INATIVO)
  router.patch("/:id/inativar", async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ success: false, error: "Usuário não encontrado" });
      
      await user.update({ status: false });
      
      res.json({ 
        success: true, 
        message: "Usuário inativado com sucesso! Ele ainda aparecerá no sistema mas não poderá fazer login.",
        data: user
      });
    } catch (err) {
      console.error('Erro ao inativar usuário:', err);
      res.status(500).json({ success: false, error: "Erro ao inativar usuário" });
    }
  });

  // ✅ Rota: reativar usuário
  router.patch("/:id/reativar", async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ success: false, error: "Usuário não encontrado" });
      
      await user.update({ status: true });
      
      res.json({ 
        success: true, 
        message: "Usuário reativado com sucesso! Ele já pode fazer login novamente.",
        data: user
      });
    } catch (err) {
      console.error('Erro ao reativar usuário:', err);
      res.status(500).json({ success: false, error: "Erro ao reativar usuário" });
    }
  });

  // ✅ Rota: alternar status do usuário (inativar/reativar)
  router.patch("/:id/toggle-status", async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ success: false, error: "Usuário não encontrado" });
      
      const novoStatus = !user.status;
      await user.update({ status: novoStatus });
      
      const acao = novoStatus ? 'reativado' : 'inativado';
      
      res.json({ 
        success: true, 
        message: `Usuário ${acao} com sucesso!`,
        data: user
      });
    } catch (err) {
      console.error('Erro ao alternar status:', err);
      res.status(500).json({ success: false, error: "Erro ao alterar status do usuário" });
    }
  });

  // ✅ Rota: Listar todos os usuários com filtros (para gestores)
  router.get("/all/completo", async (req, res) => {
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
        attributes: ['id', 'nome', 'setor', 'cargo', 'status', 'cpf', 'createdAt'],
        where: whereCondition,
        order: [['status', 'DESC'], ['nome', 'ASC']] // Ativos primeiro
      });
      
      res.json({ success: true, data: users });
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ✅ Rota: Listar setores únicos
  router.get("/setores/lista", async (req, res) => {
    try {
      const setores = await User.findAll({
        attributes: [[sequelize.fn('DISTINCT', sequelize.col('setor')), 'setor']],
        where: {
          setor: {
            [sequelize.Op.ne]: null
          }
        },
        order: [['setor', 'ASC']]
      });
      
      const setoresList = setores.map(item => item.setor).filter(Boolean);
      res.json({ success: true, data: setoresList });
    } catch (err) {
      console.error('Erro ao buscar setores:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  return router;
};