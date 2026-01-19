import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyACH3BCXeOd59jKugNiblwjOD4dBR6bBXQ",
  authDomain: "swiftkopa-app.firebaseapp.com",
  projectId: "swiftkopa-app",
  storageBucket: "swiftkopa-app.firebasestorage.app",
  messagingSenderId: "269589106469",
  appId: "1:269589106469:web:5062318255519181a9d4cc",
  measurementId: "G-ZDE54YNGFG"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Get admin emails from environment variable (comma-separated)
const adminEmailsEnv = import.meta.env.VITE_ADMIN_EMAILS || '';
export const ADMIN_EMAILS: string[] = adminEmailsEnv
  .split(',')
  .map((email: string) => email.trim().toLowerCase())
  .filter((email: string) => email.length > 0);

export const isAdminEmail = (email: string | null | undefined): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
};
