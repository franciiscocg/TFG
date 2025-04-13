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
                    // --- Sección para usuarios AUTENTICADOS ---
                    <>
                        <p>Gestiona tus documentos y fechas importantes.</p>
                        <Link to="/upload">
                            <button>Subir PDF</button>
                        </Link>
                    </>
                ) : (
                    // --- Sección para usuarios NO AUTENTICADOS ---
                    <>
                        <p>Necesitas una cuenta para utilizar la web</p>
                        {/* Botón para login/registro normal */}
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