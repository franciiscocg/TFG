import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../App.css';

function TextViewer() {
  const [text, setText] = useState('');
  const [extractedData, setExtractedData] = useState({});
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
  }, [isAuthenticated, fileId, navigate]);

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
        setExtractedData(result.extracted_data || {});
      } else {
        setMessage('Error al cargar el texto: ' + JSON.stringify(result));
      }
    } catch (error) {
      setMessage('Error al conectar con el servidor: ' + error.message);
    }
  };

  const handleViewDates = () => {
    navigate(`/dates/${fileId}`, { state: { datesData: extractedData } });
  };
  const handleExtractDates = () => {
    navigate(`/loading/${fileId}`);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="text-viewer-screen screen-container">
      <header className="screen-header">
        <h1>Texto Extraído</h1>
      </header>
      <div className="screen-body">
        {text ? (
          <>
            <pre className="text-content">{text}</pre>
            {Object.keys(extractedData).length > 0 ? (
              <button className="view-dates-btn" onClick={handleViewDates}>
                Ver Fechas Extraídas
              </button>
            ) : (
              <button className="extract-dates-btn" onClick={handleExtractDates}>
              Extraer Fechas
            </button>
            )}
          </>
        ) : (
          <p>No hay texto disponible aún.</p>
        )}
        <Link to="/files">
          <button>Volver a Mis Archivos</button>
        </Link>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
}

export default TextViewer;