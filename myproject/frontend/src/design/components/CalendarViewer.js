import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Asegúrate que la ruta es correcta
import styled, { keyframes } from 'styled-components'; // Importa keyframes si es necesario
import theme from '../theme'; // Asegúrate que la ruta y el theme son correctos

// Importaciones de FullCalendar
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
// iCalendarPlugin no se usa directamente para renderizar, sino para lógica de exportación si la tuvieras.
// Lo quitamos de los plugins de FullCalendar si no lo necesitas para la visualización.

// --- Keyframes (si no están en tu theme) ---
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { transform: translateY(50px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

// --- Estilos (Copiados de CalendarViewer y adaptados) ---
const CalendarContainer = styled.div`
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: ${theme.colors.background.default};
  color: ${theme.colors.text.primary};
  box-sizing: border-box;
  padding-top: 6rem; /* Espacio para navbar fijo */
  padding-bottom: 2rem;
  animation: ${fadeIn} 0.5s ease-out; /* Usa tu animación o fadeIn */

  /* Estilos específicos para FullCalendar dentro de este contenedor */
  .fc { /* Estilo global para el contenedor de FullCalendar */
    max-width: 1200px; /* Asegura que no se extienda demasiado */
    width: 100%;
  }

  .fc .fc-toolbar.fc-header-toolbar {
    margin-bottom: 1.5em;
    background-color: ${theme.colors.background.alt}; /* Fondo ligero para la barra */
    padding: 0.75rem 1rem;
    border-radius: ${theme.borderRadius.md};
    box-shadow: ${theme.shadows.sm};
  }

  .fc .fc-toolbar-title {
    font-size: ${theme.typography.fontSize.xl};
    font-weight: ${theme.typography.fontWeight.semibold};
    color: ${theme.colors.primary.main}; /* Color del título */
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
    text-transform: none; /* Quita mayúsculas por defecto */
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
        box-shadow: 0 0 0 2px ${theme.colors.primary.main + '40'}; /* Outline en focus */
    }
  }
   .fc .fc-button-primary:disabled {
      background-color: ${theme.colors.neutral.light};
      color: ${theme.colors.text.disabled};
   }

  .fc .fc-daygrid-day { /* Estilo de celda de día */
    background-color: ${theme.colors.background.paper};
    border: 1px solid ${theme.colors.border.light};
    transition: background-color 0.2s ease;
    min-height: 100px; /* Ajusta altura mínima */
  }

  .fc .fc-daygrid-day:hover {
      background-color: ${theme.colors.background.alt};
  }

  .fc .fc-day-today { /* Estilo del día actual */
    background-color: ${theme.colors.primary.main + '15'} !important; /* Ligero fondo */
    /* border-top: 3px solid ${theme.colors.primary.main}; */
  }

  .fc .fc-event { /* Estilo base de evento */
    border: none;
    background-color: ${theme.colors.secondary.main}; /* Color base de evento */
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

  .fc-h-event { /* Para eventos horizontales */
      border: 1px solid ${theme.colors.secondary.dark}; /* Borde sutil */
  }

  .fc-daygrid-event {
      margin: 1px 2px 0; /* Ajusta márgenes */
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
  }

  /* Puedes añadir más estilos específicos de FullCalendar aquí si es necesario */
`;

const CalendarHeader = styled.header`
  background: ${theme.colors.gradient.primary};
  width: 100%;
  max-width: 1200px; /* Coincide con FullCalendar max-width */
  padding: 1.5rem 2rem;
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
  display: flex;
  justify-content: space-between; /* Deja espacio para botones si los pones aquí */
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

// Contenedor para los botones de exportación (modificado)
const ActionButtonsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem; /* Espacio sobre los botones */
  justify-content: center; /* Centra los botones */
  flex-wrap: wrap; /* Permite que los botones pasen a la siguiente línea en pantallas pequeñas */
  width: 100%;
  max-width: 1200px; /* Coincide con el ancho del calendario */
  padding: 0 1rem; /* Padding lateral */
  box-sizing: border-box;

  @media (max-width: ${theme.breakpoints.md}) {
      max-width: 90%;
      margin-top: 1rem;
  }
`;

// Botón genérico estilizado para acciones
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

  i { /* Estilo para iconos dentro del botón */
      font-size: 1rem;
  }
`;

// Estilo para el mensaje de estado de exportación
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
  white-space: pre-wrap; /* Para respetar saltos de línea */
  border: 1px solid transparent;

  &.success {
    background-color: rgba(76, 175, 80, 0.1);
    color: #388e3c; /* Verde más oscuro */
    border-color: rgba(76, 175, 80, 0.2);
  }

  &.error {
    background-color: rgba(244, 67, 54, 0.1);
    color: #d32f2f; /* Rojo más oscuro */
    border-color: rgba(244, 67, 54, 0.2);
  }

  &:empty {
      display: none;
  }
`;


// --- Estilos del Modal (Copiados de CalendarViewer) ---
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6); /* Ligeramente más oscuro */
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
  max-width: 600px; /* Un poco más ancho para detalles */
  padding: 2rem;
  animation: ${slideUp} 0.3s ease-out;
  max-height: 85vh; /* Límite de altura */
  overflow-y: auto; /* Scroll si el contenido es largo */
  display: flex;
  flex-direction: column;
`;

const ModalTitle = styled.h2`
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin: 0 0 1.5rem 0; /* Ajuste de margen */
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-bottom: 1px solid ${theme.colors.border.medium}; /* Línea separadora */
  padding-bottom: 1rem;

  i { /* Estilo del icono del título */
      color: ${theme.colors.primary.main};
      font-size: 1.5rem;
  }
`;

// Contenedor específico para los detalles en el modal
const ModalDetailsContainer = styled.div`
  flex-grow: 1; /* Ocupa el espacio disponible */
  margin-bottom: 1.5rem;
  font-size: ${theme.typography.fontSize.base}; /* Tamaño base para detalles */
  line-height: 1.6;

  p {
    margin-bottom: 0.8rem;
    color: ${theme.colors.text.secondary};
  }

  strong {
    font-weight: ${theme.typography.fontWeight.semibold};
    color: ${theme.colors.text.primary};
    margin-right: 0.5rem;
    display: inline-block; /* Mejor alineación */
    min-width: 120px; /* Ancho mínimo para etiquetas */
  }
`;

const CloseButton = styled(StyledButton)` /* Reutiliza StyledButton */
  background-color: ${theme.colors.neutral.light};
  color: ${theme.colors.text.primary};
  margin-top: auto; /* Empuja el botón hacia abajo */
  margin-left: auto; /* Alinea a la derecha */
  display: block;

  &:hover {
    background: ${theme.colors.neutral.lighter};
    filter: none; /* Sobrescribe filtro si no lo quieres */
  }
`;
// --- Fin Estilos ---



// --- Funciones Auxiliares para iCal ---

// Formatea 'YYYY-MM-DD' a 'YYYYMMDD'
function formatICalDate(dateString) {
    if (!dateString || typeof dateString !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        console.warn(`Fecha inválida para iCal: ${dateString}`);
        return ''; // Devuelve vacío si la fecha no es válida
    }
    return dateString.replace(/-/g, '');
}

// Obtiene el timestamp actual en formato UTC para iCal
function getICalTimestamp() {
    const now = new Date();
    return now.getUTCFullYear() +
           String(now.getUTCMonth() + 1).padStart(2, '0') +
           String(now.getUTCDate()).padStart(2, '0') + 'T' +
           String(now.getUTCHours()).padStart(2, '0') +
           String(now.getUTCMinutes()).padStart(2, '0') +
           String(now.getUTCSeconds()).padStart(2, '0') + 'Z';
}

// Pliega líneas largas según RFC 5545 (aproximado, usa 75 bytes)
function foldLine(line) {
    const maxLen = 75;
    let result = '';
    while (line.length > maxLen) {
        // Busca un buen punto de corte (espacio, coma) cerca del límite, si no, corta a maxLen
        let breakPoint = maxLen;
        // Simple corte a 75 por simplicidad aquí, podrías buscar espacios antes.
        result += line.substring(0, breakPoint) + '\r\n '; // CRLF + espacio
        line = line.substring(breakPoint);
    }
    result += line;
    return result;
}

// Escapa caracteres especiales para iCal
function escapeICalText(text = '') {
    if (typeof text !== 'string') return '';
    return text.replace(/\\/g, '\\\\') // Escapar barras invertidas
               .replace(/;/g, '\\;')   // Escapar punto y coma
               .replace(/,/g, '\\,')   // Escapar comas
               .replace(/\n/g, '\\n');  // Escapar saltos de línea
}

// --- Fin Funciones Auxiliares iCal ---


// --- Helper getNextDay (sin cambios) ---
function getNextDay(dateString) {
    // ... (mismo código que antes)
     if (!dateString) return null;
    try {
        const date = new Date(dateString);
        date.setDate(date.getDate() + 1);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch (e) {
        console.error("Error calculating next day for:", dateString, e);
        return null;
    }
}
// ---------------------------------------------------------------------------------------

function StyledCalendarScreen() {
    // --- Estado y Hooks (de CalendarScreen) ---
    const { isAuthenticated } = useAuth();
    // --- !!! DESCOMENTA y obtén isGoogleLinked de useAuth() cuando lo implementes !!! ---
    const isGoogleLinked = true; // <- ¡¡¡ SIMULACIÓN !!! Reemplaza con el valor real del contexto

    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [isExportingGoogle, setIsExportingGoogle] = useState(false);
    const [exportGoogleStatus, setExportGoogleStatus] = useState('');

    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
    const exportApiUrl = `${backendUrl}/api/ai/export-google-calendar/`;
    const calendarDataUrl = `${backendUrl}/api/ai/calendar/data/`;
    // -------------------------------------------------------------

    // --- Fetch de Datos del Calendario (de CalendarScreen) ---
    const fetchCalendarData = useCallback(async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                console.error("No access token found");
                navigate('/login');
                return [];
            }
            const response = await fetch(calendarDataUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                if (response.status === 401) {
                    console.error('Token might be expired or invalid.');
                    navigate('/login');
                }
                const errorResult = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }));
                console.error('Error fetching calendar data:', errorResult.message || `Status ${response.status}`);
                return []; // Devuelve array vacío en caso de error
            }
            const result = await response.json();
            console.log("Datos recibidos:", result); // Log para ver qué llega
            return result.data || [];
        } catch (error) {
            console.error('Network or other error fetching calendar data:', error);
            return []; // Devuelve array vacío en caso de error
        }
    }, [navigate, calendarDataUrl]);
    // -------------------------------------------------------------

    // --- Carga de Eventos (de CalendarScreen, con adaptaciones) ---
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        const loadEvents = async () => {
            const calendarData = await fetchCalendarData();
            if (Array.isArray(calendarData)) { // Verifica que sea un array
                 console.log("Procesando datos para eventos:", calendarData);
                 const calendarEvents = calendarData.flatMap(item => {
                     // Verifica que item y item.fechas existan y sean arrays
                     if (!item || !Array.isArray(item.fechas)) {
                         console.warn("Item inválido o sin fechas:", item);
                         return []; // Salta este item si no tiene la estructura esperada
                     }
                     return item.fechas.map(event => {
                        // Verifica que la fecha exista
                         if (!event.fecha) {
                             console.warn("Evento sin fecha:", event, "en item:", item);
                             return null; // O maneja como prefieras un evento sin fecha
                         }
                         return {
                             // ID más único combinando info relevante
                             id: `${item.file_id || 'no-file'}-${event.id || Math.random()}`,
                             title: event.descripcion || event.titulo || 'Evento sin título', // Usa descripción o título
                             date: event.fecha, // Formato YYYY-MM-DD
                             // Para Google Calendar, los eventos de día completo usan 'end' exclusivo
                             end: getNextDay(event.fecha),
                             // Guardamos datos adicionales para el modal
                             extendedProps: {
                                 filename: item.filename || 'Desconocido',
                                 asignatura: item.asignatura?.nombre || 'N/A',
                                 grado: item.asignatura?.grado || 'N/A',
                                 departamento: item.asignatura?.departamento || 'N/A',
                                 universidad: item.asignatura?.universidad || 'N/A',
                                 condiciones_aprobado: item.asignatura?.condiciones_aprobado || 'N/A',
                                 description: `Archivo: ${item.filename || 'Desconocido'}\nAsignatura: ${item.asignatura?.nombre || 'N/A'}`,
                             }
                         };
                     }).filter(event => event !== null); // Filtra eventos nulos (sin fecha)
                 });
                 console.log("Eventos transformados:", calendarEvents);
                 setEvents(calendarEvents);
            } else {
                console.error("fetchCalendarData no devolvió un array:", calendarData);
                setEvents([]); // Asegura que events sea un array vacío
            }
        };

        loadEvents();
    }, [isAuthenticated, navigate, fetchCalendarData]);
    // -----------------------------------------

    // --- Manejador de Clic en Evento (de CalendarScreen) ---
    const handleEventClick = (clickInfo) => {
        setSelectedEvent(clickInfo.event);
        setIsModalOpen(true);
    };
    // ------------------------------------

    // --- *** NUEVA LÓGICA iCal *** ---
    const generateICSContent = (calendarEvents) => {
      const timestamp = getICalTimestamp();
      const prodId = '-//MiAppCalendario//Eventos Exportados//ES'; // Identificador de tu app

      let icsString = [
          'BEGIN:VCALENDAR',
          `PRODID:${prodId}`,
          'VERSION:2.0',
          'CALSCALE:GREGORIAN',
          'METHOD:PUBLISH' // Método estándar para archivos .ics
      ];

      calendarEvents.forEach(event => {
          const startDate = formatICalDate(event.date);
          const endDate = formatICalDate(event.end); // event.end ya es el día siguiente
          const uid = `${event.id}@mi-app.com`; // Asegúrate que sea único, usa tu dominio
          const description = event.extendedProps?.description || '';
          const location = event.extendedProps?.lugar === 'N/A' ? '' : event.extendedProps?.lugar || '';

          // Solo añadir evento si las fechas son válidas
          if (startDate && endDate) {
              icsString.push('BEGIN:VEVENT');
              icsString.push(foldLine(`UID:${uid}`));
              icsString.push(foldLine(`DTSTAMP:${timestamp}`));
              icsString.push(foldLine(`DTSTART;VALUE=DATE:${startDate}`));
              icsString.push(foldLine(`DTEND;VALUE=DATE:${endDate}`)); // Fecha fin exclusiva
              icsString.push(foldLine(`SUMMARY:${escapeICalText(event.title)}`));
              if (description) {
                  icsString.push(foldLine(`DESCRIPTION:${escapeICalText(description)}`));
              }
              if (location) {
                  icsString.push(foldLine(`LOCATION:${escapeICalText(location)}`));
              }
              // Podrías añadir más campos como ORGANIZER, ATTENDEE, etc. si tuvieras esa info
              icsString.push('END:VEVENT');
          } else {
              console.warn(`Evento omitido por fecha inválida: ${event.title} (ID: ${event.id})`);
          }
      });

      icsString.push('END:VCALENDAR');

      // Unir con saltos de línea CRLF
      return icsString.join('\r\n');
  };

  const exportToICal = () => {
      if (!events || events.length === 0) {
          // Puedes usar un estado para mostrar mensajes en vez de alert
          alert("No hay eventos para exportar.");
          return;
      }

      try {
          const icsContent = generateICSContent(events);
          const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
          const url = window.URL.createObjectURL(blob);

          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', 'calendario_eventos.ics'); // Nombre del archivo

          // Añadir al DOM, hacer clic y remover (necesario para Firefox)
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          window.URL.revokeObjectURL(url); // Liberar memoria

      } catch (error) {
          console.error("Error al generar el archivo iCal:", error);
          alert("Hubo un error al generar el archivo iCal. Revisa la consola para más detalles.");
      }
  };

    // --- Exportar a Google Calendar (de CalendarScreen) ---
    const handleExportToGoogle = async () => {
        if (!events || events.length === 0) {
            setExportGoogleStatus('No hay eventos para exportar.');
            return;
        }
        if (!isGoogleLinked) {
            setExportGoogleStatus('Necesitas vincular tu cuenta de Google primero.');
            // Considera añadir un botón/link para ir a vincular la cuenta
            return;
        }

        setIsExportingGoogle(true);
        setExportGoogleStatus('Exportando eventos a Google Calendar...');
        let currentStatus = ['Exportando eventos a Google Calendar...']; // Array para mensajes detallados

        const token = localStorage.getItem('accessToken');
        if (!token) {
             setExportGoogleStatus('Error de autenticación. Intenta iniciar sesión de nuevo.');
             setIsExportingGoogle(false);
             navigate('/login');
             return;
        }

        let successCount = 0;
        let errorCount = 0;

        // Exportar eventos uno por uno para mejor feedback (o usar Promise.allSettled para paralelo)
        for (const event of events) {
             // Preparamos los datos para la API de Django
             const eventData = {
                 summary: event.title,
                 start_date: event.date, // Formato YYYY-MM-DD
                 end_date: event.end,     // Formato YYYY-MM-DD (día siguiente)
                 description: event.extendedProps?.description || '',
                 // Puedes añadir más campos si tu backend los soporta (ej: location)
                 location: event.extendedProps?.lugar || ''
             };

             try {
                 currentStatus.push(`Intentando exportar: "${event.title}"...`);
                 setExportGoogleStatus(currentStatus.join('\n')); // Actualiza estado intermedio

                 const response = await fetch(exportApiUrl, {
                     method: 'POST',
                     headers: {
                         'Authorization': `Bearer ${token}`,
                         'Content-Type': 'application/json',
                     },
                     body: JSON.stringify(eventData),
                 });

                 if (response.ok) {
                     successCount++;
                     const result = await response.json(); // Opcional: ver respuesta del backend
                     currentStatus.pop(); // Quita el mensaje "Intentando..."
                     currentStatus.push(`✅ Éxito: "${event.title}" exportado.`);
                     console.log("Exportación exitosa para:", event.title, result);
                 } else {
                     errorCount++;
                     const errData = await response.json().catch(() => ({ message: `Error ${response.status}` }));
                     const reason = errData.message || errData.detail || errData.error || `Error ${response.status}`;
                     currentStatus.pop(); // Quita el mensaje "Intentando..."
                     currentStatus.push(`❌ Error al exportar "${event.title}": ${reason}`);
                     console.error("Error en exportación para:", event.title, errData);
                 }
             } catch (error) {
                 errorCount++;
                 currentStatus.pop(); // Quita el mensaje "Intentando..."
                 currentStatus.push(`❌ Error de red al exportar "${event.title}": ${error.message}`);
                 console.error("Error de red exportando:", event.title, error);
             }
              setExportGoogleStatus(currentStatus.join('\n')); // Actualiza después de cada intento
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
    // --- ************************************************ ---

    // --- Renderizado del Componente ---
    if (!isAuthenticated) {
        // Opcional: Mostrar un spinner o mensaje mientras redirige
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
                    right: 'dayGridMonth,dayGridWeek' 
                }}
                buttonText={{ 
                    today:    'Hoy',
                    month:    'Mes',
                    week:     'Semana',
                    day:      'Día',
                    list:     'Lista'
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
                    // Mensaje o botón para vincular si no está vinculado
                    // <StyledButton disabled>Vincular Google para Exportar</StyledButton>
                    // O un simple párrafo
                     <p style={{ color: theme.colors.text.secondary, alignSelf: 'center' }}>
                         Vincula tu cuenta de Google para exportar.
                         {/* <Link to="/perfil">Vincular</Link> */}
                     </p>
                 )}
            </ActionButtonsContainer>

             {/* Mensaje de Estado de Exportación Google */}
             <ExportStatusMessage className={exportGoogleStatus.includes('Errores:') ? 'error' : (exportGoogleStatus ? 'success' : '')}>
                 {exportGoogleStatus}
             </ExportStatusMessage>

            {/* Modal para detalles del evento */}
            {isModalOpen && selectedEvent && (
                <ModalOverlay onClick={() => setIsModalOpen(false)} /* Cierra al hacer clic fuera */ >
                    <ModalContent onClick={(e) => e.stopPropagation()} /* Evita cierre al hacer clic dentro */ >
                        <ModalTitle>
                             Detalles del Evento
                        </ModalTitle>

                        <ModalDetailsContainer>
                            <p><strong>Título:</strong> {selectedEvent.title || 'No especificado'}</p>
                            {selectedEvent.extendedProps.tipo && <p><strong>Tipo:</strong> {selectedEvent.extendedProps.tipo}</p>}
                             {selectedEvent.extendedProps.lugar && <p><strong>Lugar:</strong> {selectedEvent.extendedProps.lugar}</p>}
                            <p><strong>Fecha:</strong> {selectedEvent.start ? new Date(selectedEvent.startStr).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric'}) : 'No especificado'}</p>
                            <hr style={{ border: 'none', borderTop: `1px solid ${theme.colors.border.light}`, margin: '1rem 0'}} />
                            <p><strong>Archivo Origen:</strong> {selectedEvent.extendedProps.filename || 'No especificado'}</p>
                            <p><strong>Asignatura:</strong> {selectedEvent.extendedProps.asignatura || 'No especificado'}</p>
                            {selectedEvent.extendedProps.grado && <p><strong>Grado:</strong> {selectedEvent.extendedProps.grado}</p>}
                            {selectedEvent.extendedProps.departamento && <p><strong>Departamento:</strong> {selectedEvent.extendedProps.departamento}</p>}
                            {selectedEvent.extendedProps.universidad && <p><strong>Universidad:</strong> {selectedEvent.extendedProps.universidad}</p>}
                            {selectedEvent.extendedProps.condiciones_aprobado && <p><strong>Cond. Aprobado:</strong> {selectedEvent.extendedProps.condiciones_aprobado}</p>}
                        </ModalDetailsContainer>

                        <CloseButton onClick={() => setIsModalOpen(false)}>
                            Cerrar
                        </CloseButton>
                    </ModalContent>
                </ModalOverlay>
            )}
        </CalendarContainer>
    );
}

export default StyledCalendarScreen;