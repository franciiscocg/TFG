import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styled, { keyframes } from 'styled-components';
import theme from '../theme';

// --- Estilos (Sin cambios respecto a la versión anterior) ---

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;
const slideUp = keyframes`from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; }`;

// Contenedor Principal
const DatesContainer = styled.div`
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
`;

// Cabecera
const DatesHeader = styled.header`
  background: ${theme.colors.gradient.primary};
  width: 100%;
  max-width: 800px;
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
    align-items: stretch;
  }
`;

const HeaderTitle = styled.h1`
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.primary.contrast};
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (max-width: ${theme.breakpoints.md}) {
    font-size: ${theme.typography.fontSize.xl};
    text-align: center;
    white-space: normal;
  }
`;

const HeaderActions = styled.div`
 display: flex;
 gap: 0.75rem;
 flex-wrap: wrap;

 @media (max-width: ${theme.breakpoints.md}) {
    justify-content: center;
 }
`;

// Botón de Acción Genérico
const ActionButton = styled.button`
  padding: 0.75rem 1.25rem;
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  background: ${props => props.secondary ? theme.colors.secondary.main : 'rgba(255, 255, 255, 0.2)'};
  border: none;
  border-radius: ${theme.borderRadius.md};
  color: ${props => props.secondary ? theme.colors.secondary.contrast : theme.colors.primary.contrast};
  cursor: pointer;
  transition: ${theme.transitions.default};
  box-shadow: ${theme.shadows.sm};
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    background: ${props => props.secondary ? theme.colors.secondary.light : 'rgba(255, 255, 255, 0.3)'};
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.md};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: ${theme.shadows.sm};
  }
  &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
  }

  i {
    font-size: 1rem;
  }
`;

// Cuerpo Principal
const DatesBody = styled.div`
  width: 100%;
  max-width: 800px;
  background-color: ${theme.colors.background.paper};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
  padding: 2rem;

  @media (max-width: ${theme.breakpoints.md}) {
    max-width: 90%;
    padding: 1.5rem;
  }
`;

// --- Estilos para la VISTA DE LISTA ---
const DatesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const DateItem = styled.div`
  padding: 1.25rem;
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.background.alt};
  box-shadow: ${theme.shadows.sm};
  transition: ${theme.transitions.default};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.md};
  }
`;

const DateHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const DateTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin: 0;
`;


const DateContent = styled.div`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.secondary};
  line-height: 1.5;
  margin-bottom: 1rem;
`;

// --- Otros Estilos (Loading, NoResults, Message) ---
const LoadingContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 4rem 0;
`;

const Spinner = styled.div`
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    border: 4px solid ${theme.colors.background.alt};
    border-top-color: ${theme.colors.primary.main};
    animation: ${spin} 1s linear infinite;
`;


const NoResults = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: ${theme.colors.text.secondary};

  i {
    font-size: 3.5rem;
    margin-bottom: 1.5rem;
    color: ${theme.colors.neutral.main};
  }

  h3 {
    font-size: ${theme.typography.fontSize.xl};
    color: ${theme.colors.text.primary};
    margin-bottom: 0.75rem;
  }

  p {
    font-size: ${theme.typography.fontSize.base};
  }
`;

const Message = styled.p`
  margin-bottom: 1.5rem;
  font-size: ${theme.typography.fontSize.md};
  text-align: center;
  padding: 0.75rem 1rem;
  border-radius: ${theme.borderRadius.md};
  width: 100%;
  animation: ${fadeIn} 0.3s;
  border: 1px solid transparent;

  &:empty {
    display: none;
  }

  &[data-type="error"] {
    background-color: rgba(244, 67, 54, 0.1);
    color: #d32f2f;
    border-color: rgba(244, 67, 54, 0.2);
  }

  &[data-type="success"] {
    background-color: rgba(76, 175, 80, 0.1);
    color: #388e3c;
    border-color: rgba(76, 175, 80, 0.2);
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
  padding: 1rem; /* Padding para evitar que el modal toque los bordes */
`;

const ModalContent = styled.div`
  background-color: ${theme.colors.background.paper};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.xl};
  width: 90%;
  max-width: 700px; /* Más ancho para JSON */
  padding: 1.5rem 2rem 2rem 2rem; /* Ajusta padding */
  animation: ${slideUp} 0.3s ease-out;
  display: flex;
  flex-direction: column;
  max-height: 85vh; /* Altura máxima */
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid ${theme.colors.border.light};
  padding-bottom: 1rem;
`;


const ModalTitle = styled.h2`
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin: 0; /* Quitamos margen */
`;

const ModalCloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: ${theme.colors.text.secondary};
  cursor: pointer;
  padding: 0.5rem;
  line-height: 1;
  transition: color 0.2s ease;

  &:hover {
      color: ${theme.colors.text.primary};
  }
`;

const ModalBody = styled.div`
    overflow-y: auto; /* Scroll si el contenido es muy largo */
`;


// Estilo para el bloque <pre> que contiene el JSON
const ModalPre = styled.pre`
  background-color: ${theme.colors.background.alt};
  padding: 1rem;
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.border.light};
  font-family: ${theme.typography.fontFamily.mono};
  font-size: ${theme.typography.fontSize.sm};
  line-height: 1.5;
  color: ${theme.colors.text.primary};
  white-space: pre-wrap;       /* CSS3 */
  word-wrap: break-word;     /* Internet Explorer 5.5+ */
  margin: 0; /* Reset de margen */
`;

function DatesResult() {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Estado para la vista de lista y datos crudos
  const [dates, setDates] = useState([]); // Array de fechas: { titulo, fecha }
  const [rawExtractedData, setRawExtractedData] = useState(null); // Guarda el objeto crudo de extracted_data[0]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estado para el modal de Ver JSON
  const [showJsonModal, setShowJsonModal] = useState(false);

  // Estado para mensajes
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Carga inicial de datos
  const fetchData = async () => {
      setLoading(true);
      setError('');
      setMessage('');
      setMessageType('');
      try {
          const token = localStorage.getItem('accessToken');
          if (!token) throw new Error("No autenticado.");

          const response = await fetch(`/api/upload/${fileId}/text/`, {
              method: 'GET',
              headers: { 'Authorization': `Bearer ${token}` },
          });

          if (!response.ok) {
              const errData = await response.json().catch(() => ({}));
              throw new Error(`No se pudo obtener datos: ${errData.detail || response.statusText}`);
          }

          const result = await response.json();
          const extractedObj = result.extracted_data?.[0] || null;
          setRawExtractedData(extractedObj); // Guarda el objeto JSON crudo

          if (extractedObj && Array.isArray(extractedObj.fechas)) {
              setDates(extractedObj.fechas); // Establece las fechas para la lista
          } else {
              console.warn("Array 'fechas' no encontrado:", extractedObj);
              setDates([]);
          }

      } catch (err) {
          setError(`Error al cargar datos: ${err.message}`);
          setDates([]);
          setRawExtractedData(null);
          console.error("Error fetching data:", err);
      } finally {
          setLoading(false);
      }
  };

  // Carga inicial
  useEffect(() => {
      if (!isAuthenticated) {
          navigate('/login');
          return;
      }
      fetchData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileId, isAuthenticated, navigate]);


  // Navegación
  const handleViewText = () => navigate(`/text/${fileId}`);
  const handleBack = () => navigate('/files');

  // Formato de fecha
  const formatDate = (dateString) => {
      if (!dateString) return "Fecha inválida";
      try {
          const date = new Date(dateString + 'T00:00:00');
          if (isNaN(date.getTime())) return "Fecha inválida";
          const options = { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' };
          return date.toLocaleDateString('es-ES', options);
      } catch (e) {
          console.error("Error formateando fecha:", dateString, e);
          return "Fecha inválida";
      }
  };

  return (
      <DatesContainer>
          <DatesHeader>
              <HeaderTitle>Fechas Extraídas</HeaderTitle>
              <HeaderActions>
                  <ActionButton onClick={handleBack} disabled={loading}>
                      <i className="fas fa-arrow-left"></i> Volver
                  </ActionButton>
                  <ActionButton secondary onClick={handleViewText} disabled={loading}>
                      <i className="fas fa-file-alt"></i> Ver texto
                  </ActionButton>
                  {/* Botón para Ver JSON */}
                  <ActionButton
                      secondary
                      onClick={() => setShowJsonModal(true)}
                      disabled={loading || !rawExtractedData} // Deshabilitado si carga o no hay datos
                      title={!rawExtractedData ? "No hay datos JSON para mostrar" : "Ver JSON crudo"} // Tooltip
                  >
                      <i className="fas fa-code"></i> Ver JSON
                  </ActionButton>
              </HeaderActions>
          </DatesHeader>

          {/* Mensaje Global */}
          {message && <Message data-type={messageType}>{message}</Message>}

          <DatesBody>
              {loading ? (
                  <LoadingContainer><Spinner /></LoadingContainer>
              ) : error ? (
                  <Message data-type="error">{error}</Message>
              ) : dates.length > 0 ? (
                 // --- VISTA DE LISTA ---
                 <DatesList>
                      {dates.map((dateItem, index) => (
                          <DateItem key={`${dateItem.fecha}-${dateItem.titulo}-${index}`}>
                              <DateHeader>
                                  <DateTitle>{formatDate(dateItem.fecha)}</DateTitle>
                                  {/* DateTag eliminado */}
                              </DateHeader>
                              <DateContent>{dateItem.titulo || 'Sin descripción'}</DateContent>
                              {/* DateContext eliminado */}
                              {/* Botón Añadir Calendario eliminado */}
                          </DateItem>
                      ))}
                  </DatesList>
              ) : (
                  // --- VISTA SIN RESULTADOS (solo si no hay error) ---
                   <NoResults>
                      <i className="fas fa-calendar-times"></i>
                      <h3>No se encontraron fechas</h3>
                      <p>No se pudieron extraer fechas o el formato es inesperado.</p>
                      {/* Botón Ver JSON aquí también por si hay raw data pero no fechas */}
                       {rawExtractedData && (
                           <ActionButton
                               secondary
                               onClick={() => setShowJsonModal(true)}
                               style={{marginTop: '1rem', background: theme.colors.secondary.main, color: theme.colors.secondary.contrast }}
                           >
                               <i className="fas fa-code"></i> Ver JSON Crudo
                           </ActionButton>
                       )}
                   </NoResults>
              )}
          </DatesBody>

          {/* --- Modal para Ver JSON --- */}
          {showJsonModal && (
              <ModalOverlay onClick={() => setShowJsonModal(false)}>
                  <ModalContent onClick={(e) => e.stopPropagation()}>
                       <ModalHeader>
                           <ModalTitle>JSON de Datos Extraídos</ModalTitle>
                           <ModalCloseButton onClick={() => setShowJsonModal(false)} title="Cerrar">
                               &times; {/* Carácter de 'x' para cerrar */}
                           </ModalCloseButton>
                       </ModalHeader>
                       <ModalBody>
                           <ModalPre>
                               <code>
                                   {/* Muestra el JSON crudo formateado */}
                                   {JSON.stringify(rawExtractedData, null, 2)}
                               </code>
                           </ModalPre>
                       </ModalBody>
                  </ModalContent>
              </ModalOverlay>
          )}

      </DatesContainer>
  );
}

export default DatesResult;