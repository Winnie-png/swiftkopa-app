import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
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
