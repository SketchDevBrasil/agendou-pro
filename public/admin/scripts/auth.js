import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

function verificarLogin() {
  // Obtém a instância do Firebase Auth
  const auth = getAuth();

  // O onAuthStateChanged monitora o estado de autenticação
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // Se houver usuário, significa que ele está logado
      console.log("Usuário autenticado:", user);
      // Aqui você pode deixar o usuário continuar na página admin
    } else {
      // Se não houver usuário, redireciona para a página de login
      console.log("Usuário não autenticado. Redirecionando para login...");
      window.location.href = "/login"; // Ajuste o caminho conforme sua aplicação
    }
  });
}
