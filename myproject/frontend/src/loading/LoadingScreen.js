import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../App.css';

function LoadingScreen() {
  const [timeLeft, setTimeLeft] = useState(440); // Tiempo estimado inicial
  const [datesData, setDatesData] = useState(null);
  const [error, setError] = useState('');
  const { fileId } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { summaryModel, jsonModel } = location.state || {};

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    fetchDates(); // Iniciamos con la primera solicitud

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isAuthenticated, navigate, fileId]);

  const fetchDates = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8000/api/ai/${fileId}/dates/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ summary_model: summaryModel, json_model: jsonModel }),
      });

      const result = await response.json();
      if (response.ok) {
        setDatesData(result);
        await processExtractedData();
      } else {
        setError('Error al extraer fechas: ' + JSON.stringify(result));
        setTimeLeft(0);
      }
    } catch (error) {
      setError('Error al conectar con el servidor: ' + error.message);
      setTimeLeft(0);
    }
  };

  const processExtractedData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8000/api/ai/${fileId}/process-extracted-data/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      if (response.ok) {
        setTimeLeft(0); // Detenemos el temporizador
        navigate(`/dates/${fileId}`, { state: { datesData: datesData } });
      } else {
        setError('Error al procesar los datos extraídos: ' + JSON.stringify(result));
        setTimeLeft(0);
      }
    } catch (error) {
      setError('Error al conectar con el servidor: ' + error.message);
      setTimeLeft(0);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="loading-screen screen-container">
      <header className="screen-header">
        <h1>Procesando Datos</h1>
        <div className="loading-container">
          <p>Procesando el texto, Tiempo estimado restante: {timeLeft} segundos</p>
          <div className="spinner"></div>
        </div>
        {error && <p className="error-message">{error}</p>}
      </header>
    </div>
  );
}

export default LoadingScreen;