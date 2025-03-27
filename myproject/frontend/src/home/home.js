import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';
import { useAuth } from '../context/AuthContext';

function Home() {
    const { isAuthenticated } = useAuth();

    return (
<div className="home-screen">
  <header className="screen-header">
    <h1>Bienvenido StudySift</h1>
  </header>
  <div className="screen-body">
  {isAuthenticated ? (
      <>
        <p>¿Quieres sacar las fechas importantes?</p>
        <Link to="/upload">
          <button>Subir PDF</button>
        </Link>
      </>
    ) : (
      <>
        <p>Necesitas una cuenta para utilizar la web</p>
        <Link to="/login">
          <button>Comenzar</button>
        </Link>
      </>
    )}
  </div>
</div>
    );
}

export default Home;