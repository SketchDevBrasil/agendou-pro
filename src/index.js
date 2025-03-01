import '../styles/index.css'; // Importa o CSS
import { auth } from './firebase-config';
import { handleAuth, toggleMode, togglePassword, loginWithGoogle, loginWithPhone, verifyOTP, resendVerificationCode } from './authIndex';

// Código principal
console.log('Aplicação iniciada!');