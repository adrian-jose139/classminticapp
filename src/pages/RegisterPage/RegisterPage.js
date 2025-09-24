import { useState } from 'react';
import Swal from 'sweetalert2';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import { db } from '../../firebase';
import { doc, setDoc } from 'firebase/firestore';
import './RegisterPage.css';
import logo from '../../assets/agronomia.avif';

function RegisterPage() {
  const [formData, setFormData] = useState({
    cedula: '',
    nombres: '',
    apellidos: '',
    fechaNacimiento: '',
    sexo: '',
    telefono: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  // 1. Validar campos vacíos
  for (const key in formData) {
    if (formData[key] === '') {
      Swal.fire("Campos incompletos", "Por favor llena todos los campos.", "warning");
      return;
    }
  }

  // 2. Validar cédula (solo números, 6-12 dígitos aprox.)
  const cedulaRegex = /^[0-9]{6,12}$/;
  if (!cedulaRegex.test(formData.cedula)) {
    Swal.fire("Cédula inválida", "La cédula debe contener solo números y tener entre 6 y 12 dígitos.", "error");
    return;
  }

  // 3. Validar nombres y apellidos (solo letras, mínimo 2 caracteres)
  const nameRegex = /^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]{2,50}$/;
  if (!nameRegex.test(formData.nombres) || !nameRegex.test(formData.apellidos)) {
    Swal.fire("Nombre inválido", "Nombres y apellidos solo deben contener letras y espacios.", "error");
    return;
  }

  // 4. Validar fecha de nacimiento (que sea mayor de 15 años, por ejemplo)
  const fechaNac = new Date(formData.fechaNacimiento);
  const hoy = new Date();
  const edad = hoy.getFullYear() - fechaNac.getFullYear();
  if (edad < 15) {
    Swal.fire("Edad no válida", "Debes tener al menos 15 años para registrarte.", "error");
    return;
  }

  // 5. Validar teléfono (10 dígitos, empieza en 3 típico de Colombia)
  const telRegex = /^3\d{9}$/;
  if (!telRegex.test(formData.telefono)) {
    Swal.fire("Teléfono inválido", "El teléfono debe tener 10 dígitos y comenzar en 3.", "error");
    return;
  }

  // 6. Validar correo electrónico
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    Swal.fire("Correo inválido", "Escribe un correo válido.", "error");
    return;
  }

  // 7. Validar contraseña segura
  const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{6,}$/;
  if (!passwordRegex.test(formData.password)) {
    Swal.fire("Contraseña insegura", "La contraseña debe tener al menos 6 caracteres, incluir mayúsculas, minúsculas y números.", "error");
    return;
  }

  // 8. Validar que las contraseñas coincidan
  if (formData.password !== formData.confirmPassword) {
    Swal.fire("Contraseña", "Las contraseñas no coinciden.", "error");
    return;
  }

  // --- Si todas las validaciones pasan ---
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
    const user = userCredential.user;

    await setDoc(doc(db, 'usuarios', user.uid), {
      cedula: formData.cedula,
      nombres: formData.nombres,
      apellidos: formData.apellidos,
      fechaNacimiento: formData.fechaNacimiento,
      sexo: formData.sexo,
      telefono: formData.telefono,
      email: formData.email,
      estado: 'pendiente'
    });

    Swal.fire("¡Registro exitoso!", "Usuario registrado correctamente.", "success").then(() => {
      window.location.href = "/";
    });
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      Swal.fire("Error", "Este correo ya está registrado.", "error");
    } else {
      console.error(error);
      Swal.fire("Error", "No se pudo registrar el usuario.", "error");
    }
  }
};


  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-gradient">
      <div className="form-card">
        <img src={logo} alt="Logo Brilla" className="logo mb-3 d-block mx-auto" style={{ width: '120px' }} />
        <h3 className="mb-4 text-center">Registro de Usuario</h3>
        <form onSubmit={handleSubmit}>

          <div className="mb-3">
            <label className="form-label">Nombres</label>
            <input type="text" className="form-control" name="nombres" value={formData.nombres} onChange={handleChange} placeholder="Tus nombres" />
          </div>

          <div className="mb-3">
            <label className="form-label">Apellidos</label>
            <input type="text" className="form-control" name="apellidos" value={formData.apellidos} onChange={handleChange} placeholder="Tus apellidos" />
          </div>

          <div className="mb-3">
            <label className="form-label">Cédula</label>
            <input type="text" className="form-control" name="cedula" value={formData.cedula} onChange={handleChange} placeholder="Tu cédula" />
          </div>

          <div className="mb-3">
            <label className="form-label">Fecha de Nacimiento</label>
            <input type="date" className="form-control" name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} />
          </div>

          <div className="mb-3">
            <label className="form-label">Teléfono</label>
            <input type="tel" className="form-control" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="Ej: 3001234567" />
          </div>

          <div className="mb-3">
            <label className="form-label">Sexo</label>
            <div className="d-flex gap-3">
              <div className="form-check">
                <input className="form-check-input" type="radio" name="sexo" value="Masculino" checked={formData.sexo === 'Masculino'} onChange={handleChange} />
                <label className="form-check-label">Masculino</label>
              </div>
              <div className="form-check">
                <input className="form-check-input" type="radio" name="sexo" value="Femenino" checked={formData.sexo === 'Femenino'} onChange={handleChange} />
                <label className="form-check-label">Femenino</label>
              </div>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Correo Electrónico</label>
            <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} placeholder="tucorreo@ejemplo.com" />
          </div>

          <div className="mb-3">
            <label className="form-label">Contraseña</label>
            <input type="password" className="form-control" name="password" value={formData.password} onChange={handleChange} placeholder="Escribe tu contraseña" />
          </div>

          <div className="mb-3">
            <label className="form-label">Repetir Contraseña</label>
            <input type="password" className="form-control" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirma tu contraseña" />
          </div>

          <div className="d-grid gap-2">
            <button type="submit" className="btn btn-primary">Registrar</button>
            <a href="/" className="btn btn-outline-secondary">Volver al inicio</a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
