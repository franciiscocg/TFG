import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AppNavbar from '../AppNavbar';
import '../App.css';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { username, email, password, password2 };

    try {
      const response = await fetch('http://localhost:8000/api/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage('Registro exitoso. Ahora puedes iniciar sesión.');
        setUsername('');
        setEmail('');
        setPassword('');
        setPassword2('');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      } else {
        setMessage('Error: ' + JSON.stringify(result));
      }
    } catch (error) {
      setMessage('Error al conectar con el servidor: ' + error.message);
    }
  };

  return (
    <div className="screen-container">
      <AppNavbar />
      <header className="screen-header">
        <h1>Registrarse</h1>
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
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ingresa tu email"
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
          <div>
            <label>Confirmar Contraseña:</label>
            <input
              type="password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              placeholder="Confirma tu contraseña"
              required
            />
          </div>
          <button type="submit">Registrarse</button>
          <Link to="/">
            <button type="button">Volver al Inicio</button>
          </Link>
        </form>
        {message && <p>{message}</p>}
      </header>
    </div>
  );
}

export default Register;