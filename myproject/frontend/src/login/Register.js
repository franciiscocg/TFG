import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [message, setMessage] = useState('');

  // Define la URL base de tu backend Django
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
  // URL del endpoint de dj-rest-auth para iniciar el login con Google
  const googleLoginUrl = `${backendUrl}/accounts/google/login/`;

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
    <div className="register-screen screen-container">
      <header className="screen-header">
        <h1>Registrarse</h1>
      </header>
      <div className="screen-body">
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
          <a href={googleLoginUrl} style={{ textDecoration: 'none' }}>
            <button
              type="button"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#fff',
                color: '#333',
                border: '1px solid #dadce0',
                borderRadius: '4px',
                padding: '10px 16px',
                fontSize: '14px',
                fontWeight: '500',
                fontFamily: 'Roboto, sans-serif',
                width: '100%',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.15)',
                marginTop: '10px',
                marginBottom: '10px',
                cursor: 'pointer',
              }}
            >
              <img
                src="https://www.google.com/favicon.ico"
                alt="Google icon"
                style={{ width: '18px', height: '18px', marginRight: '8px' }}
              />
              Registrarse con Google
            </button>
          </a>
          <p style={{ marginTop: '10px', fontSize: '0.9em' }}>
            (Regístrate con Google para exportar tus datos a Google Calendar)
          </p>
          <Link to="/">
            <button type="button">Volver al Inicio</button>
          </Link>
        </form>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
}

export default Register;