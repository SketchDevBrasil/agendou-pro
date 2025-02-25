const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3070;

// Servir arquivos estáticos da pasta "public"
app.use(express.static(path.join(__dirname, "public")));

// Bloquear acesso ao diretório privado
app.use("/privado", (req, res) => {
  res.status(403).send("Acesso negado.");
});

// Rota padrão
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});