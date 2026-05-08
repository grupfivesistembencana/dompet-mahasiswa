import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// GANTI INI DENGAN KONFIGURASI ASLI DARI FIREBASE CONSOLE ANDA
const firebaseConfig = {
  apiKey: "AIzaSyBJwPkqQvSa6E9fxbN4myx8z4TYZATyHUM",
  authDomain: "dompet-mahasiswa-2c986.firebaseapp.com",
  projectId: "dompet-mahasiswa-2c986",
  storageBucket: "dompet-mahasiswa-2c986.firebasestorage.app",
  messagingSenderId: "629050017320",
  appId: "1:629050017320:web:5cb60827817ad27ab4971d"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const appId = 'dompet-mahasiswa'; // ID unik untuk aplikasi ini