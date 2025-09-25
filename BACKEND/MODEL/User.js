// BACKEND/CONTROLLER/user.js
const express = require("express");
const router = express.Router();
const User = require("../MODEL/User");

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
    const novoUser = await User.create(req.body);
    res.status(201).json({ success: true, data: novoUser });
  } catch (err) {
    res.status(400).json({ success: false, error: "Erro ao criar usuário", details: err.message });
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

// Rota: deletar usuário
router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: "Usuário não encontrado" });

    await user.destroy();
    res.json({ success: true, message: "Usuário removido com sucesso" });
  } catch (err) {
    res.status(500).json({ success: false, error: "Erro ao deletar usuário" });
  }
});

module.exports = router;
