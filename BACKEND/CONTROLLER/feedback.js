const express = require("express");

module.exports = (Feedback, User) => {
  const router = express.Router();

  // Rota: listar todos os feedbacks
  router.get("/", async (req, res) => {
    try {
      const feedbacks = await Feedback.findAll({
        include: [
          { model: User, as: 'Funcionario', attributes: ['id', 'nome', 'setor', 'status'] }, // ✅ INCLUIR STATUS
          { model: User, as: 'Gestor', attributes: ['id', 'nome', 'setor'] }
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
          { model: User, as: 'Funcionario', attributes: ['id', 'nome', 'setor', 'status'] }, // ✅ INCLUIR STATUS
          { model: User, as: 'Gestor', attributes: ['id', 'nome', 'setor'] }
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
      
      // Buscar gestor e funcionário para validar setor
      const gestor = await User.findByPk(gestorId);
      const funcionario = await User.findByPk(funcionarioId);
      
      if (!gestor) {
        return res.status(404).json({ success: false, error: "Gestor não encontrado" });
      }
      
      if (!funcionario) {
        return res.status(404).json({ success: false, error: "Funcionário não encontrado" });
      }

      // ✅ VALIDAR SE FUNCIONÁRIO ESTÁ ATIVO
      if (!funcionario.status) {
        return res.status(403).json({ 
          success: false, 
          error: "Não é possível criar feedback para funcionário inativo" 
        });
      }
      
      // Validar se gestor e funcionário são do mesmo setor
      if (gestor.setor !== funcionario.setor) {
        return res.status(403).json({ 
          success: false, 
          error: "Gestor só pode criar feedbacks para funcionários do mesmo setor" 
        });
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
          { model: User, as: 'Funcionario', attributes: ['id', 'nome', 'setor', 'status'] },
          { model: User, as: 'Gestor', attributes: ['id', 'nome', 'setor'] }
        ]
      });
      
      res.json({ success: true, data: feedbackCompleto });
    } catch (err) {
      console.error('Erro ao criar feedback:', err);
      res.status(500).json({ success: false, error: "Erro ao criar feedback" });
    }
  });

  // ✅ Rota: atualizar um feedback (BLOQUEAR SE JÁ ENVIADO)
  router.put("/:id", async (req, res) => {
    try {
      const { feedback_text, pontos_melhorar, funcionarioId, gestorId } = req.body;
      const feedback = await Feedback.findByPk(req.params.id);
      
      if (!feedback) {
        return res.status(404).json({ success: false, error: "Feedback não encontrado" });
      }
      
      // ✅ BLOQUEAR EDIÇÃO SE FEEDBACK JÁ FOI ENVIADO
      if (feedback.enviado) {
        return res.status(403).json({ 
          success: false, 
          error: "Não é possível editar um feedback que já foi enviado" 
        });
      }
      
      // Validar se o gestor é o criador do feedback
      if (gestorId && feedback.gestorId !== parseInt(gestorId)) {
        return res.status(403).json({ 
          success: false, 
          error: "Você só pode editar feedbacks criados por você" 
        });
      }
      
      // Se estiver alterando o funcionário, validar setor e status
      if (funcionarioId && funcionarioId !== feedback.funcionarioId) {
        const gestor = await User.findByPk(gestorId || feedback.gestorId);
        const funcionario = await User.findByPk(funcionarioId);
        
        if (!funcionario.status) {
          return res.status(403).json({ 
            success: false, 
            error: "Não é possível atribuir feedback para funcionário inativo" 
          });
        }

        if (gestor.setor !== funcionario.setor) {
          return res.status(403).json({ 
            success: false, 
            error: "Gestor só pode atribuir feedbacks para funcionários do mesmo setor" 
          });
        }
      }
      
      // Atualizar campos
      if (feedback_text !== undefined) feedback.feedback_text = feedback_text;
      if (pontos_melhorar !== undefined) feedback.pontos_melhorar = pontos_melhorar;
      if (funcionarioId !== undefined) feedback.funcionarioId = funcionarioId;
      
      await feedback.save();
      
      // Buscar o feedback atualizado com includes
      const feedbackAtualizado = await Feedback.findByPk(feedback.id, {
        include: [
          { model: User, as: 'Funcionario', attributes: ['id', 'nome', 'setor', 'status'] },
          { model: User, as: 'Gestor', attributes: ['id', 'nome', 'setor'] }
        ]
      });
      
      res.json({ success: true, data: feedbackAtualizado });
    } catch (err) {
      console.error('Erro ao atualizar feedback:', err);
      res.status(500).json({ success: false, error: "Erro ao atualizar feedback" });
    }
  });

  // ✅ Rota: excluir um feedback (BLOQUEAR SE JÁ ENVIADO)
  router.delete("/:id", async (req, res) => {
    try {
      const feedback = await Feedback.findByPk(req.params.id);
      
      if (!feedback) {
        return res.status(404).json({ success: false, error: "Feedback não encontrado" });
      }
      
      // ✅ BLOQUEAR EXCLUSÃO SE FEEDBACK JÁ FOI ENVIADO
      if (feedback.enviado) {
        return res.status(403).json({ 
          success: false, 
          error: "Não é possível excluir um feedback que já foi enviado" 
        });
      }
      
      await feedback.destroy();
      res.json({ success: true, message: "Feedback excluído com sucesso" });
    } catch (err) {
      console.error('Erro ao excluir feedback:', err);
      res.status(500).json({ success: false, error: "Erro ao excluir feedback" });
    }
  });

  // ✅ Rota: enviar feedback (marcar como enviado)
  router.patch("/:id/enviar", async (req, res) => {
    try {
      const feedback = await Feedback.findByPk(req.params.id);
      
      if (!feedback) {
        return res.status(404).json({ success: false, error: "Feedback não encontrado" });
      }
      
      // ✅ BLOQUEAR REENVIO SE JÁ FOI ENVIADO
      if (feedback.enviado) {
        return res.status(403).json({ 
          success: false, 
          error: "Este feedback já foi enviado" 
        });
      }

      // ✅ VERIFICAR SE O FUNCIONÁRIO AINDA ESTÁ ATIVO
      const funcionario = await User.findByPk(feedback.funcionarioId);
      if (!funcionario || !funcionario.status) {
        return res.status(403).json({ 
          success: false, 
          error: "Não é possível enviar feedback para funcionário inativo" 
        });
      }
      
      feedback.enviado = true;
      await feedback.save();
      
      res.json({ 
        success: true, 
        message: "Feedback enviado com sucesso!",
        data: feedback
      });
    } catch (err) {
      console.error('Erro ao enviar feedback:', err);
      res.status(500).json({ success: false, error: "Erro ao enviar feedback" });
    }
  });

  return router;
};