// BACKEND/CONTROLLER/time.js
const express = require("express");
const router = express.Router();
const Time = require("../MODEL/Time");

// Rota: listar todos os times
router.get("/", async (req, res) => {
  try {
    const times = await Time.findAll();
    res.json(times);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar times" });
  }
});

// Rota: criar um novo time
router.post("/", async (req, res) => {
  try {
    const novoTime = await Time.create(req.body);
    res.json(novoTime);
  } catch (err) {
    res.status(500).json({ error: "Erro ao criar time" });
  }
});

// Rota: buscar time por ID
router.get("/:id", async (req, res) => {
  try {
    const time = await Time.findByPk(req.params.id);
    if (!time) return res.status(404).json({ error: "Time não encontrado" });
    res.json(time);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar time" });
  }
});

module.exports = router;