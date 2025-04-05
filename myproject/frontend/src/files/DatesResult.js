import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../App.css';

function DatesResult() {
  const { state } = useLocation();
  const { fileId } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [editedData, setEditedData] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (state?.datesData) {
      setEditedData(JSON.stringify(state.datesData, null, 2));
    } else {
      fetchExtractedData();
    }
  }, [isAuthenticated, navigate, state, fileId]);

  const fetchExtractedData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8000/api/upload/${fileId}/text/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (response.ok && result.extracted_data) {
        setEditedData(JSON.stringify(result.extracted_data, null, 2));
      } else {
        setMessage('No hay datos extraídos disponibles para este archivo.');
      }
    } catch (error) {
      setMessage('Error al conectar con el servidor: ' + error.message);
    }
  };

  const handleSaveChanges = async () => {
    try {
      let parsedData;
      try {
        parsedData = JSON.parse(editedData); // Validar que el JSON sea válido
      } catch (error) {
        setMessage('Error: El JSON no es válido. Por favor, corrige el formato.');
        return;
      }

      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8000/api/upload/${fileId}/update-extracted/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ extracted_data: parsedData }),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage('Cambios guardados con éxito');
      } else {
        setMessage('Error al guardar los cambios: ' + JSON.stringify(result));
      }
    } catch (error) {
      setMessage('Error al conectar con el servidor: ' + error.message);
    }
  };

  const handleDataChange = (e) => {
    setEditedData(e.target.value);
    setMessage(''); // Limpiar mensaje al editar
  };

  if (!isAuthenticated) return null;

  return (
    <div className="dates-result-screen screen-container">
      <header className="screen-header">
        <h1>Fechas e Información Extraída</h1>
      </header>
      <div className="screen-body">
        {editedData ? (
          <div className="dates-content">
            <textarea
              className="dates-editor"
              value={editedData}
              onChange={handleDataChange}
              rows="20"
              cols="50"
            />
            <button className="save-btn" onClick={handleSaveChanges}>
              Guardar Cambios
            </button>
          </div>
        ) : (
          <p>No se pudieron extraer datos. Por favor, intenta de nuevo.</p>
        )}
        <Link to="/files">
          <button>Volver a Mis Archivos</button>
        </Link>
        {message && (
          <p className={message.includes('éxito') ? 'success-message' : 'error-message'}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default DatesResult;