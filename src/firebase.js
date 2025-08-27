import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyAQNFlc04_3e8HvZMY0DqiND2835T-Atn8",
  authDomain: "proyectadr09.firebaseapp.com",
  projectId: "proyectadr09",
  storageBucket: "proyectadr09.firebasestorage.app",
  messagingSenderId: "507564558881",
  appId: "1:507564558881:web:d8cd94bc71f7534e257160"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar auth y provider de Google
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Firestore
const db = getFirestore(app);

export { auth, googleProvider, db, signOut };
