import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styled, { keyframes } from 'styled-components';
import theme from '../theme';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

// --- Keyframes ---
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { transform: translateY(50px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

// --- Estilos ---
const CalendarContainer = styled.div`
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: ${theme.colors.background.default};
  color: ${theme.colors.text.primary};
  box-sizing: border-box;
  padding-top: 6rem;
  padding-bottom: 2rem;
  animation: ${fadeIn} 0.5s ease-out;

  .fc {
    max-width: 1200px;
    width: 100%;
  }

  .fc .fc-toolbar.fc-header-toolbar {
    margin-bottom: 1.5em;
    background-color: ${theme.colors.background.alt};
    padding: 0.75rem 1rem;
    border-radius: ${theme.borderRadius.md};
    box-shadow: ${theme.shadows.sm};
  }

  .fc .fc-toolbar-title {
    font-size: ${theme.typography.fontSize.xl};
    font-weight: ${theme.typography.fontWeight.semibold};
    color: ${theme.colors.primary.main};
  }

  .fc .fc-button {
    background-color: ${theme.colors.primary.main};
    border: none;
    color: ${theme.colors.primary.contrast};
    padding: 0.5rem 1rem;
    border-radius: ${theme.borderRadius.md};
    transition: ${theme.transitions.default};
    font-size: ${theme.typography.fontSize.sm};
    font-weight: ${theme.typography.fontWeight.medium};
    text-transform: none;
    box-shadow: none;

    &:hover {
      background-color: ${theme.colors.primary.light};
      transform: translateY(-1px);
    }
    &:active {
      background-color: ${theme.colors.primary.dark};
      transform: translateY(0);
    }
    &:focus {
      box-shadow: 0 0 0 2px ${theme.colors.primary.main + '40'};
    }
  }
  .fc .fc-button-primary:disabled {
    background-color: ${theme.colors.neutral.light};
    color: ${theme.colors.text.disabled};
  }

  .fc .fc-daygrid-day {
    background-color: ${theme.colors.background.paper};
    border: 1px solid ${theme.colors.border.light};
    transition: background-color 0.2s ease;
    min-height: 100px;
  }

  .fc .fc-daygrid-day:hover {
    background-color: ${theme.colors.background.alt};
  }

  .fc .fc-day-today {
    background-color: ${theme.colors.primary.main + '15'} !important;
  }

  .fc .fc-event {
    border: none;
    background-color: ${theme.colors.secondary.main};
    color: ${theme.colors.secondary.contrast};
    padding: 0.2rem 0.4rem;
    border-radius: ${theme.borderRadius.sm};
    font-size: ${theme.typography.fontSize.sm};
    cursor: pointer;
    transition: filter 0.2s ease;

    &:hover {
      filter: brightness(1.1);
    }
  }

  .fc-h-event {
    border: 1px solid ${theme.colors.secondary.dark};
  }

  .fc-daygrid-event {
    margin: 1px 2px 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const CalendarHeader = styled.header`
  background: ${theme.colors.gradient.primary};
  width: 100%;
  max-width: 1200px;
  padding: 1.5rem 2rem;
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;

  @media (max-width: ${theme.breakpoints.md}) {
    max-width: 90%;
    padding: 1.25rem 1.5rem;
    flex-direction: column;
    gap: 1rem;
  }
`;

const HeaderTitle = styled.h1`
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.primary.contrast};
  margin: 0;

  @media (max-width: ${theme.breakpoints.md}) {
    font-size: ${theme.typography.fontSize.xl};
  }
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;
  width: 100%;
  max-width: 1200px;
  padding: 0 1rem;
  box-sizing: border-box;

  @media (max-width: ${theme.breakpoints.md}) {
    max-width: 90%;
    margin-top: 1rem;
  }
`;

const StyledButton = styled.button`
  padding: 0.75rem 1.5rem;
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  background-color: ${props => props.bgColor || theme.colors.secondary.main};
  color: ${props => props.color || theme.colors.secondary.contrast};
  border: none;
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  transition: ${theme.transitions.default};
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    filter: brightness(1.1);
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.sm};
  }

  &:active {
    filter: brightness(0.95);
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
    filter: grayscale(50%);
  }

  i {
    font-size: 1rem;
  }
`;

const ExportStatusMessage = styled.p`
  margin-top: 1rem;
  font-size: ${theme.typography.fontSize.sm};
  text-align: center;
  padding: 0.75rem;
  border-radius: ${theme.borderRadius.md};
  width: 100%;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  white-space: pre-wrap;
  border: 1px solid transparent;

  &.success {
    background-color: rgba(76, 175, 80, 0.1);
    color: #388e3c;
    border-color: rgba(76, 175, 80, 0.2);
  }

  &.error {
    background-color: rgba(244, 67, 54, 0.1);
    color: #d32f2f;
    border-color: rgba(244, 67, 54, 0.2);
  }

  &:empty {
    display: none;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${fadeIn} 0.3s ease;
`;

const ModalContent = styled.div`
  background-color: ${theme.colors.background.paper};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.xl};
  width: 90%;
  max-width: 600px;
  padding: 2rem;
  animation: ${slideUp} 0.3s ease-out;
  max-height: 85vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const ModalTitle = styled.h2`
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-bottom: 1px solid ${theme.colors.border.medium};
  padding-bottom: 1rem;

  i {
    color: ${theme.colors.primary.main};
    font-size: 1.5rem;
  }
`;

const ModalDetailsContainer = styled.div`
  flex-grow: 1;
  margin-bottom: 1.5rem;
  font-size: ${theme.typography.fontSize.base};
  line-height: 1.6;

  p {
    margin-bottom: 0.8rem;
    color: ${theme.colors.text.secondary};
  }

  strong {
    font-weight: ${theme.typography.fontWeight.semibold};
    color: ${theme.colors.text.primary};
    margin-right: 0.5rem;
    display: inline-block;
    min-width: 120px;
  }
`;

const CloseButton = styled(StyledButton)`
  background-color: ${theme.colors.neutral.light};
  color: ${theme.colors.text.primary};
  margin-top: auto;
  margin-left: auto;
  display: block;

  &:hover {
    background: ${theme.colors.neutral.lighter};
    filter: none;
  }
`;

const ScheduleSection = styled.section`
  width: 100%;
  max-width: 1200px;
  margin: 2rem 0;
  padding: 1.5rem;
  background-color: ${theme.colors.background.paper};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
  animation: ${slideUp} 0.5s ease-out;

  @media (max-width: ${theme.breakpoints.md}) {
    max-width: 90%;
    padding: 1rem;
  }
`;

const SectionTitle = styled.h2`
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin: 0 0 1rem 0;
  border-bottom: 1px solid ${theme.colors.border.medium};
  padding-bottom: 0.5rem;
`;

const WeeklyScheduleTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: ${theme.typography.fontSize.sm};
  margin-bottom: 2rem;
  background-color: ${theme.colors.background.paper};
  box-shadow: ${theme.shadows.sm};
  border-radius: ${theme.borderRadius.md};

  th, td {
    padding: 0.75rem;
    text-align: center;
    border: 1px solid ${theme.colors.border.light};
    vertical-align: middle;
  }

  th {
    background-color: ${theme.colors.primary.main};
    color: ${theme.colors.primary.contrast};
    font-weight: ${theme.typography.fontWeight.semibold};
    text-transform: uppercase;
  }

  th.time-column {
    background-color: ${theme.colors.background.alt};
    color: ${theme.colors.text.primary};
    width: 100px;
    text-align: right;
    padding-right: 1rem;
  }

  td {
    background-color: ${theme.colors.background.paper};
    color: ${theme.colors.text.secondary};
    min-height: 60px;
    transition: background-color 0.2s ease;
  }

  td.filled {
    background-color: ${theme.colors.secondary.main + '20'};
    color: ${theme.colors.text.primary};
    cursor: pointer;
    &:hover {
      background-color: ${theme.colors.secondary.main + '40'};
    }
  }

  @media (max-width: ${theme.breakpoints.md}) {
    font-size: ${theme.typography.fontSize.xs};
    th, td {
      padding: 0.5rem;
    }
    th.time-column {
      width: 80px;
    }
  }

  @media (max-width: ${theme.breakpoints.sm}) {
    th:not(.time-column), td:not(:first-child) {
      display: none;
    }
    th.time-column, td:first-child {
      width: 100%;
      text-align: center;
      padding: 0.5rem;
    }
  }
`;

const ScheduleEvent = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  line-height: 1.4;
  padding: 0.25rem;
  border-radius: ${theme.borderRadius.sm};
  background-color: ${theme.colors.secondary.main + '80'};
  color: ${theme.colors.secondary.contrast};
`;

const ProfessorList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ProfessorItem = styled.li`
  display: flex;
  flex-direction: column;
  padding: 1rem;
  background-color: ${theme.colors.background.alt};
  border-radius: ${theme.borderRadius.md};
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.sm};
  }
`;

const ProfessorName = styled.p`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin: 0 0 0.5rem 0;
`;

const ProfessorDetail = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  margin: 0.25rem 0;

  strong {
    color: ${theme.colors.text.primary};
    margin-right: 0.5rem;
  }

  a {
    color: ${theme.colors.primary.main};
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: ${theme.colors.primary.light};
      text-decoration: underline;
    }
  }
`;

// --- Funciones Auxiliares para iCal ---
function formatICalDate(dateString) {
  if (!dateString || typeof dateString !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    console.warn(`Fecha inválida para iCal: ${dateString}`);
    return '';
  }
  return dateString.replace(/-/g, '');
}

function getICalTimestamp() {
  const now = new Date();
  return (
    now.getUTCFullYear() +
    String(now.getUTCMonth() + 1).padStart(2, '0') +
    String(now.getUTCDate()).padStart(2, '0') +
    'T' +
    String(now.getUTCHours()).padStart(2, '0') +
    String(now.getUTCMinutes()).padStart(2, '0') +
    String(now.getUTCSeconds()).padStart(2, '0') +
    'Z'
  );
}

function foldLine(line) {
  const maxLen = 75;
  let result = '';
  while (line.length > maxLen) {
    let breakPoint = maxLen;
    result += line.substring(0, breakPoint) + '\r\n ';
    line = line.substring(breakPoint);
  }
  result += line;
  return result;
}

function escapeICalText(text = '') {
  if (typeof text !== 'string') return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

// --- Helper getNextDay ---
function getNextDay(dateString) {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (e) {
    console.error('Error calculating next day for:', dateString, e);
    return null;
  }
}

// --- Componente Principal ---
function StyledCalendarScreen() {
  const { isAuthenticated } = useAuth();
  const isGoogleLinked = true; // ¡SIMULACIÓN! Reemplaza con useAuth()
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [asignaturaNombre, setAsignaturaNombre] = useState(''); // Nuevo estado para asignatura
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExportingGoogle, setIsExportingGoogle] = useState(false);
  const [exportGoogleStatus, setExportGoogleStatus] = useState('');

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
  const exportApiUrl = `${backendUrl}/api/ai/export-google-calendar/`;
  const calendarDataUrl = `${backendUrl}/api/ai/calendar/data/`;

  // --- Helper para generar franjas horarias ---
  const generateTimeSlots = () => {
    // Extraer horas únicas de schedules y ordenarlas
    const uniqueHours = [...new Set(schedules.map((s) => s.hora))].sort((a, b) => {
      const [startA] = a.split('-').map(time => time.replace(':', ''));
      const [startB] = b.split('-').map(time => time.replace(':', ''));
      return parseInt(startA) - parseInt(startB);
    });
    return uniqueHours.length > 0 ? uniqueHours : ['10:40-12:30', '12:40-14:30', '15:30-17:20', '17:40-19:30'];
  };

  // --- Fetch de Datos del Calendario ---
  const fetchCalendarData = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.error('No access token found');
        navigate('/login');
        return { data: [], schedules: [], professors: [] };
      }
      const response = await fetch(calendarDataUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          console.error('Token might be expired or invalid.');
          navigate('/login');
        }
        const errorResult = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }));
        console.error('Error fetching calendar data:', errorResult.message || `Status ${response.status}`);
        return { data: [], schedules: [], professors: [] };
      }
      const result = await response.json();
      console.log('Datos recibidos:', result);
      return {
        data: result.data || [],
        schedules: result.data.flatMap(item => item.horarios || []),
        professors: result.data.flatMap(item => item.profesores || []),
      };
    } catch (error) {
      console.error('Network or other error fetching calendar data:', error);
      return { data: [], schedules: [], professors: [] };
    }
  }, [navigate, calendarDataUrl]);

  // --- Carga de Eventos, Horarios y Profesores ---
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const loadData = async () => {
      const { data, schedules, professors } = await fetchCalendarData();
      
      // Procesar eventos
      if (Array.isArray(data)) {
        console.log('Procesando datos para eventos:', data);
        const calendarEvents = data.flatMap(item => {
          if (!item || !Array.isArray(item.fechas)) {
            console.warn('Item inválido o sin fechas:', item);
            return [];
          }
          // Guardar el nombre de la asignatura
          setAsignaturaNombre(item.asignatura?.nombre || 'N/A');
          return item.fechas.map(event => {
            if (!event.fecha) {
              console.warn('Evento sin fecha:', event, 'en item:', item);
              return null;
            }
            return {
              id: `${item.file_id || 'no-file'}-${event.id || Math.random()}`,
              title: event.descripcion || event.titulo || 'Evento sin título',
              date: event.fecha,
              end: getNextDay(event.fecha),
              extendedProps: {
                filename: item.filename || 'Desconocido',
                asignatura: item.asignatura?.nombre || 'N/A',
                grado: item.asignatura?.grado || 'N/A',
                departamento: item.asignatura?.departamento || 'N/A',
                universidad: item.asignatura?.universidad || 'N/A',
                condiciones_aprobado: item.asignatura?.condiciones_aprobado || 'N/A',
                description: `Archivo: ${item.filename || 'Desconocido'}\nAsignatura: ${item.asignatura?.nombre || 'N/A'}`,
              },
            };
          }).filter(event => event !== null);
        });
        console.log('Eventos transformados:', calendarEvents);
        setEvents(calendarEvents);
      } else {
        console.error('fetchCalendarData no devolvió un array:', data);
        setEvents([]);
      }

      // Procesar horarios
      setSchedules(schedules);

      // Procesar profesores
      setProfessors(professors.map(prof => ({
        ...prof,
        asignatura: asignaturaNombre || 'Complementos de Bases de Datos', // Asignar asignatura desde estado o fallback
      })));
    };

    loadData();
  }, [isAuthenticated, navigate, fetchCalendarData, asignaturaNombre]);

  // --- Manejador de Clic en Evento ---
  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event);
    setIsModalOpen(true);
  };

  // --- Lógica iCal ---
  const generateICSContent = (calendarEvents) => {
    const timestamp = getICalTimestamp();
    const prodId = '-//StudySift//Eventos Exportados//ES';

    let icsString = [
      'BEGIN:VCALENDAR',
      `PRODID:${prodId}`,
      'VERSION:2.0',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ];

    calendarEvents.forEach(event => {
      const startDate = formatICalDate(event.date);
      const endDate = formatICalDate(event.end);
      const uid = `${event.id}@StudySift.com`;
      const description = event.extendedProps?.description || '';
      const location = event.extendedProps?.lugar === 'N/A' ? '' : event.extendedProps?.lugar || '';

      if (startDate && endDate) {
        icsString.push('BEGIN:VEVENT');
        icsString.push(foldLine(`UID:${uid}`));
        icsString.push(foldLine(`DTSTAMP:${timestamp}`));
        icsString.push(foldLine(`DTSTART;VALUE=DATE:${startDate}`));
        icsString.push(foldLine(`DTEND;VALUE=DATE:${endDate}`));
        icsString.push(foldLine(`SUMMARY:${escapeICalText(event.title)}`));
        if (description) {
          icsString.push(foldLine(`DESCRIPTION:${escapeICalText(description)}`));
        }
        if (location) {
          icsString.push(foldLine(`LOCATION:${escapeICalText(location)}`));
        }
        icsString.push('END:VEVENT');
      } else {
        console.warn(`Evento omitido por fecha inválida: ${event.title} (ID: ${event.id})`);
      }
    });

    icsString.push('END:VCALENDAR');
    return icsString.join('\r\n');
  };

  const exportToICal = () => {
    if (!events || events.length === 0) {
      alert('No hay eventos para exportar.');
      return;
    }

    try {
      const icsContent = generateICSContent(events);
      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'calendario_eventos.ics');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al generar el archivo iCal:', error);
      alert('Hubo un error al generar el archivo iCal. Revisa la consola para más detalles.');
    }
  };

  // --- Exportar a Google Calendar ---
  const handleExportToGoogle = async () => {
    if (!events || events.length === 0) {
      setExportGoogleStatus('No hay eventos para exportar.');
      return;
    }
    if (!isGoogleLinked) {
      setExportGoogleStatus('Necesitas vincular tu cuenta de Google primero.');
      return;
    }
  
    setIsExportingGoogle(true);
    setExportGoogleStatus('Exportando eventos a Google Calendar...');
    let currentStatus = ['Exportando eventos a Google Calendar...'];
  
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setExportGoogleStatus('Error de autenticación. Intenta iniciar sesión de nuevo.');
      setIsExportingGoogle(false);
      navigate('/login');
      return;
    }
  
    let successCount = 0;
    let errorCount = 0;
  
    for (const event of events) {
      const eventData = {
        event_id: event.id, // Send unique event ID
        summary: event.title,
        start_date: event.date,
        end_date: event.end,
        description: event.extendedProps?.description || '',
        location: event.extendedProps?.lugar || '',
      };
  
      try {
        currentStatus.push(`Intentando exportar: "${event.title}"...`);
        setExportGoogleStatus(currentStatus.join('\n'));
  
        const response = await fetch(exportApiUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventData),
        });
  
        if (response.ok) {
          successCount++;
          const result = await response.json();
          currentStatus.pop();
          currentStatus.push(`✅ Éxito: "${event.title}" ${result.message.includes('actualizado') ? 'actualizado' : 'exportado'}.`);
          console.log('Exportación exitosa para:', event.title, result);
        } else {
          errorCount++;
          const errData = await response.json().catch(() => ({ message: `Error ${response.status}` }));
          const reason = errData.message || errData.detail || errData.error || `Error ${response.status}`;
          currentStatus.pop();
          currentStatus.push(`❌ Error al exportar "${event.title}": ${reason}`);
          console.error('Error en exportación para:', event.title, errData);
        }
      } catch (error) {
        errorCount++;
        currentStatus.pop();
        currentStatus.push(`❌ Error de red al exportar "${event.title}": ${error.message}`);
        console.error('Error de red exportando:', event.title, error);
      }
      setExportGoogleStatus(currentStatus.join('\n'));
    }
  
    if (errorCount > 0) {
      currentStatus.push(`\nExportación completada. Éxitos: ${successCount}, Errores: ${errorCount}`);
    } else {
      currentStatus.push(`\nExportación completada`);
    }
    setExportGoogleStatus(currentStatus.join('\n'));
    setIsExportingGoogle(false);
  
    setTimeout(() => setExportGoogleStatus(''), 10000);
  };

  // --- Renderizado ---
  if (!isAuthenticated) {
    return <div>Redirigiendo al login...</div>;
  }

  return (
    <CalendarContainer>
      <CalendarHeader>
        <HeaderTitle>Calendario</HeaderTitle>
      </CalendarHeader>

      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale="es"
        events={events}
        eventClick={handleEventClick}
        height="auto"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek',
        }}
        buttonText={{
          today: 'Hoy',
          month: 'Mes',
          week: 'Semana',
          day: 'Día',
          list: 'Lista',
        }}
        dayMaxEvents={true}
        eventDidMount={(info) => {
          info.el.title = `${info.event.title}\nAsignatura: ${info.event.extendedProps.asignatura || 'N/A'}`;
        }}
      />
      <ActionButtonsContainer>
        <StyledButton
          onClick={exportToICal}
          disabled={events.length === 0}
          bgColor={theme.colors.accent.info}
          color="white"
        >
          <i className="fas fa-file-download"></i> Exportar a iCal
        </StyledButton>

        {isGoogleLinked ? (
          <StyledButton
            onClick={handleExportToGoogle}
            disabled={isExportingGoogle || events.length === 0}
            bgColor="#DB4437"
            color="white"
          >
            {isExportingGoogle ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Exportando...
              </>
            ) : (
              <>
                <i className="fab fa-google"></i> Exportar a Google
              </>
            )}
          </StyledButton>
        ) : (
          <p style={{ color: theme.colors.text.secondary, alignSelf: 'center' }}>
            Vincula tu cuenta de Google para exportar.
          </p>
        )}
      </ActionButtonsContainer>

      <ExportStatusMessage className={exportGoogleStatus.includes('Errores:') ? 'error' : exportGoogleStatus ? 'success' : ''}>
        {exportGoogleStatus}
      </ExportStatusMessage>

      {/* Sección de Horarios y Profesores */}
      <ScheduleSection>
        <SectionTitle>Horarios y Profesores</SectionTitle>

        {/* Tabla de Horarios Semanal */}
        {schedules.length > 0 ? (
          <>
            <h3 style={{ fontSize: theme.typography.fontSize.lg, margin: '1rem 0 0.5rem', color: theme.colors.text.primary }}>
              Horario Semanal
            </h3>
            <WeeklyScheduleTable>
              <thead>
                <tr>
                  <th className="time-column">Hora</th>
                  <th>Lunes</th>
                  <th>Martes</th>
                  <th>Miércoles</th>
                  <th>Jueves</th>
                  <th>Viernes</th>
                  {/* Descomenta si necesitas Sábado/Domingo */}
                  {/* <th>Sábado</th>
                  <th>Domingo</th> */}
                </tr>
              </thead>
              <tbody>
                {generateTimeSlots().map((timeSlot, index) => (
                  <tr key={`time-slot-${index}`}>
                    <td className="time-column">{timeSlot}</td>
                    {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes' /*, 'Sábado', 'Domingo' */].map((day) => {
                      const schedule = schedules.find(
                        (s) => s.dia === day && s.hora === timeSlot
                      );
                      return (
                        <td key={`${day}-${timeSlot}`} className={schedule ? 'filled' : ''}>
                          {schedule && (
                            <ScheduleEvent>
                              <strong>{asignaturaNombre || 'Complementos de Bases de Datos'}</strong>
                              <br />
                              {schedule.grupo} ({schedule.tipo})
                              <br />
                              Aula: {schedule.aula}
                            </ScheduleEvent>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </WeeklyScheduleTable>
          </>
        ) : (
          <p style={{ color: theme.colors.text.secondary, fontStyle: 'italic' }}>
            No hay horarios disponibles.
          </p>
        )}

        {/* Lista de Profesores */}
        {professors.length > 0 ? (
          <>
            <h3 style={{ fontSize: theme.typography.fontSize.lg, margin: '1.5rem 0 0.5rem', color: theme.colors.text.primary }}>
              Profesores
            </h3>
            <ProfessorList>
              {professors.map((professor, index) => (
                <ProfessorItem key={`professor-${index}`}>
                  <ProfessorName>{professor.nombre}</ProfessorName>
                  <ProfessorDetail>
                    <strong>Asignatura:</strong> {professor.asignatura || 'No especificada'}
                  </ProfessorDetail>
                  <ProfessorDetail>
                    <strong>Despacho:</strong> {professor.despacho || 'No especificado'}
                  </ProfessorDetail>
                  {professor.enlace && (
                    <ProfessorDetail>
                      <strong>Enlace:</strong>{' '}
                      <a href={professor.enlace} target="_blank" rel="noopener noreferrer">
                        Perfil
                      </a>
                    </ProfessorDetail>
                  )}
                </ProfessorItem>
              ))}
            </ProfessorList>
          </>
        ) : (
          <p style={{ color: theme.colors.text.secondary, fontStyle: 'italic', marginTop: '1rem' }}>
            No hay información de profesores disponible.
          </p>
        )}
      </ScheduleSection>

      {isModalOpen && selectedEvent && (
        <ModalOverlay onClick={() => setIsModalOpen(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Detalles del Evento</ModalTitle>
            <ModalDetailsContainer>
              <p><strong>Título:</strong> {selectedEvent.title || 'No especificado'}</p>
              {selectedEvent.extendedProps.tipo && <p><strong>Tipo:</strong> {selectedEvent.extendedProps.tipo}</p>}
              {selectedEvent.extendedProps.lugar && <p><strong>Lugar:</strong> {selectedEvent.extendedProps.lugar}</p>}
              <p>
                <strong>Fecha:</strong>{' '}
                {selectedEvent.start
                  ? new Date(selectedEvent.startStr).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'No especificado'}
              </p>
              <hr style={{ border: 'none', borderTop: `1px solid ${theme.colors.border.light}`, margin: '1rem 0' }} />
              <p><strong>Archivo Origen:</strong> {selectedEvent.extendedProps.filename || 'No especificado'}</p>
              <p><strong>Asignatura:</strong> {selectedEvent.extendedProps.asignatura || 'No especificado'}</p>
              {selectedEvent.extendedProps.grado && <p><strong>Grado:</strong> {selectedEvent.extendedProps.grado}</p>}
              {selectedEvent.extendedProps.departamento && (
                <p><strong>Departamento:</strong> {selectedEvent.extendedProps.departamento}</p>
              )}
              {selectedEvent.extendedProps.universidad && (
                <p><strong>Universidad:</strong> {selectedEvent.extendedProps.universidad}</p>
              )}
              {selectedEvent.extendedProps.condiciones_aprobado && (
                <p><strong>Cond. Aprobado:</strong> {selectedEvent.extendedProps.condiciones_aprobado}</p>
              )}
            </ModalDetailsContainer>
            <CloseButton onClick={() => setIsModalOpen(false)}>Cerrar</CloseButton>
          </ModalContent>
        </ModalOverlay>
      )}
    </CalendarContainer>
  );
}

export default StyledCalendarScreen;