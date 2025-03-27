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

    const fetchUserExtractedData = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('http://localhost:8000/api/upload/extracted/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Error fetching extracted data:', error);
            return [];
        }
    };

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        const loadEvents = async () => {
            const extractedData = await fetchUserExtractedData();
            const calendarEvents = extractedData.flatMap(file => 
                file.extracted_data[0].fechas.map(event => ({
                    id: `${file.file_id}-${event.titulo}-${event.fecha}`,
                    title: event.titulo,
                    date: event.fecha,
                    extendedProps: {
                        filename: file.filename,
                        asignatura: file.extracted_data[0].asignatura.nombre,
                        grado: file.extracted_data[0].asignatura.grado,
                        departamento: file.extracted_data[0].asignatura.departamento,
                        universidad: file.extracted_data[0].asignatura.universidad,
                        condiciones_aprobado: file.extracted_data[0].asignatura.condiciones_aprobado,
                        description: `Archivo: ${file.filename}\nAsignatura: ${file.extracted_data[0].asignatura.nombre}`
                    }
                }))
            );
            setEvents(calendarEvents);
        };

        loadEvents();
    }, [isAuthenticated, navigate]);

    const handleDateClick = (arg) => {
        const title = prompt('Ingresa el nombre del evento:');
        if (title) {
            setEvents([...events, { 
                title, 
                date: arg.dateStr, 
                id: Date.now().toString(),
                extendedProps: {
                    filename: 'Evento manual',
                    asignatura: 'N/A',
                    grado: 'N/A',
                    departamento: 'N/A',
                    universidad: 'N/A',
                    condiciones_aprobado: 'N/A',
                    description: 'Evento creado manualmente'
                }
            }]);
        }
    };

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
                        dateClick={handleDateClick}
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
                            <p><strong>Título:</strong> {selectedEvent.title}</p>
                            <p><strong>Fecha:</strong> {selectedEvent.date}</p>
                            <p><strong>Archivo:</strong> {selectedEvent.extendedProps.filename}</p>
                            <p><strong>Asignatura:</strong> {selectedEvent.extendedProps.asignatura}</p>
                            <p><strong>Grado:</strong> {selectedEvent.extendedProps.grado}</p>
                            <p><strong>Departamento:</strong> {selectedEvent.extendedProps.departamento}</p>
                            <p><strong>Universidad:</strong> {selectedEvent.extendedProps.universidad}</p>
                            <p><strong>Condiciones de aprobado:</strong> {selectedEvent.extendedProps.condiciones_aprobado}</p>
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