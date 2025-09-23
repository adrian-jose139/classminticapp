import { auth, db } from "./firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const userEmail = result.user.email;

    // Verificar si el correo existe en Firestore
    const userRef = doc(db, "usuarios", userEmail); // ajusta según tu colección
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await auth.signOut();
      alert("⚠️ No estás registrado con correo. Primero regístrate con email.");
      return null;
    }

    return result.user; // Usuario validado
  } catch (error) {
    console.error("Error al iniciar sesión con Google:", error);
    alert("Error al iniciar sesión con Google: " + error.message);
    return null;
  }
}
