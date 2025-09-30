const express = require("express");

module.exports = (Feedback, User) => {
  const router = express.Router();

  // Rota: listar todos os feedbacks
  router.get("/", async (req, res) => {
    try {
      const feedbacks = await Feedback.findAll({
        include: [
          { model: User, as: 'Gestor', attributes: ['id', 'nome'] },
          { model: User, as: 'Funcionario', attributes: ['id', 'nome'] }
        ]
      });
      res.json({ success: true, data: feedbacks });
    } catch (err) {
      res.status(500).json({ success: false, error: "Erro ao buscar feedbacks" });
    }
  });

  // Rota: criar um novo feedback
  router.post("/", async (req, res) => {
    try {
      const novoFeedback = await Feedback.create(req.body);
      res.json({ success: true, data: novoFeedback });
    } catch (err) {
      res.status(500).json({ success: false, error: "Erro ao criar feedback" });
    }
  });

  return router;
};