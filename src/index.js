//import './styles/login.css';
import './styles/index.css';
import './scripts/index.js';
import './scripts/authIndex.js';
//import './scripts/verificarAuth.js';
import { auth } from './firebase-config.js';
import { handleAuth, toggleMode, togglePassword, loginWithGoogle, loginWithPhone, verifyOTP, resendVerificationCode } from './scripts/authIndex.js';

console.log('Aplicação iniciada!');