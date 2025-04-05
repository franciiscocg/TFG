import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../App.css';

function AsignaturasList() {
  const [asignaturas, setAsignaturas] = useState([]);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [asignaturaToDelete, setAsignaturaToDelete] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchAsignaturas();
  }, [isAuthenticated, navigate]);

  const fetchAsignaturas = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8000/api/ai/calendar/data/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (response.ok && result.data) {
        setAsignaturas(result.data);
      } else {
        setMessage('No se pudieron cargar las asignaturas: ' + JSON.stringify(result));
      }
    } catch (error) {
      setMessage('Error al conectar con el servidor: ' + error.message);
    }
  };

  const handleDeleteClick = (asignatura) => {
    setAsignaturaToDelete(asignatura);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8000/api/ai/asignaturas/${asignaturaToDelete.asignatura.nombre}/delete/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (response.ok) {
        setAsignaturas(asignaturas.filter(item => item.asignatura.nombre !== asignaturaToDelete.asignatura.nombre));
        setMessage('Asignatura eliminada con éxito');
      } else {
        setMessage('Error al eliminar la asignatura: ' + JSON.stringify(result));
      }
    } catch (error) {
      setMessage('Error al conectar con el servidor: ' + error.message);
    } finally {
      setShowModal(false);
      setAsignaturaToDelete(null);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="asignaturas-list-screen screen-container">
      <header className="screen-header">
        <h1>Lista de Asignaturas</h1>
      </header>
      <div className="screen-body">
        {asignaturas.length > 0 ? (
          <ul className="asignaturas-list">
            {asignaturas.map((item) => (
              <li key={item.asignatura.nombre}>
                <Link to={`/editar-asignatura/${item.asignatura.nombre}`}>
                  {item.asignatura.nombre}
                </Link>
                <span>{item.asignatura.grado} - {item.asignatura.universidad}</span>
                <button className="delete-btn" onClick={() => handleDeleteClick(item)}>
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No hay asignaturas disponibles.</p>
        )}
        {message && (
          <p data-message={message} className={message.includes('éxito') ? 'success' : 'error'}>
            {message}
          </p>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Confirmar Eliminación</h2>
            <div className="modal-details">
              <p>¿Estás seguro de que quieres eliminar la asignatura <strong>{asignaturaToDelete?.asignatura.nombre}</strong>?</p>
              <p>Esto eliminará también todos los horarios, fechas y profesores asociados.</p>
            </div>
            <div className="modal-buttons">
              <button onClick={confirmDelete}>Eliminar</button>
              <button onClick={() => setShowModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AsignaturasList;