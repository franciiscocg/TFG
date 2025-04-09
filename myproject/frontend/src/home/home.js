import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';
import { useAuth } from '../context/AuthContext';

function Home() {
    const { isAuthenticated } = useAuth();

    // Define la URL base de tu backend Django. AJÚSTALA SI ES DIFERENTE.
    // Es mejor práctica obtenerla de variables de entorno.
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

    // URL del endpoint de dj-rest-auth para iniciar el login con Google
    const googleLoginUrl = `${backendUrl}/accounts/google/login/`;

    return (
        <div className="home-screen">
            <header className="screen-header">
                <h1>Bienvenido StudySift</h1>
            </header>
            <div className="screen-body">
                {isAuthenticated ? (
                    // --- Sección para usuarios AUTENTICADOS ---
                    <>
                        <p>Gestiona tus documentos y fechas importantes.</p>
                        <Link to="/upload">
                            <button style={{ marginRight: '10px' }}>Subir PDF</button>
                        </Link>
                        {/* Podrías añadir aquí un botón para VINCULAR Google si aún no lo está,
                            usando la misma URL googleLoginUrl, ya que dj-rest-auth/allauth
                            manejará la vinculación si el usuario ya está logueado en tu app */}
                        <a href={googleLoginUrl}>
                           <button>Vincular Cuenta de Google</button> {/* O lógica para mostrar solo si no está vinculado */}
                        </a>
                         <p style={{ marginTop: '10px', fontSize: '0.9em' }}>
                           (Vincula tu cuenta para poder exportar fechas a Google Calendar)
                        </p>
                    </>
                ) : (
                    // --- Sección para usuarios NO AUTENTICADOS ---
                    <>
                        <p>Necesitas una cuenta para utilizar la web</p>
                        {/* Botón para login/registro normal */}
                        <Link to="/login">
                            <button style={{ marginRight: '10px' }}>Comenzar</button>
                        </Link>

                        {/* --- Botón para Iniciar Sesión con Google --- */}
                        {/* Enlazamos directamente al endpoint de dj-rest-auth */}
                        <a href={googleLoginUrl} style={{ textDecoration: 'none' }}>
                           <button>Iniciar Sesión con Google</button>
                        </a>
                        {/* ----------------------------------------- */}
                    </>
                )}
            </div>
        </div>
    );
}

export default Home;