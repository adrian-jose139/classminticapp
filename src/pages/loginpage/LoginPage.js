import { useState } from 'react';
import Swal from 'sweetalert2';
import { auth, googleProvider, db } from '../../firebase';
import { signInWithEmailAndPassword, fetchSignInMethodsForEmail, linkWithCredential, EmailAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, where, collection, query, getDocs } from 'firebase/firestore';
import './LoginPage.css';
import logo from '../../assets/agronomia.avif';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // LOGIN CON EMAIL/PASSWORD
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      Swal.fire("Campos vacíos", "Por favor llena todos los campos.", "warning");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Opcional: verificar si existe documento en Firestore
      const userDocRef = doc(db, 'usuarios', user.uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        if (data.estado === "Inactivo") {
          Swal.fire("Acceso denegado", "Tu cuenta está inactiva. Contacta al administrador.", "error");
          return;
        }
      }

      Swal.fire({
        title: "¡Bienvenido!",
        text: `Sesión iniciada como ${user.email}`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false
      }).then(() => {
        window.location.href = "/dashboard";
      });

    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Credenciales incorrectas o usuario no existe.", "error");
    }
  };

  // LOGIN CON GOOGLE
  const handleGoogleLogin = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // 🔎 Buscar en Firestore si el correo existe
    const q = query(
      collection(db, "usuarios"),
      where("email", "==", user.email)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // ❌ No existe → Bloquear acceso
      Swal.fire(
        "Acceso denegado",
        "Tu correo no está registrado. Debes registrarte primero con correo y contraseña.",
        "error"
      );
      await auth.signOut(); // 👈 lo saco de la sesión
      return;
    }

    // ✅ Sí existe → Dejar pasar al dashboard
    window.location.href = "/dashboard";
  } catch (error) {
    console.error(error);
    Swal.fire("Error", "No se pudo iniciar sesión con Google.", "error");
  }
};

  const solicitarPassword = async () => {
    const result = await Swal.fire({
      title: "Contraseña requerida",
      input: "password",
      inputLabel: "Introduce tu contraseña para vincular cuentas",
      inputPlaceholder: "Tu contraseña",
      showCancelButton: true,
      confirmButtonText: "Vincular",
      cancelButtonText: "Cancelar"
    });

    if (result.isConfirmed && result.value) {
      return result.value;
    }
    return null;
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-gradient">
      <div className="form-card">
        <img
          src={logo}
          alt="Logo de Brilla"
          className="logo mb-3 d-block mx-auto"
          style={{ width: '250px' }}
        />
        <h3 className="mb-4 text-center">Iniciar Sesión</h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Correo electrónico</label>
            <input
              type="email"
              className="form-control"
              id="email"
              placeholder="tucorreo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Contraseña</label>
            <input
              type="password"
              className="form-control"
              id="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="d-grid">
            <button type="submit" className="btn btn-primary">Entrar</button>
          </div>
        </form>

        <div className="text-center mt-3">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="btn btn-danger w-100 d-flex align-items-center justify-content-center gap-2 mb-2"
          >
            <img
              src="https://img.icons8.com/color/48/google-logo.png"
              alt="Google logo"
              style={{ width: '20px', height: '20px' }}
            />
            Iniciar sesión con Google
          </button>
          <a href="/register">¿No tienes cuenta? Regístrate</a><br />
          <a href="/forgot">¿Olvidaste tu contraseña?</a>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;


// import { useState } from 'react'; 
// import Swal from 'sweetalert2';
// import { auth, googleProvider, db } from '../../firebase';
// import { signInWithEmailAndPassword, fetchSignInMethodsForEmail, linkWithCredential, EmailAuthProvider, signInWithPopup } from 'firebase/auth';
// import { doc, getDoc } from 'firebase/firestore';
// import './LoginPage.css';
// import logo from '../../assets/agronomia.avif';

// function LoginPage() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');

//   // LOGIN CON EMAIL/PASSWORD
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!email || !password) {
//       Swal.fire("Campos vacíos", "Por favor llena todos los campos.", "warning");
//       return;
//     }

//     try {
//       const userCredential = await signInWithEmailAndPassword(auth, email, password);
//       const user = userCredential.user;

//       const userDocRef = doc(db, 'usuarios', user.uid);
//       const userSnap = await getDoc(userDocRef);

//       if (userSnap.exists()) {
//         const data = userSnap.data();
//         if (data.estado === "Inactivo") {
//           Swal.fire("Acceso denegado", "Tu cuenta está inactiva. Contacta al administrador.", "error");
//           return;
//         }
//       }

//       Swal.fire({
//         title: "¡Bienvenido!",
//         text: `Sesión iniciada como ${user.email}`,
//         icon: "success",
//         timer: 2000,
//         showConfirmButton: false
//       }).then(() => {
//         window.location.href = "/protegida";
//       });

//     } catch (error) {
//       console.error(error);
//       Swal.fire("Error", "Credenciales incorrectas o usuario no existe.", "error");
//     }
//   };

//   // LOGIN CON GOOGLE con validación de registro previo
//   const handleGoogleLogin = async () => {
//     try {
//       const googleResult = await signInWithPopup(auth, googleProvider);
//       const user = googleResult.user;

//       // ✅ Verificar si el email existe en la colección "usuarios"
//       const userDocRef = doc(db, 'usuarios', user.email); // si tu colección usa email como ID
//       const userSnap = await getDoc(userDocRef);

//       if (!userSnap.exists()) {
//         // No registrado → cerrar sesión y mostrar alerta
//         await auth.signOut();
//         Swal.fire("No registrado", "Primero debes registrarte con correo para usar Google.", "warning");
//         return;
//       }

//       // Si ya estaba registrado con correo, proceder
//       Swal.fire({
//         title: "¡Bienvenido!",
//         text: `Sesión iniciada con Google: ${user.email}`,
//         icon: "success",
//         timer: 2000,
//         showConfirmButton: false
//       }).then(() => {
//         window.location.href = "/dashboard";
//       });

//     } catch (error) {
//       console.error(error);
//       Swal.fire("Error", "No se pudo iniciar sesión con Google.", "error");
//     }
//   };

//   return (
//     <div className="d-flex justify-content-center align-items-center min-vh-100 bg-gradient">
//       <div className="form-card">
//         <img
//           src={logo}
//           alt="Logo de Brilla"
//           className="logo mb-3 d-block mx-auto"
//           style={{ width: '250px' }}
//         />
//         <h3 className="mb-4 text-center">Iniciar Sesión</h3>

//         <form onSubmit={handleSubmit}>
//           <div className="mb-3">
//             <label htmlFor="email" className="form-label">Correo electrónico</label>
//             <input
//               type="email"
//               className="form-control"
//               id="email"
//               placeholder="tucorreo@ejemplo.com"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//           </div>
//           <div className="mb-3">
//             <label htmlFor="password" className="form-label">Contraseña</label>
//             <input
//               type="password"
//               className="form-control"
//               id="password"
//               placeholder="Contraseña"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />
//           </div>
//           <div className="d-grid">
//             <button type="submit" className="btn btn-primary">Entrar</button>
//           </div>
//         </form>

//         <div className="text-center mt-3">
//           <button
//             type="button"
//             onClick={handleGoogleLogin}
//             className="btn btn-danger w-100 d-flex align-items-center justify-content-center gap-2 mb-2"
//           >
//             <img
//               src="https://img.icons8.com/color/48/google-logo.png"
//               alt="Google logo"
//               style={{ width: '20px', height: '20px' }}
//             />
//             Iniciar sesión con Google
//           </button>
//           <a href="/register">¿No tienes cuenta? Regístrate</a><br />
//           <a href="/forgot">¿Olvidaste tu contraseña?</a>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default LoginPage;
