const express = require("express");

module.exports = (User) => {
  const router = express.Router();

  // Rota de login
  router.post("/login", async (req, res) => {
    try {
      const { nome, cpf } = req.body;
      
      if (!nome || !cpf) {
        return res.status(400).json({ success: false, error: "Nome e CPF são obrigatórios" });
      }

      const user = await User.findOne({ where: { nome, cpf } });
      if (!user) {
        return res.status(401).json({ success: false, error: "Credenciais inválidas" });
      }

      if (!user.status) {
        return res.status(403).json({ success: false, error: "Usuário inativo" });
      }

      res.json({ 
        success: true, 
        data: {
          id: user.id,
          nome: user.nome,
          cargo: user.cargo,
          setor: user.setor
        }
      });
    } catch (err) {
      res.status(500).json({ success: false, error: "Erro no servidor" });
    }
  });

  // Rota: listar todos os usuários
  router.get("/", async (req, res) => {
    try {
      const users = await User.findAll();
      res.json({ success: true, data: users });
    } catch (err) {
      res.status(500).json({ success: false, error: "Erro ao buscar usuários" });
    }
  });

  // Rota: criar um novo usuário
  router.post("/", async (req, res) => {
    try {
      const { nome, cpf, cargo } = req.body;
      
      if (!nome || !cpf || !cargo) {
        return res.status(400).json({ 
          success: false, 
          error: "Campos obrigatórios: nome, CPF e cargo" 
        });
      }

      const novoUser = await User.create(req.body);
      res.status(201).json({ success: true, data: novoUser });
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ 
          success: false, 
          error: "CPF já cadastrado" 
        });
      }
      res.status(400).json({ 
        success: false, 
        error: "Erro ao criar usuário", 
        details: err.message 
      });
    }
  });

  // Rota: buscar usuário por ID
  router.get("/:id", async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ success: false, error: "Usuário não encontrado" });
      res.json({ success: true, data: user });
    } catch (err) {
      res.status(500).json({ success: false, error: "Erro ao buscar usuário" });
    }
  });

  // Rota: atualizar usuário
  router.put("/:id", async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ success: false, error: "Usuário não encontrado" });
      await user.update(req.body);
      res.json({ success: true, data: user });
    } catch (err) {
      res.status(400).json({ success: false, error: "Erro ao atualizar usuário", details: err.message });
    }
  });

  // Rota: deletar usuário (soft delete)
  router.delete("/:id", async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ success: false, error: "Usuário não encontrado" });
      await user.update({ status: false });
      res.json({ success: true, message: "Usuário inativado com sucesso" });
    } catch (err) {
      res.status(500).json({ success: false, error: "Erro ao deletar usuário" });
    }
  });

  return router;
};