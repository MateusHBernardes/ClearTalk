const express = require("express");

module.exports = (Feedback, User) => {
  const router = express.Router();

  // Rota: listar todos os feedbacks
  router.get("/", async (req, res) => {
    try {
      const feedbacks = await Feedback.findAll({
        include: [
          { model: User, as: 'Funcionario', attributes: ['id', 'nome', 'setor'] },
          { model: User, as: 'Gestor', attributes: ['id', 'nome'] }
        ],
        order: [['data', 'DESC']]
      });
      res.json({ success: true, data: feedbacks });
    } catch (err) {
      console.error('Erro ao buscar feedbacks:', err);
      res.status(500).json({ success: false, error: "Erro ao buscar feedbacks" });
    }
  });

  // Rota: obter um feedback específico
  router.get("/:id", async (req, res) => {
    try {
      const feedback = await Feedback.findByPk(req.params.id, {
        include: [
          { model: User, as: 'Funcionario', attributes: ['id', 'nome', 'setor'] },
          { model: User, as: 'Gestor', attributes: ['id', 'nome'] }
        ]
      });
      
      if (!feedback) {
        return res.status(404).json({ success: false, error: "Feedback não encontrado" });
      }
      
      res.json({ success: true, data: feedback });
    } catch (err) {
      console.error('Erro ao buscar feedback:', err);
      res.status(500).json({ success: false, error: "Erro ao buscar feedback" });
    }
  });

  // Rota: criar um novo feedback
  router.post("/", async (req, res) => {
    try {
      const { feedback_text, pontos_melhorar, funcionarioId, gestorId } = req.body;
      
      // Validações básicas
      if (!feedback_text || !pontos_melhorar || !funcionarioId || !gestorId) {
        return res.status(400).json({ success: false, error: "Todos os campos são obrigatórios" });
      }
      
      const novoFeedback = await Feedback.create({
        feedback_text,
        pontos_melhorar,
        funcionarioId,
        gestorId,
        data: new Date(),
        enviado: false
      });
      
      // Buscar o feedback criado com includes
      const feedbackCompleto = await Feedback.findByPk(novoFeedback.id, {
        include: [
          { model: User, as: 'Funcionario', attributes: ['id', 'nome', 'setor'] },
          { model: User, as: 'Gestor', attributes: ['id', 'nome'] }
        ]
      });
      
      res.json({ success: true, data: feedbackCompleto });
    } catch (err) {
      console.error('Erro ao criar feedback:', err);
      res.status(500).json({ success: false, error: "Erro ao criar feedback" });
    }
  });

  // Rota: atualizar um feedback
  router.put("/:id", async (req, res) => {
    try {
      const { feedback_text, pontos_melhorar, funcionarioId } = req.body;
      const feedback = await Feedback.findByPk(req.params.id);
      
      if (!feedback) {
        return res.status(404).json({ success: false, error: "Feedback não encontrado" });
      }
      
      // Atualizar campos
      if (feedback_text !== undefined) feedback.feedback_text = feedback_text;
      if (pontos_melhorar !== undefined) feedback.pontos_melhorar = pontos_melhorar;
      if (funcionarioId !== undefined) feedback.funcionarioId = funcionarioId;
      
      await feedback.save();
      
      // Buscar o feedback atualizado com includes
      const feedbackAtualizado = await Feedback.findByPk(feedback.id, {
        include: [
          { model: User, as: 'Funcionario', attributes: ['id', 'nome', 'setor'] },
          { model: User, as: 'Gestor', attributes: ['id', 'nome'] }
        ]
      });
      
      res.json({ success: true, data: feedbackAtualizado });
    } catch (err) {
      console.error('Erro ao atualizar feedback:', err);
      res.status(500).json({ success: false, error: "Erro ao atualizar feedback" });
    }
  });

  // Rota: excluir um feedback
  router.delete("/:id", async (req, res) => {
    try {
      const feedback = await Feedback.findByPk(req.params.id);
      
      if (!feedback) {
        return res.status(404).json({ success: false, error: "Feedback não encontrado" });
      }
      
      await feedback.destroy();
      res.json({ success: true, message: "Feedback excluído com sucesso" });
    } catch (err) {
      console.error('Erro ao excluir feedback:', err);
      res.status(500).json({ success: false, error: "Erro ao excluir feedback" });
    }
  });

  // Rota: enviar feedback (marcar como enviado)
  router.patch("/:id/enviar", async (req, res) => {
    try {
      const feedback = await Feedback.findByPk(req.params.id);
      
      if (!feedback) {
        return res.status(404).json({ success: false, error: "Feedback não encontrado" });
      }
      
      feedback.enviado = true;
      await feedback.save();
      
      res.json({ success: true, message: "Feedback enviado com sucesso" });
    } catch (err) {
      console.error('Erro ao enviar feedback:', err);
      res.status(500).json({ success: false, error: "Erro ao enviar feedback" });
    }
  });

  return router;
};