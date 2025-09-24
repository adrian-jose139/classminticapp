import { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, NavDropdown, Table, Button, Form, Modal, Image } from 'react-bootstrap';
import { FaEdit, FaTrash, FaUserCircle } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { auth, db } from '../../firebase';
import { signOut } from 'firebase/auth';
import './AuxiliaresPage.css';
import logo from '../../assets/agronomia.avif';

function AuxiliaresPage() {
    const navigate = useNavigate();
    const [auxiliares, setAuxiliares] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedAux, setSelectedAux] = useState(null);

    useEffect(() => {
        const fetchAuxiliares = async () => {
            const querySnapshot = await getDocs(collection(db, 'usuarios'));
            const data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setAuxiliares(data);
        };
        fetchAuxiliares();
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/');
    };

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
                setAuxiliares(auxiliares.filter(a => a.id !== id));
                Swal.fire('Eliminado', 'Registro eliminado correctamente.', 'success');
            } catch (error) {
                console.error(error);
                Swal.fire('Error', 'No se pudo eliminar el registro.', 'error');
            }
        }
    };

    const handleEdit = (aux) => {
        setSelectedAux(aux);
        setShowModal(true);
    };

    const handleSaveChanges = async () => {
        try {
            const auxRef = doc(db, 'usuarios', selectedAux.id);
            await updateDoc(auxRef, {
                nombres: selectedAux.nombres,
                apellidos: selectedAux.apellidos,
                cedula: selectedAux.cedula,
                telefono: selectedAux.telefono,
                email: selectedAux.email,
                fechaNacimiento: selectedAux.fechaNacimiento,
                sexo: selectedAux.sexo,
                estado: selectedAux.estado,
                rol: selectedAux.rol
            });

            setAuxiliares(auxiliares.map(a =>
                a.id === selectedAux.id ? selectedAux : a
            ));

            setShowModal(false);
            Swal.fire('Actualizado', 'Los datos fueron actualizados.', 'success');
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'No se pudo actualizar.', 'error');
        }
    };

    const handleModalChange = (e) => {
    const { name, value } = e.target;

    if (name === "fechaNacimiento") {
        setSelectedAux({
            ...selectedAux,
            fechaNacimiento: value,
            edad: calcularEdad(value) // 👉 recalculamos edad
        });
    } else {
        setSelectedAux({
            ...selectedAux,
            [name]: value
        });
    }
};


const calcularEdad = (fecha) => {
    if (!fecha) return "";
    const hoy = new Date();
    const nacimiento = new Date(fecha);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
    }
    return edad;
};


    // Foto de usuario (si está logueado)
    const user = auth.currentUser;

    return (
        <>
            {/* NAVBAR */}
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

            <main className="main-content">
                <Container className="mt-4">
                    <h2 className="page-title text-center mb-4">
                        AUXILIARES DE SERVICIOS REGISTRADOS EN AGROAPP
                    </h2>
                    <div className="table-container">
                        <Table striped bordered hover responsive className="tabla-auxiliares">
                            <thead>
                                <tr>
                                    <th>Nombres</th>
                                    <th>Apellidos</th>
                                    <th>Cédula</th>
                                    <th>Teléfono</th>
                                    <th>Email</th>
                                    <th>Fecha Nacimiento</th>
                                    <th>Edad</th>
                                    <th>Sexo</th>
                                    <th>Estado</th>
                                    <th>Rol</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {auxiliares.map(aux => (
                                    <tr key={aux.id}>
                                        <td>{aux.nombres}</td>
                                        <td>{aux.apellidos}</td>
                                        <td>{aux.cedula}</td>
                                        <td>{aux.telefono}</td>
                                        <td>{aux.email}</td>
                                        <td>{aux.fechaNacimiento || '-'}</td>
                                        <td>{calcularEdad(aux.fechaNacimiento)}</td>
                                        <td>{aux.sexo || '-'}</td>
                                        <td>
                                              <span
                                                    className={aux.estado === "Activo"
                                                        ? "badge bg-success"
                                                        : aux.estado === "Pendiente"
                                                        ? "badge bg-warning text-dark"
                                                        : "badge bg-secondary"
                                                    }
                                                >
                                                    {aux.estado || 'Pendiente'}
                                                </span>
                                                </td>
                                                <td>
                                                <span
                                                    className={
                                                    aux.rol === "Admin"
                                                        ? "badge bg-primary"
                                                        : "badge bg-info text-dark"
                                                    }
                                                >
                                                    {aux.rol || 'Auxiliar'}
                                                </span>
                                        </td>
                                        
                                        <td>
                                            <Button
                                                variant="warning"
                                                size="sm"
                                                className="me-2"
                                                onClick={() => handleEdit(aux)}
                                            >
                                                <FaEdit />
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => handleEliminar(aux.id)}
                                            >
                                                <FaTrash />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </Container>
            </main>

            <footer className="footer mt-auto">
                <Container className="text-center">
                    <small>© 2025 Brilla. All rights reserved.</small>
                </Container>
            </footer>

            {/* MODAL EDICIÓN */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Editar Auxiliar</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedAux && (
                        <Form>
                            <Form.Group className="mb-2">
                                <Form.Label>Nombres</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="nombres"
                                    value={selectedAux.nombres}
                                    onChange={handleModalChange}
                                />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>Apellidos</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="apellidos"
                                    value={selectedAux.apellidos}
                                    onChange={handleModalChange}
                                />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>Cédula</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="cedula"
                                    value={selectedAux.cedula}
                                    onChange={handleModalChange}
                                />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>Teléfono</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="telefono"
                                    value={selectedAux.telefono}
                                    onChange={handleModalChange}
                                />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    value={selectedAux.email}
                                    disabled
                                />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>Fecha de Nacimiento</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="fechaNacimiento"
                                    value={selectedAux.fechaNacimiento || ''}
                                    onChange={handleModalChange}
                                />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>Edad</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="edad"
                                    value={selectedAux.edad || ''}
                                    readOnly
                                />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>Sexo</Form.Label>
                                <Form.Select
                                    name="sexo"
                                    value={selectedAux.sexo || ''}
                                    onChange={handleModalChange}
                                >
                                    <option value="">Seleccionar</option>
                                    <option value="Masculino">Masculino</option>
                                    <option value="Femenino">Femenino</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>Estado</Form.Label>
                                <Form.Select
                                    name="estado"
                                    value={selectedAux.estado || 'Pendiente'}
                                    onChange={handleModalChange}
                                >
                                    <option>Pendiente</option>
                                    <option>Activo</option>
                                    <option>Inactivo</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>Rol</Form.Label>
                                <Form.Select
                                    name="rol"
                                    value={selectedAux.rol || ""}
                                    onChange={handleModalChange}
                                >
                                    <option value="">-- Seleccione un rol --</option>
                                    <option value="Admin">Admin</option>
                                    <option value="Auxiliar">Auxiliar</option>
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
        </>
    );
}

export default AuxiliaresPage;
