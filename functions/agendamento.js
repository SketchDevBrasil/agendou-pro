const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const ejs = require("ejs");

// Inicializa o Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

// Configura o Express
const app = express();
app.set("views", "./views"); // Define a pasta de views
app.set("view engine", "ejs"); // Define EJS como template engine

// Rota para a página de agendamento
app.get("/id-:pageUrl", async (req, res) => {
  try {
    const pageUrl = req.params.pageUrl; // Captura o pageUrl da URL

    // Busca os dados da página no Firestore
    const pagesRef = admin.firestore().collection("pages");
    const querySnapshot = await pagesRef.where("pageUrl", "==", pageUrl).get();

    if (querySnapshot.empty) {
      res.status(404).send("Página não encontrada");
      return;
    }

    const pageData = querySnapshot.docs[0].data(); // Extrai os dados da página

    // Renderiza a página de agendamento com os dados
    res.render("agendamento", { pageData });
  } catch (error) {
    console.error("Erro na função:", error.message);
    res.status(500).send("Erro interno na função");
  }
});

// Exporta o app do Express
module.exports = { app };