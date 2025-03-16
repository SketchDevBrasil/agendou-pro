// This is the entry point of the Firebase Functions
// It exports all the functions that you want to deploy to Firebase
const functions = require("firebase-functions");
const agendamento = require("./agendamento");
exports.agendamentoPage = agendamento;