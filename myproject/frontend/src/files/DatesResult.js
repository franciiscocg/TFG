import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppNavbar from '../AppNavbar';
import '../App.css';

function DatesResult() {
  const { state } = useLocation();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const datesData = state?.datesData;

  return (
    <div className="screen-container">
      <header className="screen-header">
        <h1>Fechas e Información Extraída</h1>
        {datesData ? (
          <div className="dates-content">
            <pre>{JSON.stringify(datesData, null, 2)}</pre>
          </div>
        ) : (
          <p>No se pudieron extraer datos. Por favor, intenta de nuevo.</p>
        )}
        <Link to="/files">
          <button>Volver a Mis Archivos</button>
        </Link>
      </header>
    </div>
  );
}

export default DatesResult;