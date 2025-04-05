import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import iCalendarPlugin from '@fullcalendar/icalendar';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../App.css';

function CalendarScreen() {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchCalendarData = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('http://localhost:8000/api/ai/calendar/data/', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            const result = await response.json();
            if (response.ok) {
                return result.data;
            } else {
                console.error('Error fetching calendar data:', result.message);
                return [];
            }
        } catch (error) {
            console.error('Error fetching calendar data:', error);
            return [];
        }
    };

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        const loadEvents = async () => {
            const calendarData = await fetchCalendarData();
            const calendarEvents = calendarData.flatMap(item => 
                item.fechas.map(event => ({
                    id: `${item.file_id || 'unknown'}-${event.titulo}-${event.fecha}`,
                    title: event.titulo,
                    date: event.fecha,
                    extendedProps: {
                        filename: item.filename || 'Desconocido',
                        asignatura: item.asignatura.nombre,
                        grado: item.asignatura.grado,
                        departamento: item.asignatura.departamento,
                        universidad: item.asignatura.universidad,
                        condiciones_aprobado: item.asignatura.condiciones_aprobado,
                        description: `Archivo: ${item.filename || 'Desconocido'}\nAsignatura: ${item.asignatura.nombre}`
                    }
                }))
            );
            setEvents(calendarEvents);
        };

        loadEvents();
    }, [isAuthenticated, navigate]);

    const handleEventClick = (clickInfo) => {
        setSelectedEvent(clickInfo.event);
        setIsModalOpen(true);
    };

    const exportToICal = () => {
        const icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//TuApp//Calendario//ES',
            ...events.map(event => [
                'BEGIN:VEVENT',
                `DTSTART:${event.date.replace(/-/g, '')}T090000Z`,
                `DTEND:${event.date.replace(/-/g, '')}T100000Z`,
                `SUMMARY:${event.title}`,
                `UID:${event.id}`,
                'END:VEVENT',
            ].join('\n')),
            'END:VCALENDAR',
        ].join('\n');

        const blob = new Blob([icsContent], { type: 'text/calendar' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'eventos.ics';
        link.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="screen-container calendar-screen">
            <header className="screen-header">
                <h1>Calendario</h1>
                <p>Selecciona una fecha para agregar un evento</p>
            </header>
            <div className="screen-body">
                <div className="calendar-container">
                    <FullCalendar
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
                            info.el.title = info.event.extendedProps.description;
                        }}
                    />
                    <button onClick={exportToICal} className="export-btn">
                        Exportar a iCal
                    </button>
                </div>
            </div>

            {/* Modal */}
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