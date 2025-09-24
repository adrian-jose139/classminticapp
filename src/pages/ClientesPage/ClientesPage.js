import { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Form, Modal, Navbar, Nav, Container, NavDropdown, Image } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { auth, db } from '../../firebase';
import { signOut } from 'firebase/auth';
import './ClientesPage.css';
import logo from '../../assets/agronomia.avif';
import {FaUserCircle } from "react-icons/fa";

function ClientesPage() {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);

  const user = auth.currentUser;

  // 🔹 Cargar clientes desde Firestore
  useEffect(() => {
    const fetchClientes = async () => {
      const querySnapshot = await getDocs(collection(db, 'usuarios'));
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setClientes(data);
    };
    fetchClientes();
  }, []);

  // 🔹 Cerrar sesión
  const handleLogout = async () => {
    try {
      await signOut(auth);
      Swal.fire("Sesión cerrada", "Has cerrado sesión correctamente", "success").then(() => {
        navigate("/");
      });
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo cerrar sesión", "error");
    }
  };

  // 🔹 Eliminar cliente
  const handleEliminar = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¡No podrás recuperar este registro!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(db, 'usuarios', id));
        setClientes(clientes.filter(c => c.id !== id));
        Swal.fire('Eliminado', 'Cliente eliminado correctamente.', 'success');
      } catch (error) {
        console.error(error);
        Swal.fire('Error', 'No se pudo eliminar el cliente.', 'error');
      }
    }
  };

  // 🔹 Editar cliente
  const handleEdit = (cliente) => {
    setSelectedCliente(cliente);
    setShowModal(true);
  };

  // 🔹 Guardar cambios
  const handleSaveChanges = async () => {
    try {
      const clienteRef = doc(db, 'usuarios', selectedCliente.id);
      await updateDoc(clienteRef, {
        nombres: selectedCliente.nombres,
        apellidos: selectedCliente.apellidos,
        cedula: selectedCliente.cedula,
        telefono: selectedCliente.telefono,
        email: selectedCliente.email,
        fechaNacimiento: selectedCliente.fechaNacimiento,
        sexo: selectedCliente.sexo,
        estado: selectedCliente.estado,
        rol: selectedCliente.rol
      });

      setClientes(clientes.map(c =>
        c.id === selectedCliente.id ? selectedCliente : c
      ));

      setShowModal(false);
      Swal.fire('Actualizado', 'Los datos fueron actualizados.', 'success');
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo actualizar.', 'error');
    }
  };

  return (
    <div>
      {/* 🔹 Navbar */}
<Navbar expand="lg" bg="dark" variant="dark" className="dashboard-navbar">
                <Container>
                    <Navbar.Brand onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
                        <img src={logo} alt="Brilla Logo" height="40" />
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="ms-auto">
                            <Nav.Link onClick={() => navigate('/clientes')}>Clientes</Nav.Link>
                            <Nav.Link onClick={() => navigate('/auxiliares')}>Auxiliares</Nav.Link>
                            <Nav.Link onClick={() => navigate('/servicios')}>Servicios</Nav.Link>
                            <Nav.Link onClick={() => navigate('/cronograma')}>Cronograma</Nav.Link>
                            <Nav.Link onClick={() => navigate('/dashboard')}>Inicio</Nav.Link>

                            <NavDropdown
                                title={
                                    <>
                                        {user?.photoURL ? (
                                            <Image src={user.photoURL} roundedCircle width="30" height="30" />
                                        ) : (
                                            <FaUserCircle size={24} color="#fff" />
                                        )}
                                    </>
                                }
                                id="user-nav-dropdown"
                                align="end"
                            >
                                <NavDropdown.Item disabled>
                                    {user?.email || 'Usuario'}
                                </NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item onClick={handleLogout}>
                                    Cerrar Sesión
                                </NavDropdown.Item>
                            </NavDropdown>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

      {/* 🔹 Tabla de clientes */}
      <div className="container mt-4">
        <h2 className="mb-3 text-center">Gestión de Clientes</h2>

        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Nombres</th>
              <th>Apellidos</th>
              <th>Cédula</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Estado</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map(cliente => (
              <tr key={cliente.id}>
                <td>{cliente.nombres}</td>
                <td>{cliente.apellidos}</td>
                <td>{cliente.cedula}</td>
                <td>{cliente.telefono}</td>
                <td>{cliente.email}</td>


                <td>
                  <span
                    className={cliente.estado === "Activo"
                      ? "badge bg-success"
                      : cliente.estado === "Pendiente"
                        ? "badge bg-warning text-dark"
                        : "badge bg-secondary"
                    }
                  >
                    {cliente.estado || 'pendiente'}
                  </span>
                </td>
                <td>
                  <span
                    className={
                      cliente.rol === "Admin"
                        ? "badge bg-primary"
                        : "badge bg-info text-dark"
                    }
                  >
                    {cliente.rol || 'cliente'}
                  </span>
                </td>
                <td>
                  <Button
                    variant="warning"
                    size="sm"
                    className="me-2"
                    onClick={() => handleEdit(cliente)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleEliminar(cliente.id)}
                  >
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <footer className="footer mt-auto">
          <Container className="text-center">
            <small>© 2025 Brilla. All rights reserved.</small>
          </Container>
        </footer>

        {/* 🔹 Modal edición */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Editar Cliente</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedCliente && (
              <Form>
                <Form.Group className="mb-2">
                  <Form.Label>Nombres</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedCliente.nombres}
                    onChange={(e) =>
                      setSelectedCliente({ ...selectedCliente, nombres: e.target.value })
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Apellidos</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedCliente.apellidos}
                    onChange={(e) =>
                      setSelectedCliente({ ...selectedCliente, apellidos: e.target.value })
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedCliente.telefono}
                    onChange={(e) =>
                      setSelectedCliente({ ...selectedCliente, telefono: e.target.value })
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Estado</Form.Label>
                  <Form.Select
                    value={selectedCliente.estado}
                    onChange={(e) =>
                      setSelectedCliente({ ...selectedCliente, estado: e.target.value })
                    }
                  >
                    <option>Activo</option>
                    <option>Inactivo</option>
                    <option>Pendiente</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Rol</Form.Label>
                  <Form.Select
                    value={selectedCliente.rol || "Cliente"}
                    onChange={(e) =>
                      setSelectedCliente({ ...selectedCliente, rol: e.target.value })
                    }
                  >
                    <option>Cliente</option>
                    <option>Admin</option>
                    <option>Auxiliar</option>
                  </Form.Select>
                </Form.Group>
              </Form>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSaveChanges}>
              Guardar Cambios
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}

export default ClientesPage;
