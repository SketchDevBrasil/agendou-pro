import './styles/index.css';
import { auth } from './firebase-config.js'; // Firebase config
import { handleAuth, toggleMode, togglePassword, loginWithGoogle, loginWithPhone, verifyOTP, resendVerificationCode } from './scripts/authIndex.js';

console.log('Aplicação iniciada!');

