import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../App.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  // Define la URL base de tu backend Django
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
  // URL del endpoint de dj-rest-auth para iniciar el login con Google
  const googleLoginUrl = `${backendUrl}/accounts/google/login/`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { username, password };

    try {
      // 1. Solicitud de autenticación
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
        login(result.access, result.refresh); // Guarda los tokens en el contexto

        // 2. Llamada a /api/send-reminders/ con el token
        try {
          const reminderResponse = await fetch('http://localhost:8000/api/ai/send-reminders/', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${result.access}`, // Usa el token de acceso
            },
          });

          const reminderResult = await reminderResponse.json();
          if (reminderResponse.ok) {
            setMessage((prev) => `${prev} - ${reminderResult.message}`);
          } else {
            setMessage((prev) => `${prev} - Error al enviar recordatorios: ${reminderResult.message}`);
          }
        } catch (error) {
          setMessage((prev) => `${prev} - Error al conectar con el servidor de recordatorios: ${error.message}`);
        }

        // 3. Limpia los campos y redirige
        setUsername('');
        setPassword('');
        navigate('/');
      } else {
        setMessage('Error: ' + (result.detail || 'Credenciales inválidas'));
      }
    } catch (error) {
      setMessage('Error al conectar con el servidor: ' + error.message);
    }
  };

  return (
    <div className="login-screen screen-container">
      <header className="screen-header">
        <h1>Iniciar Sesión</h1>
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
              Iniciar sesion con Google
            </button>
          </a>
          <Link to="/register">
            <button type="button">Registrarse</button>
          </Link>
          <Link to="/">
            <button type="button">Volver al Inicio</button>
          </Link>
        </form>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
}

export default Login;