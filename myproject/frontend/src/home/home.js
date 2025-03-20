import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';
import { useAuth } from '../context/AuthContext';

function Home() {
    const { isAuthenticated } = useAuth();

  return (
    <div className="screen-container">
    <header className="screen-header">
        <h1>Bienvenido a Mi Aplicación</h1>
        {isAuthenticated ? (
          <>
            <p>Bienvenido de nuevo. ¿Qué quieres hacer hoy?</p>
            <Link to="/upload">
              <button>Subir PDF</button>
            </Link>
          </>
        ) : (
          <>
            <p>Explora y disfruta de una experiencia increíble.</p>
            <Link to="/login">
              <button>Comenzar</button>
            </Link>
          </>
        )}
      </header>
    </div>
  );
}

export default Home;