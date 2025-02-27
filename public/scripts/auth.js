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

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDWb3xpY7Ft7dIkJmQvJTQIK2dIducFHWA",
  authDomain: "agendou-pro.firebaseapp.com",
  databaseURL: "https://agendou-pro-default-rtdb.firebaseio.com",
  projectId: "agendou-pro",
  storageBucket: "agendou-pro.firebasestorage.app",
  messagingSenderId: "251289108784",
  appId: "1:251289108784:web:f89f926e001932cd9c48f5",
  measurementId: "G-0Z7Z81PLYH",
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Variáveis globais
let isLoginMode = true;
let countdownInterval; // Variável para o intervalo do contador
let recaptchaVerifier; // Variável global para o RecaptchaVerifier

// Função para garantir que o sinal "+" não seja apagado
function enforcePlusSign(input) {
  // Verifica se o valor começa com "+"
  if (!input.value.startsWith("+")) {
    // Se não começar, restaura o valor anterior ou define como "+"
    input.value = "+" + input.value.replace(/[^0-9]/g, "");
  }

  // Impede que o usuário apague o "+"
  input.addEventListener("keydown", (e) => {
    const selectionStart = input.selectionStart; // Posição do cursor

    // Se o cursor estiver no início e o usuário tentar apagar o "+", impede a ação
    if (selectionStart === 1 && e.key === "Backspace") {
      e.preventDefault();
    }

    // Se o cursor estiver no início e o usuário tentar digitar algo que não seja "+", impede a ação
    if (selectionStart === 0 && e.key !== "+") {
      e.preventDefault();
    }
  });

  // Formata o número de telefone enquanto o usuário digita
  input.addEventListener("input", () => {
    let value = input.value.replace(/\D/g, ""); // Remove tudo que não for número
    if (value.length > 0) {
      value = `+${value}`; // Garante que o valor comece com "+"
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

    // Insere o código do país no campo de telefone
    const phoneInput = document.getElementById("phone");
    phoneInput.value = detectedCode;
  } catch (error) {
    console.error("Erro ao detectar código do país:", error);
    // Define o código padrão em caso de erro
    const phoneInput = document.getElementById("phone");
    phoneInput.value = "+55";
  }
}

// Função para inicializar o reCAPTCHA
function initializeRecaptcha() {
  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(
      "recaptcha-container",
      {
        size: "invisible", // Tamanho invisível
        callback: (response) => {
          // Callback chamado quando o reCAPTCHA é resolvido
          console.log("reCAPTCHA resolvido:", response);
        },
      },
      auth
    );
  }
}

// Função para limpar o reCAPTCHA
function clearRecaptcha() {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear(); // Limpa a instância do reCAPTCHA
    recaptchaVerifier = null; // Remove a referência
  }
}

// Função para iniciar o contador regressivo
function startCountdown() {
  let timeLeft = 60; // Tempo em segundos
  const countdownElement = document.getElementById("countdown");

  // Atualiza o contador a cada segundo
  countdownInterval = setInterval(() => {
    if (timeLeft <= 0) {
      clearInterval(countdownInterval); // Para o contador
      countdownElement.textContent = "Tempo esgotado!";
      document.getElementById("resend-verification").style.display = "inline-block"; // Mostra o botão de reenviar
    } else {
      countdownElement.textContent = `Tempo restante: ${timeLeft} segundos`;
      timeLeft--;
    }
  }, 1000);
}

// Função para reenviar o código de verificação
window.resendVerificationCode = function () {
  const phoneInput = document.getElementById("phone").value;

  if (!phoneInput) {
    document.getElementById("error-message").innerText =
      "Por favor, preencha o número de celular.";
    return;
  }

  const phoneNumber = phoneInput.replace(/\s/g, ""); // Remove espaços

  // Verifica se o RecaptchaVerifier já foi inicializado
  if (!recaptchaVerifier) {
    initializeRecaptcha(); // Inicializa o reCAPTCHA se ainda não foi feito
  }

  signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier)
    .then((confirmationResult) => {
      window.confirmationResult = confirmationResult;
      openGenericModal(
        "Código Reenviado",
        "Um novo código de verificação foi enviado para seu celular."
      );
      startCountdown(); // Reinicia o contador regressivo
      document.getElementById("resend-verification").style.display = "none"; // Oculta o botão de reenviar
    })
    .catch((error) => {
      document.getElementById("error-message").innerText =
        "Erro ao reenviar código: " + error.message;
      clearRecaptcha(); // Limpa o reCAPTCHA em caso de erro
    });
};

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
      window.location.href = "/admin"; // Redireciona para a página de admin
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
    window.location.href = "/admin"; // Redireciona para a página de admin
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

  const phoneNumber = phoneInput.replace(/\s/g, ""); // Remove espaços

  // Verifica se o RecaptchaVerifier já foi inicializado
  if (!recaptchaVerifier) {
    initializeRecaptcha(); // Inicializa o reCAPTCHA se ainda não foi feito
  }

  signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier)
    .then((confirmationResult) => {
      window.confirmationResult = confirmationResult;
      openGenericModal(
        "Código Enviado",
        "Um código de verificação foi enviado para seu celular."
      );
      document.getElementById("otp-section").style.display = "block";
      startCountdown(); // Inicia o contador regressivo
      document.getElementById("resend-verification").style.display = "none"; // Oculta o botão de reenviar inicialmente
    })
    .catch((error) => {
      document.getElementById("error-message").innerText =
        "Erro ao enviar código: " + error.message;
      clearRecaptcha(); // Limpa o reCAPTCHA em caso de erro
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
      window.location.href = "/admin"; // Redireciona para a página de admin
    })
    .catch((error) => {
      document.getElementById("error-message").innerText =
        "Código inválido: " + error.message;
    });
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

  // Garantir que o sinal "+" esteja sempre presente no campo de telefone
  const phoneInput = document.getElementById("phone");
  enforcePlusSign(phoneInput);

  // Detectar o código do país ao carregar a página
  detectCountryCode();
});

// Função para abrir um modal genérico
window.openGenericModal = function (title, message) {
  const modal = document.getElementById("generic-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalMessage = document.getElementById("modal-message");

  modalTitle.textContent = title;
  modalMessage.textContent = message;
  modal.style.display = "block";
};

// Função para fechar um modal genérico
window.closeGenericModal = function () {
  const modal = document.getElementById("generic-modal");
  modal.style.display = "none";
};