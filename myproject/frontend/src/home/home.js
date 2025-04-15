import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';
import { useAuth } from '../context/AuthContext';

function Home() {
    const { isAuthenticated, result } = useAuth(); // Asegúrate de que `result` contenga el token de acceso

    // Función para realizar la llamada a la API
    const fetchReminders = async () => {
        try {
          const token = localStorage.getItem('accessToken');
            const reminderResponse = await fetch('http://localhost:8000/api/ai/send-reminders/', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`, // Usa el token de acceso
                },
            });

            if (!reminderResponse.ok) {
                throw new Error('Error en la solicitud');
            }

            const data = await reminderResponse.json();
            console.log('Respuesta de la API:', data);
            // Aquí puedes manejar la respuesta, por ejemplo, mostrar los recordatorios
        } catch (error) {
            console.error('Error al obtener recordatorios:', error);
        }
    };

    // Ejecutar la llamada a la API cuando el componente se monta y el usuario está autenticado
    useEffect(() => {
        if (isAuthenticated) {
            fetchReminders();
        }
    }, [isAuthenticated, result]);

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