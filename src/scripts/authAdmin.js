
// Importar o auth do firebase-config.js
import { auth } from '../firebase-config.js';
// Agora você pode usar o auth diretamente


// Referências aos elementos da página
const userImage = document.getElementById('user-image');
const userName = document.getElementById('user-name');
const userEmail = document.getElementById('user-email');
const userUid = document.getElementById('user-uid');
const verifyMessageDiv = document.getElementById('verify-message');

// Função para enviar e-mail de verificação
window.sendVerificationEmail = () => {
  const user = auth.currentUser;
  if (user) {
    sendEmailVerification(user)
      .then(() => {
        alert("E-mail de verificação enviado. Por favor, verifique sua caixa de entrada.");
      })
      .catch((error) => {
        console.error("Erro ao enviar e-mail de verificação:", error);
        alert("Não foi possível enviar o e-mail de verificação.");
      });
  }
};

// Verifica se há usuário autenticado
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Usuário autenticado:", user);
    userName.textContent = "Nome: " + (user.displayName || "Não informado");
    userEmail.textContent = "Email: " + user.email;
    userUid.textContent = "UID: " + user.uid;

    if (user.photoURL) {
      userImage.src = user.photoURL;
      userImage.style.display = 'block';
    } else {
      userImage.style.display = 'none';
    }

    // Verifica se o e-mail do usuário foi verificado
    if (!user.emailVerified) {
      verifyMessageDiv.style.display = 'block';
    } else {
      verifyMessageDiv.style.display = 'none';
    }
  } else {
    console.log("Nenhum usuário autenticado. Redirecionando para login...");
    window.location.href = "/login"; // ajuste o caminho conforme sua rota de login
  }
});