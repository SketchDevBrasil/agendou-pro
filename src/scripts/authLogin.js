// Importações do Firebase

import { initializeApp } from 'firebase/app';
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
 } from 'firebase/auth';



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
let countdownInterval; // Variável para o intervalo do contador
let recaptchaVerifier; // Variável global para o RecaptchaVerifier

// Gerenciador do ID do container do reCAPTCHA
let recaptchaContainerId = "recaptcha-container";

// Função para gerar um ID único para o container do reCAPTCHA
function generateUniqueId() {
  return "recaptcha-container-" + Math.random().toString(36).substr(2, 9);
}

// Função para limpar o reCAPTCHA e recriar o container com um novo ID
function clearRecaptcha() {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
    recaptchaVerifier = null;
  }
  // Remove o container atual (se existir)
  const container = document.getElementById(recaptchaContainerId);
  if (container && container.parentNode) {
    container.parentNode.removeChild(container);
  }
  // Cria um novo container e o adiciona ao DOM (nesse exemplo, ao final do body)
  const newContainer = document.createElement("div");
  recaptchaContainerId = generateUniqueId();
  newContainer.id = recaptchaContainerId;
  document.body.appendChild(newContainer);
}

// Função para inicializar o reCAPTCHA
function initializeRecaptcha() {
  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(
      recaptchaContainerId, // Usa o ID atualizado do container
      {
        size: "invisible",
        callback: (response) => {
          console.log("reCAPTCHA resolvido:", response);
        },
      },
      auth
    );
  }
}

// Função para garantir que o sinal "+" não seja apagado
function enforcePlusSign(input) {
  if (!input.value.startsWith("+")) {
    input.value = "+" + input.value.replace(/[^0-9]/g, "");
  }
  input.addEventListener("keydown", (e) => {
    const selectionStart = input.selectionStart;
    if (selectionStart === 1 && e.key === "Backspace") {
      e.preventDefault();
    }
    if (selectionStart === 0 && e.key !== "+") {
      e.preventDefault();
    }
  });
  input.addEventListener("input", () => {
    let value = input.value.replace(/\D/g, "");
    if (value.length > 0) {
      value = `+${value}`;
    }
    input.value = value;
  });
}

// Função para detectar o código do país automaticamente
async function detectCountryCode() {
  try {
    const response = await fetch("https://ipapi.co/json/");
    const data = await response.json();
    const countryCode = data.country_code;
    const countryCodes = {
      BR: "+55", US: "+1", GB: "+44", DE: "+49", FR: "+33", IT: "+39", ES: "+34", PT: "+351",
      HU: "+36", UA: "+380", RU: "+7", IN: "+91", CN: "+86", JP: "+81", KR: "+82", ID: "+62",
      IR: "+98", IQ: "+964", IL: "+972", SA: "+966", TR: "+90", AE: "+971", EG: "+20",
      JO: "+962", KW: "+965", LB: "+961", OM: "+968", QA: "+974", ZA: "+27", NG: "+234",
      KE: "+254", GH: "+233", DZ: "+213", MA: "+212", ET: "+251", SN: "+221", TZ: "+255",
      AU: "+61", NZ: "+64"
    };
    const defaultCode = "+55";
    const detectedCode = countryCodes[countryCode] || defaultCode;
    const phoneInput = document.getElementById("phone");
    phoneInput.value = detectedCode;
  } catch (error) {
    console.error("Erro ao detectar código do país:", error);
    const phoneInput = document.getElementById("phone");
    phoneInput.value = "+55";
  }
}

// Função para iniciar o contador regressivo (ex.: 60 segundos)
function startCountdown() {
  let timeLeft = 60;
  const countdownElement = document.getElementById("countdown");
  countdownInterval = setInterval(() => {
    if (timeLeft <= 0) {
      clearInterval(countdownInterval);
      countdownElement.textContent = "Tempo esgotado!";
      document.getElementById("resend-verification").style.display = "inline-block";
    } else {
      countdownElement.textContent = `Tempo restante: ${timeLeft} segundos`;
      timeLeft--;
    }
  }, 1000);
}


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

// Login com Celular
window.loginWithPhone = function () {
  const phoneInput = document.getElementById("phone").value;
  if (!phoneInput) {
    document.getElementById("error-message").innerText =
      "Por favor, preencha o número de celular.";
    return;
  }
  const phoneNumber = phoneInput.replace(/\s/g, "");
  // Limpa e recria o reCAPTCHA antes de cada solicitação
  clearRecaptcha();
  initializeRecaptcha();
  signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier)
    .then((confirmationResult) => {
      window.confirmationResult = confirmationResult;
      openGenericModal("Código Enviado", "Um código de verificação foi enviado para seu celular.");
      document.getElementById("otp-section").style.display = "block";
      startCountdown();
      document.getElementById("resend-verification").style.display = "none";
    })
    .catch((error) => {
      if (error.code === "auth/too-many-requests") {
        document.getElementById("error-message").innerText =
          "Muitas solicitações. Aguarde alguns minutos antes de tentar novamente.";
      } else {
        document.getElementById("error-message").innerText =
          "Erro ao enviar código: " + error.message;
      }
      clearRecaptcha();
    });
};

// Verificar OTP
window.verifyOTP = function () {
  const otp = document.getElementById("otp").value;
  if (!otp) {
    document.getElementById("error-message").innerText = "Por favor, insira o código de verificação.";
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
      document.getElementById("error-message").innerText = "Código inválido: " + error.message;
    });
};

// Reenviar código de verificação
window.resendVerificationCode = function () {
  const phoneInput = document.getElementById("phone").value;
  if (!phoneInput) {
    document.getElementById("error-message").innerText =
      "Por favor, preencha o número de celular.";
    return;
  }
  const phoneNumber = phoneInput.replace(/\s/g, "");
  clearRecaptcha();
  initializeRecaptcha();
  signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier)
    .then((confirmationResult) => {
      window.confirmationResult = confirmationResult;
      openGenericModal("Código Reenviado", "Um novo código de verificação foi enviado para seu celular.");
      startCountdown();
      document.getElementById("resend-verification").style.display = "none";
    })
    .catch((error) => {
      if (error.code === "auth/too-many-requests") {
        document.getElementById("error-message").innerText =
          "Muitas solicitações. Aguarde alguns minutos antes de tentar novamente.";
      } else {
        document.getElementById("error-message").innerText =
          "Erro ao reenviar código: " + error.message;
      }
      clearRecaptcha();
    });
};

// Atualizar UI após login
function updateUI(user) {
  if (user) {
    console.log("Usuário logado:", user);
    window.location.href = "/admin";
  } else {
    console.log("Nenhum usuário logado.");
  }
}

// Inicialização ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("auth-modal");
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      //nada
    }
  });
  const phoneInput = document.getElementById("phone");
  enforcePlusSign(phoneInput);
  detectCountryCode();
});

// Funções para abrir e fechar um modal genérico
window.openGenericModal = function (title, message) {
  const modal = document.getElementById("generic-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalMessage = document.getElementById("modal-message");
  modalTitle.textContent = title;
  modalMessage.textContent = message;
  modal.style.display = "block";
};

window.closeGenericModal = function () {
  const modal = document.getElementById("generic-modal");
  modal.style.display = "none";
};


window.openModal = function () {
  const modal = document.getElementById("auth-modal");
  modal.style.display = "block";
};

window.closeModal = function () {
  const modal = document.getElementById("auth-modal");
  modal.style.display = "none";
};