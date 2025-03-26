import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import iCalendarPlugin from '@fullcalendar/icalendar';
import '../App.css';

function CalendarScreen() {
  const [events, setEvents] = useState([
    { title: 'Evento de prueba', date: '2025-03-27', id: '1' },
  ]);

  const handleDateClick = (arg) => {
    const title = prompt('Ingresa el nombre del evento:');
    if (title) {
      setEvents([...events, { title, date: arg.dateStr, id: Date.now().toString() }]);
    }
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
      <div className="screen-header">
        <h1>Calendario</h1>
        <p>Selecciona una fecha para agregar un evento</p>
      </div>
      <div className="calendar-container">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin, iCalendarPlugin]}
          initialView="dayGridMonth"
          locale="es"
          events={events}
          dateClick={handleDateClick}
          eventColor="#61dafb"
          height="auto"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek',
          }}
        />
        <button onClick={exportToICal} className="export-btn">
          Exportar a iCal
        </button>
      </div>
    </div>
  );
}

export default CalendarScreen;