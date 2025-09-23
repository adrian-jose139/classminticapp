import React, { useEffect, useState } from "react";
import { auth } from "../../firebase";
import Swal from 'sweetalert2';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import './Protegida.css';
function Protegida() {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsuario(user);
      } else {
        window.location.href = "/dashboard"; // Redirigir si no está autenticado
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {usuario ? (
        <>
          <h1 className="text-2xl font-bold">Bienvenido {usuario.displayName}</h1>
          <p>Correo: {usuario.email}</p>
          <button
            onClick={() => {
              signOut(auth);
              window.location.href = "/";
            }}
            className="mt-4 bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600"
          >
            Cerrar sesión
          </button>
        </>
      ) : (
        <p>No autorizado</p>
      )}
    </div>
  );
}

export default Protegida;
