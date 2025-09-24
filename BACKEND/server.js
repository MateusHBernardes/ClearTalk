const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Rotas temporárias para testar
app.get("/", (req, res) => {
  res.send("ClearTalk API funcionando!");
});

// Importar controladores
const userRoutes = require("./CONTROLLER/user");
const feedbackRoutes = require("./CONTROLLER/feedback");
const timeRoutes = require("./CONTROLLER/time");

app.use("/users", userRoutes);
app.use("/feedbacks", feedbackRoutes);
app.use("/times", timeRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
