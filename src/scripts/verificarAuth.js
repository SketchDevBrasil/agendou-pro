
// Importar o auth do firebase-config.js
import { auth } from '../firebase-config.js';
// Agora você pode usar o auth diretamente
console.log(auth);

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
