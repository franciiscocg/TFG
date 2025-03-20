import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

function Home() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Bienvenido a Mi Aplicación</h1>
        <p>Explora y disfruta de una experiencia increíble.</p>
        <Link to="/login">
          <button>Comenzar</button>
        </Link>
      </header>
    </div>
  );
}

export default Home;