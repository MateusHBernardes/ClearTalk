// BACKEND/CONTROLLER/feedback.js
const express = require("express");
const router = express.Router();
const Feedback = require("../MODEL/Feedback");

// Rota: listar todos os feedbacks
router.get("/", async (req, res) => {
  try {
    const feedbacks = await Feedback.findAll();
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar feedbacks" });
  }
});

// Rota: criar um novo feedback
router.post("/", async (req, res) => {
  try {
    const novoFeedback = await Feedback.create(req.body);
    res.json(novoFeedback);
  } catch (err) {
    res.status(500).json({ error: "Erro ao criar feedback" });
  }
});

module.exports = router;
