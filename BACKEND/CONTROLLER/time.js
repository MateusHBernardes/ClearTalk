const express = require("express");

module.exports = (Time) => {
  const router = express.Router();

  // Rota: listar todos os times
  router.get("/", async (req, res) => {
    try {
      const times = await Time.findAll();
      res.json({ success: true, data: times });
    } catch (err) {
      res.status(500).json({ success: false, error: "Erro ao buscar times" });
    }
  });

  // Rota: criar um novo time
  router.post("/", async (req, res) => {
    try {
      const novoTime = await Time.create(req.body);
      res.json({ success: true, data: novoTime });
    } catch (err) {
      res.status(500).json({ success: false, error: "Erro ao criar time" });
    }
  });

  return router;
};