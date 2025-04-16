import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styled, { keyframes } from 'styled-components';
import theme from '../theme';
import { LoadingScreen } from '../components/UXComponents';

// --- Estilos (Sin cambios respecto a la versión anterior) ---

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

// Contenedor Principal
const TextViewerContainer = styled.div`
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
  animation: ${fadeIn} 0.5s ease-out;
`;

// Cabecera
const TextViewerHeader = styled.header`
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

  &:hover {
    background: ${props => props.secondary ? theme.colors.secondary.light : 'rgba(255, 255, 255, 0.3)'};
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.md};
  }

  &:active {
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
const TextViewerBody = styled.div`
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

// Contenedor del Texto
const TextContent = styled.div`
  font-family: ${theme.typography.fontFamily.mono};
  font-size: ${theme.typography.fontSize.sm};
  line-height: 1.6;
  white-space: pre-wrap;
  background-color: ${theme.colors.background.alt};
  padding: 1.5rem;
  border-radius: ${theme.borderRadius.md};
  max-height: 60vh;
  overflow-y: auto;
  border: 1px solid ${theme.colors.border.light};

  p {
    margin-bottom: 1rem;
  }

  @media (max-width: ${theme.breakpoints.md}) {
    font-size: ${theme.typography.fontSize.xs};
    padding: 1rem;
  }
`;

// Selectores de Modelo
const ModelSelectors = styled.div`
  display: flex;
  gap: 2rem;
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: ${theme.colors.background.alt};
  border-radius: ${theme.borderRadius.md};
  justify-content: center;
  flex-wrap: wrap;

  @media (max-width: ${theme.breakpoints.sm}) {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
  }
`;

const ModelSelector = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-start;

  label {
    font-size: ${theme.typography.fontSize.sm};
    font-weight: ${theme.typography.fontWeight.medium};
    color: ${theme.colors.text.secondary};
  }

  select {
    padding: 0.5rem 0.75rem;
    font-size: ${theme.typography.fontSize.base};
    border: 1px solid ${theme.colors.border.medium};
    border-radius: ${theme.borderRadius.md};
    background-color: ${theme.colors.background.paper};
    color: ${theme.colors.text.primary};
    min-width: 200px;
    cursor: pointer;

     &:focus {
        outline: none;
        border-color: ${theme.colors.primary.main};
        box-shadow: 0 0 0 2px ${theme.colors.primary.main}30;
     }
  }
   @media (max-width: ${theme.breakpoints.sm}) {
       align-items: stretch;
       select {
           min-width: unset;
       }
   }
`;

// Mensaje de Feedback
const Message = styled.p`
  margin-top: 1.25rem;
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


// --- Componente React Modificado ---
function TextViewer() {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Estados: Eliminado fileInfo
  const [text, setText] = useState('');
  const [extractedData, setExtractedData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summaryModel, setSummaryModel] = useState('gemma2:9b');
  const [jsonModel, setJsonModel] = useState('gemma2:9b');

  // Efecto para cargar datos al montar
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchFileData = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) throw new Error("No autenticado.");

        // --- ÚNICA LLAMADA: Obtener texto Y datos extraídos (si existen) ---
        // Usamos el endpoint del "Functional" que parece devolver ambos
        const textResponse = await fetch(`/api/upload/${fileId}/text/`, { // Endpoint del Functional
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!textResponse.ok) {
            const errData = await textResponse.json().catch(()=>({}));
            // Intenta obtener un mensaje de error útil de la respuesta
            const detailError = errData.detail || errData.message || JSON.stringify(errData);
            throw new Error(`No se pudo obtener el texto del archivo: ${detailError || textResponse.statusText}`);
        }

        const textData = await textResponse.json();
        setText(textData.text || ''); // Establece el texto
        setExtractedData(textData.extracted_data || {}); // Establece datos extraídos (vacío si no hay)

      } catch (err) {
        setError(`Error al cargar datos: ${err.message}`);
        console.error("Error fetching file data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFileData();
  }, [fileId, isAuthenticated, navigate]);

  // Navegar a la pantalla de fechas (si ya existen)
  const handleViewDates = () => {
    navigate(`/dates/${fileId}`, { state: { datesData: extractedData } });
  };

  // Navegar a la pantalla de carga para extraer fechas
  const handleExtractDates = () => {
    navigate(`/loading/${fileId}`, { state: { summaryModel, jsonModel } });
  };

  // Volver a la lista de archivos
  const handleBack = () => {
    navigate('/files');
  };

  // Renderizado condicional de carga
  if (loading) {
    return <LoadingScreen isLoading={true} message="Cargando texto del archivo..." />;
  }

  // Determina si hay datos extraídos para mostrar el botón correcto
  const hasExtractedData = extractedData && Object.keys(extractedData).length > 0;

  return (
    <TextViewerContainer>
      <TextViewerHeader>
        {/* Título genérico ya que no tenemos el nombre del archivo */}
        <HeaderTitle>Texto del Archivo</HeaderTitle>
        <HeaderActions>
          <ActionButton onClick={handleBack}>
            <i className="fas fa-arrow-left"></i>
            Volver
          </ActionButton>
          {/* Botón condicional: Ver Fechas o Extraer Fechas */}
          {hasExtractedData ? (
             <ActionButton secondary onClick={handleViewDates}>
               <i className="fas fa-calendar-check"></i>
               Ver Fechas
             </ActionButton>
          ) : (
             <ActionButton secondary onClick={handleExtractDates}>
               <i className="fas fa-cogs"></i>
               Extraer Fechas
             </ActionButton>
          )}
        </HeaderActions>
      </TextViewerHeader>

      <TextViewerBody>
        {/* Muestra error si existe */}
        {error && <Message data-type="error">{error}</Message>}

        {/* Muestra el texto si no hay error */}
        {!error && (
          <TextContent>
            {text || 'No hay texto disponible para mostrar.'}
          </TextContent>
        )}

        {/* Selectores de Modelo (solo si no hay error y hay texto para procesar) */}
        {/* Se muestran incluso si ya hay datos, por si se quiere re-extraer con otros modelos? Ocultar si hasExtractedData es true? */}
        {/* Decisión: Mostrar siempre si hay texto, ya que la extracción podría querer repetirse */}
        {!error && text && (
          <ModelSelectors>
            <ModelSelector>
              <label htmlFor="summary-model-select">Modelo para resumen:</label>
              <select
                id="summary-model-select"
                value={summaryModel}
                onChange={(e) => setSummaryModel(e.target.value)}
              >
                <option value="gemma2:9b">Gemma2 9B</option>
                <option value="llama3.1:8b">Llama3.1 8B</option>
              </select>
            </ModelSelector>
            <ModelSelector>
              <label htmlFor="json-model-select">Modelo para extraer JSON:</label>
              <select
                id="json-model-select"
                value={jsonModel}
                onChange={(e) => setJsonModel(e.target.value)}
              >
                <option value="gemma2:9b">Gemma2 9B</option>
                <option value="llama3.1:8b">Llama3.1 8B</option>
              </select>
            </ModelSelector>
          </ModelSelectors>
        )}

      </TextViewerBody>
    </TextViewerContainer>
  );
}

export default TextViewer;