import React, { useState, useEffect, useCallback } from 'react'; // Añadido useCallback
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import iCalendarPlugin from '@fullcalendar/icalendar';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../App.css';

// --- Helper para calcular el día siguiente (para eventos de día completo en Google Calendar) ---
function getNextDay(dateString) { // dateString en formato YYYY-MM-DD
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1);
    // Asegurarse de usar UTC para evitar problemas de zona horaria al convertir a ISO string
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
// ---------------------------------------------------------------------------------------

function CalendarScreen() {
    // --- Obtener estado de AuthContext ---
    // !! Necesitas añadir 'isGoogleLinked' a tu AuthContext !!
    // Simulando por ahora:
    const { isAuthenticated /*, isGoogleLinked = false */ } = useAuth();
    // --- !!! DESCOMENTA y obtén isGoogleLinked de useAuth() cuando lo implementes !!! ---
    const isGoogleLinked = true; // <- ¡¡¡ SIMULACIÓN !!! Reemplaza con el valor real del contexto

    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // --- Estado para la exportación a Google ---
    const [isExportingGoogle, setIsExportingGoogle] = useState(false);
    const [exportGoogleStatus, setExportGoogleStatus] = useState(''); // Mensajes de éxito/error
    // -----------------------------------------

    // --- Endpoint del Backend ---
    // Es mejor si viene de una variable de entorno
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
    const exportApiUrl = `${backendUrl}/api/ai/export-google-calendar/`; // Confirma que esta es la URL correcta de tu API Django
    const calendarDataUrl = `${backendUrl}/api/ai/calendar/data/`;
    // --------------------------

    // --- Fetch de Datos del Calendario (envuelto en useCallback) ---
    const fetchCalendarData = useCallback(async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                console.error("No access token found");
                navigate('/login'); // Redirigir si no hay token
                return [];
            }
            const response = await fetch(calendarDataUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json' // Buena práctica añadir Content-Type
                }
            });
            if (!response.ok) {
                // Si la respuesta no es OK (ej: 401 Unauthorized), podría ser token expirado
                if (response.status === 401) {
                    console.error('Token might be expired or invalid.');
                     // Aquí podrías intentar usar el refresh token para obtener uno nuevo
                     // o simplemente forzar el logout/redirigir a login
                     // logout(); // Asumiendo que logout() existe en tu AuthContext
                    navigate('/login');
                }
                const errorResult = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }));
                console.error('Error fetching calendar data:', errorResult.message);
                return [];
            }
            const result = await response.json();
            return result.data || []; // Asegurarse de devolver array aunque 'data' no exista
        } catch (error) {
            console.error('Error fetching calendar data:', error);
            return [];
        }
    }, [navigate, calendarDataUrl]); // Dependencias para useCallback
    // -------------------------------------------------------------

    // --- Carga de Eventos (useEffect) ---
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return; // Salir temprano si no está autenticado
        }

        const loadEvents = async () => {
            const calendarData = await fetchCalendarData();
            if (calendarData) { // Solo procesar si fetchCalendarData devolvió datos
                 const calendarEvents = calendarData.flatMap(item =>
                    // Asegurarse que item.fechas existe y es un array
                    (item.fechas || []).map(event => ({
                        id: `${item.file_id || 'unknown'}-${event.titulo || 'untitled'}-${event.fecha || Date.now()}`, // Id más robusto
                        title: event.titulo || 'Evento sin título', // Valor por defecto
                        date: event.fecha, // Fecha YYYY-MM-DD
                        // Asegurarse que event.fecha existe antes de usarlo
                        end: event.fecha ? getNextDay(event.fecha) : null, // Calcula fecha fin para Google Calendar (exclusiva)
                        extendedProps: {
                            filename: item.filename || 'Desconocido',
                            asignatura: item.asignatura?.nombre || 'N/A', // Acceso seguro
                            grado: item.asignatura?.grado || 'N/A',
                            departamento: item.asignatura?.departamento || 'N/A',
                            universidad: item.asignatura?.universidad || 'N/A',
                            condiciones_aprobado: item.asignatura?.condiciones_aprobado || 'N/A',
                            description: `Archivo: ${item.filename || 'Desconocido'}\nAsignatura: ${item.asignatura?.nombre || 'N/A'}`
                        }
                    }))
                );
                setEvents(calendarEvents);
            }
        };

        loadEvents();
        // Añadir fetchCalendarData a las dependencias
    }, [isAuthenticated, navigate, fetchCalendarData]);
    // -----------------------------------------

    // --- Manejador de Clic en Evento ---
    const handleEventClick = (clickInfo) => {
        setSelectedEvent(clickInfo.event);
        setIsModalOpen(true);
    };
    // ------------------------------------

    // --- Exportar a iCal (sin cambios) ---
     const exportToICal = () => {
        // ... (tu código existente para iCal) ...
        // Asegúrate que tu código iCal maneja bien las fechas/horas
        const icsContent = [/* ... tu lógica ... */].join('\n');
        const blob = new Blob([icsContent], { type: 'text/calendar' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'eventos.ics';
        link.click();
        window.URL.revokeObjectURL(url);
     };
    // ----------------------------------

    // --- *** NUEVA FUNCIÓN: Exportar a Google Calendar *** ---
    const handleExportToGoogle = async () => {
        if (!events || events.length === 0) {
            setExportGoogleStatus('No hay eventos para exportar.');
            return;
        }
        if (!isGoogleLinked) {
            setExportGoogleStatus('Necesitas vincular tu cuenta de Google primero.');
             // Podrías redirigir a la página de perfil o mostrar un modal para vincular
            return;
        }

        setIsExportingGoogle(true);
        setExportGoogleStatus('Exportando eventos a Google Calendar...');

        const token = localStorage.getItem('accessToken');
        if (!token) {
             setExportGoogleStatus('Error de autenticación. Intenta iniciar sesión de nuevo.');
             setIsExportingGoogle(false);
             navigate('/login');
             return;
        }

        let successCount = 0;
        let errorCount = 0;
        const results = [];

        // Usar Promise.allSettled para manejar múltiples llamadas API
        const exportPromises = events.map(event => {
            // Preparamos los datos para la API de Django
            const eventData = {
                summary: event.title,
                // Google Calendar API usa 'date' para eventos de día completo
                // y la fecha de fin es exclusiva.
                start_date: event.date, // Formato YYYY-MM-DD
                end_date: getNextDay(event.date), // Formato YYYY-MM-DD (día siguiente)
                description: event.extendedProps?.description || '', // Añadir descripción
            };

            console.log("Enviando a Google:", eventData); // Log para depuración

            return fetch(exportApiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(eventData),
            })
            .then(response => {
                if (response.ok) {
                    return response.json().then(data => ({ status: 'fulfilled', value: data, eventTitle: event.title }));
                } else {
                    // Intentar obtener mensaje de error del cuerpo si es posible
                    return response.json()
                        .catch(() => ({ message: `Error ${response.status} al exportar` })) // Fallback si el cuerpo no es JSON
                        .then(errData => Promise.reject({ status: 'rejected', reason: errData, eventTitle: event.title }));
                }
            })
             .catch(error => {
                 // Capturar errores de red o errores del .then anterior
                 return Promise.reject({ status: 'rejected', reason: error.reason || error, eventTitle: event.title });
             });
        });

        const settledResults = await Promise.allSettled(exportPromises);

        settledResults.forEach(result => {
            if (result.status === 'fulfilled') {
                successCount++;
                results.push(`Éxito: "${result.value.eventTitle}" exportado.`);
                 console.log("Exportación exitosa:", result.value);
            } else {
                errorCount++;
                const reason = result.reason.reason?.message || result.reason.reason?.error || result.reason.message || 'Error desconocido';
                results.push(`Error al exportar "${result.reason.eventTitle}": ${reason}`);
                 console.error("Error en exportación:", result.reason);
            }
        });

        setIsExportingGoogle(false);
        // Mostrar un resumen. Podrías usar una librería de notificaciones (toast)
        setExportGoogleStatus(`Exportación completada. Éxitos: ${successCount}, Errores: ${errorCount}. \n${results.slice(0, 5).join('\n')}${results.length > 5 ? '\n...' : ''}`); // Muestra los primeros 5 resultados
    };
    // --- ************************************************ ---

    // --- Renderizado del Componente ---
    return (
        <div className="screen-container calendar-screen">
            <header className="screen-header">
                <h1>Calendario</h1>
                {/* <p>Selecciona una fecha para agregar un evento</p> */}
            </header>
            <div className="screen-body">
                <div className="calendar-container">
                    <FullCalendar
                        // ... (tus props de FullCalendar) ...
                        plugins={[dayGridPlugin, interactionPlugin, iCalendarPlugin]}
                        initialView="dayGridMonth"
                        locale="es"
                        events={events}
                        eventClick={handleEventClick}
                        eventColor="#61dafb"
                        height="auto"
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,dayGridWeek',
                        }}
                        eventDidMount={(info) => {
                            // Tooltip simple con la descripción
                            if (info.event.extendedProps.description) {
                                info.el.title = info.event.extendedProps.description;
                            }
                        }}
                    />
                    <div className="calendar-buttons"> {/* Contenedor para botones */}
                         <button onClick={exportToICal} className="export-btn">
                            Exportar a iCal
                        </button>

                        {/* --- NUEVO BOTÓN EXPORTAR A GOOGLE --- */}
                        {isGoogleLinked ? (
                            <button
                                onClick={handleExportToGoogle}
                                className="export-btn google-export-btn" // Clase diferente para estilo
                                disabled={isExportingGoogle || events.length === 0}
                            >
                                {isExportingGoogle ? 'Exportando a Google...' : 'Exportar a Google Calendar'}
                            </button>
                        ) : (
                             <p style={{ marginTop: '10px', fontSize: '0.9em', color: '#666' }}>
                                Vincula tu cuenta de Google para poder exportar.
                                {/* Opcional: Añadir un Link aquí a la página de perfil/configuración para vincular */}
                                {/* <Link to="/profile">Vincular cuenta</Link> */}
                            </p>
                        )}
                        {/* --- FIN NUEVO BOTÓN --- */}
                    </div>
                     {/* --- Mensaje de Estado de Exportación Google --- */}
                    {exportGoogleStatus && (
                        <p className={`export-status ${exportGoogleStatus.includes('Error') ? 'error' : 'success'}`}>
                            {exportGoogleStatus.split('\n').map((line, index) => (
                                <React.Fragment key={index}>{line}<br /></React.Fragment>
                             ))}
                        </p>
                    )}
                    {/* --------------------------------------------- */}
                </div>
            </div>

            {/* Modal (sin cambios) */}
            {isModalOpen && selectedEvent && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Detalles del Evento</h2>
                        <div className="modal-details">
                            <p><strong>Título:</strong> {selectedEvent.title || 'No especificado'}</p>
                            <p><strong>Archivo:</strong> {selectedEvent.extendedProps.filename || 'No especificado'}</p>
                            <p><strong>Asignatura:</strong> {selectedEvent.extendedProps.asignatura || 'No especificado'}</p>
                            <p><strong>Grado:</strong> {selectedEvent.extendedProps.grado || 'No especificado'}</p>
                            <p><strong>Departamento:</strong> {selectedEvent.extendedProps.departamento || 'No especificado'}</p>
                            <p><strong>Universidad:</strong> {selectedEvent.extendedProps.universidad || 'No especificado'}</p>
                            <p><strong>Condiciones de aprobado:</strong> {selectedEvent.extendedProps.condiciones_aprobado || 'No especificado'}</p>
                        </div>
                        <div className="modal-buttons">
                            <button onClick={() => setIsModalOpen(false)}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CalendarScreen;