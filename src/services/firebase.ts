import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
// TODO: Replace with your actual Firebase config values
const firebaseConfig = {
  apiKey: "AIzaSyAfsiTaCLdk52cC2JdyyvjAXyx5ovl7XLc",
  authDomain: "knowher-6cde0.firebaseapp.com",
  projectId: "knowher-6cde0",
  storageBucket: "knowher-6cde0.firebasestorage.app",
  messagingSenderId: "343710914559",
  appId: "1:343710914559:web:b911ebf6928dbd88e3f9ca",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;