import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppNavbar from '../AppNavbar';
import '../App.css';

function TextViewer() {
  const [text, setText] = useState('');
  const [message, setMessage] = useState('');
  const { fileId } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchText();
  }, [isAuthenticated, navigate, fileId]);

  const fetchText = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8000/api/upload/${fileId}/text/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (response.ok) {
        setText(result.text);
      } else {
        setMessage('Error al cargar el texto: ' + JSON.stringify(result));
      }
    } catch (error) {
      setMessage('Error al conectar con el servidor: ' + error.message);
    }
  };

  const handleExtractDates = () => {
    navigate(`/loading/${fileId}`); // Redirige a la pantalla de carga
  };

  if (!isAuthenticated) return null;

  return (
    <div className="screen-container">
      <AppNavbar />
      <header className="screen-header">
        <h1>Texto Extraído</h1>
        {text ? (
          <>
            <pre className="text-content">{text}</pre>
            <button className="extract-dates-btn" onClick={handleExtractDates}>
              Extraer Fechas
            </button>
          </>
        ) : (
          <p>No hay texto disponible aún.</p>
        )}
        <Link to="/files">
          <button>Volver a Mis Archivos</button>
        </Link>
        {message && <p>{message}</p>}
      </header>
    </div>
  );
}

export default TextViewer;