import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

function Login() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Iniciar Sesión o Registrarse</h1>
        <form>
          <div>
            <label>Usuario:</label>
            <input type="text" placeholder="Ingresa tu usuario" />
          </div>
          <div>
            <label>Contraseña:</label>
            <input type="password" placeholder="Ingresa tu contraseña" />
          </div>
          <button type="submit">Iniciar Sesión</button>
          <Link to="/">
            <button type="button">Volver al Inicio</button>
          </Link>
        </form>
      </header>
    </div>
  );
}

export default Login;