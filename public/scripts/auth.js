// Importações do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  deleteUser,
  sendEmailVerification,
  sendPasswordResetEmail,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  GoogleAuthProvider,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDWb3xpY7Ft7dIkJmQvJTQIK2dIducFHWA",
    authDomain: "agendou-pro.firebaseapp.com",
    databaseURL: "https://agendou-pro-default-rtdb.firebaseio.com",
    projectId: "agendou-pro",
    storageBucket: "agendou-pro.firebasestorage.app",
    messagingSenderId: "251289108784",
    appId: "1:251289108784:web:f89f926e001932cd9c48f5",
    measurementId: "G-0Z7Z81PLYH"
  };

  
// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Variáveis globais
let isLoginMode = true;

// Função para abrir o modal
window.openModal = function () {
  const modal = document.getElementById("auth-modal");
  modal.style.display = "flex";
};

// Função para fechar o modal
window.closeModal = function () {
  const modal = document.getElementById("auth-modal");
  modal.style.display = "none";
};

// Alternar entre Login e Registro
window.toggleMode = function () {
  const authButton = document.getElementById("auth-button");
  const toggleText = document.getElementById("toggle-text");
  const modalTitle = document.getElementById("modal-title");

  if (isLoginMode) {
    authButton.textContent = "Criar Conta";
    toggleText.innerHTML = 'Já tem uma conta? <span>Clique aqui para Entrar.</span>';
    modalTitle.textContent = "Registrar";
  } else {
    authButton.textContent = "Entrar";
    toggleText.innerHTML = 'Não tem uma conta? <span>Clique aqui para Criar.</span>';
    modalTitle.textContent = "Login";
  }

  isLoginMode = !isLoginMode;
};

// Função de autenticação (Login ou Registro)
window.handleAuth = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    document.getElementById("error-message").innerText = "Por favor, preencha todos os campos.";
    return;
  }

  if (isLoginMode) {
    // Lógica de login
    try {
      await signInWithEmailAndPassword(auth, email, password);
      const user = auth.currentUser;
      if (!user.emailVerified) {
        document.getElementById("error-message").innerText =
          "Seu e-mail ainda não foi verificado. Por favor, verifique seu e-mail antes de fazer login.";
        return;
      }
      updateUI(user);
    } catch (error) {
      document.getElementById("error-message").innerText = "Erro ao fazer login: " + error.message;
    }
  } else {
    // Lógica de registro
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await sendEmailVerification(user);
      openGenericModal(
        "Conta Criada",
        "Conta criada com sucesso! Por favor, verifique seu e-mail antes de fazer login."
      );
    } catch (error) {
      document.getElementById("error-message").innerText = "Erro ao criar conta: " + error.message;
    }
  }
};

// Alternar visibilidade da senha
window.togglePassword = function () {
  const passwordInput = document.getElementById("password");
  const toggleIcon = document.getElementById("toggle-password");

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    toggleIcon.src = "images/eye-open.png";
  } else {
    passwordInput.type = "password";
    toggleIcon.src = "images/eye-closed.png";
  }
};

// Login com Google
window.loginWithGoogle = async function () {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    updateUI(user);
    openGenericModal("Login com Google", "Login realizado com sucesso!");
  } catch (error) {
    document.getElementById("error-message").innerText = "Erro: " + error.message;
  }
};

// Função para detectar o código do país automaticamente
async function detectCountryCode() {
  try {
    const response = await fetch("https://ipapi.co/json/");
    const data = await response.json();
    const countryCode = data.country_code;
    const countryCodeInput = document.getElementById("country-code");

    // Mapeamento de códigos de país para códigos de telefone
    const countryCodes = {
      BR: "+55", US: "+1", GB: "+44", DE: "+49", FR: "+33", IT: "+39", ES: "+34", PT: "+351", 
      HU: "+36", UA: "+380", RU: "+7", IN: "+91", CN: "+86", JP: "+81", KR: "+82", ID: "+62", 
      IR: "+98", IQ: "+964", IL: "+972", SA: "+966", TR: "+90", AE: "+971", EG: "+20", 
      JO: "+962", KW: "+965", LB: "+961", OM: "+968", QA: "+974", ZA: "+27", NG: "+234", 
      KE: "+254", GH: "+233", DZ: "+213", MA: "+212", ET: "+251", SN: "+221", TZ: "+255", 
      AU: "+61", NZ: "+64"
    };

    // Define o código do país com base na localização do usuário
    const defaultCode = "+55"; // Código padrão (Brasil)
    const detectedCode = countryCodes[countryCode] || defaultCode;
    countryCodeInput.value = detectedCode;
  } catch (error) {
    console.error("Erro ao detectar código do país:", error);
    document.getElementById("country-code").value = "+55"; // Define o código padrão em caso de erro
  }
}

// Login com Celular
window.loginWithPhone = function () {
  const countryCode = document.getElementById("country-code").value;
  const phoneInput = document.getElementById("phone").value;

  if (!countryCode || !phoneInput) {
    document.getElementById("error-message").innerText =
      "Por favor, preencha o código do país e o número de celular.";
    return;
  }

  const phoneNumber = `${countryCode}${phoneInput.replace(/\D/g, "")}`;
  const recaptchaVerifier = new RecaptchaVerifier(
    "recaptcha-container",
    {
      size: "invisible",
      callback: (response) => {},
    },
    auth
  );

  signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier)
    .then((confirmationResult) => {
      window.confirmationResult = confirmationResult;
      openGenericModal(
        "Código Enviado",
        "Um código de verificação foi enviado para seu celular."
      );
      document.getElementById("otp-section").style.display = "block";
      startCountdown();
      document.getElementById("resend-verification").style.display = "inline-block";
    })
    .catch((error) => {
      document.getElementById("error-message").innerText =
        "Erro ao enviar código: " + error.message;
    });
};

// Verificar OTP
window.verifyOTP = function () {
  const otp = document.getElementById("otp").value;
  if (!otp) {
    document.getElementById("error-message").innerText =
      "Por favor, insira o código de verificação.";
    return;
  }
  window.confirmationResult
    .confirm(otp)
    .then((result) => {
      const user = result.user;
      openGenericModal("Login Bem-sucedido", "Login realizado com sucesso!");
      clearInterval(countdownInterval);
      updateUI(user);
    })
    .catch((error) => {
      document.getElementById("error-message").innerText =
        "Código inválido: " + error.message;
    });
};

// Reenviar código de verificação
window.resendVerificationCode = function () {
  loginWithPhone();
};

// Atualizar UI após login
function updateUI(user) {
  if (user) {
    // Ocultar o modal de login
    closeModal();
    // Atualizar a interface do usuário logado (se necessário)
    console.log("Usuário logado:", user);
  } else {
    console.log("Nenhum usuário logado.");
  }
}

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  // Configurar o modal
  const modal = document.getElementById("auth-modal");
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Detectar código do país ao carregar a página
  detectCountryCode();
});
