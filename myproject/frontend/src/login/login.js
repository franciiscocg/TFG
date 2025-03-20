import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { username, password };

    try {
      const response = await fetch('http://localhost:8000/api/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage('Inicio de sesión exitoso');
        localStorage.setItem('accessToken', result.access); 
        localStorage.setItem('refreshToken', result.refresh);
        setUsername('');
        setPassword('');
        // Aquí podrías redirigir a otra pantalla, como Home
      } else {
        setMessage('Error: ' + (result.detail || 'Credenciales inválidas'));
      }
    } catch (error) {
      setMessage('Error al conectar con el servidor: ' + error.message);
    }
  };

  return (
    <div className="screen-container">
      <header className="screen-header">
        <h1>Iniciar Sesión</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Usuario:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingresa tu usuario"
              required
            />
          </div>
          <div>
            <label>Contraseña:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              required
            />
          </div>
          <button type="submit">Iniciar Sesión</button>
          <Link to="/register">
            <button type="button">Registrarse</button>
          </Link>
          <Link to="/">
            <button type="button">Volver al Inicio</button>
          </Link>
        </form>
        {message && <p>{message}</p>}
      </header>
    </div>
  );
}

export default Login;