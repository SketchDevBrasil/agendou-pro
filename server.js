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
  res.sendFile(path.join(__dirname, "src/index.html"));
});

// Iniciar o servidor use node server.js
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Acessível em http://192.168.0.109:${PORT}`);
});

// para Iniciar o servidor em localhost substitua o cod anterior por este
//app.listen(PORT, () => {
    //console.log(`Servidor rodando em http://localhost:${PORT}`);
  //});
  