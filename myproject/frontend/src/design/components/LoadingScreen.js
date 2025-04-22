import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import styled, { keyframes } from 'styled-components'; // Importa styled y keyframes
import theme from '../theme'; // Asegúrate que la ruta a tu theme sea correcta
import { useAuth } from '../../context/AuthContext';

// --- Estilos (Copiados del primer componente) ---

// Animaciones (si `theme.animations.fadeIn` no está definido, puedes definirlo aquí o en tu theme.js)
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

// Contenedores y Tarjeta
const LoadingContainer = styled.div`
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: ${theme.colors.background.default};
  color: ${theme.colors.text.primary};
  padding: 2rem;
`;

const LoadingCard = styled.div`
  background-color: ${theme.colors.background.paper};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.lg};
  width: 100%;
  max-width: 500px;
  padding: 2.5rem;
  text-align: center;
  animation: ${fadeIn} 0.5s ease-out; // Usa la animación definida

  @media (max-width: ${theme.breakpoints.sm}) {
    padding: 2rem;
    max-width: 90%;
  }
`;

// Elementos internos
const LoadingTitle = styled.h1`
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: 1.5rem;

  @media (max-width: ${theme.breakpoints.sm}) {
    font-size: ${theme.typography.fontSize.xl};
  }
`;

const LoadingSpinner = styled.div`
  width: 4rem; // Ajustado ligeramente el tamaño
  height: 4rem;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: ${theme.colors.primary.main};
  animation: ${spin} 1s linear infinite; // Usa la animación spin
  margin: 0 auto 2rem;
`;

const LoadingText = styled.p`
  font-size: ${theme.typography.fontSize.lg};
  color: ${theme.colors.text.secondary};
  margin-bottom: 1.5rem;
  min-height: 2em; // Espacio para que no salte el layout al cambiar texto
`;

// Barra de Progreso
const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background-color: ${theme.colors.background.alt};
  border-radius: ${theme.borderRadius.full};
  margin-bottom: 0.5rem; // Reducido margen inferior
  overflow: hidden;

  &::after {
    content: '';
    display: block;
    height: 100%;
    /* Corrección: Asegúrate que la prop se llame 'progress' como se usa abajo */
    width: ${props => props.progress || '0%'};
    background-color: ${theme.colors.primary.main};
    border-radius: ${theme.borderRadius.full};
    transition: width 0.4s ease-in-out; // Transición suave
  }
`;

const ProgressText = styled.p`
  font-size: ${theme.typography.fontSize.md};
  color: ${theme.colors.text.secondary};
  margin-bottom: 2rem;
`;

// Botón de Cancelar
const CancelButton = styled.button`
  padding: 0.75rem 1.5rem;
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  background-color: ${theme.colors.neutral.light};
  color: ${theme.colors.text.primary};
  border: none;
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  transition: ${theme.transitions.default};

  &:hover {
    background-color: ${theme.colors.neutral.lighter};
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.sm}; // Añade sombra en hover
  }

  &:active {
    transform: translateY(0);
    box-shadow: none;
  }
`;

// Div para mostrar Errores (adaptado del inline style)
const ErrorDisplay = styled.div`
  color: ${theme.colors.accent.error};
  margin-bottom: 1.5rem;
  padding: 0.75rem;
  background-color: rgba(244, 67, 54, 0.1); // Asumiendo colores del tema para error
  border-radius: ${theme.borderRadius.md};
  border: 1px solid rgba(244, 67, 54, 0.2); // Borde sutil
  font-size: ${theme.typography.fontSize.sm};
  text-align: left; // Alinear texto del error a la izquierda
  word-break: break-word; // Evitar overflow con errores largos
`;

// --- Componente React ---
function LoadingScreenFunctionalStyled() {
    const { fileId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated } = useAuth();
    // Obtiene los modelos del estado de la navegación, asegurando que existan
    const { summaryModel, jsonModel } = location.state || { summaryModel: null, jsonModel: null };

    // Estados combinados: progreso y estado visual + manejo de errores
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('Iniciando proceso...');
    const [error, setError] = useState(null);
    // Estado para guardar los datos de la primera llamada y pasarlos en la navegación
    const [datesDataForNav, setDatesDataForNav] = useState(null);
    
    useEffect(() => {
        // 1. Comprobar autenticación
        if (!isAuthenticated) {
            console.log("Usuario no autenticado, redirigiendo a login...");
            navigate('/login');
            return; // Detiene la ejecución si no está autenticado
        }

        // 2. Verificar si tenemos los modelos necesarios del state
        if (!summaryModel || !jsonModel) {
            console.error("Faltan modelos (summaryModel o jsonModel) en location.state");
            setError("Error de configuración: No se especificaron los modelos necesarios.");
            setStatus("Error de configuración");
            setProgress(0);
            // Opcionalmente, redirigir a una página anterior o de error
            // navigate('/files'); // O donde sea apropiado
            return;
        }


        // Bandera para evitar doble ejecución en React.StrictMode
        let isProcessing = false;

        const processFile = async () => {
            if (isProcessing) return;
            isProcessing = true;
            setError(null); // Limpia errores previos al iniciar

            const token = localStorage.getItem('accessToken');
            if (!token) {
                setError('Error de autenticación: No se encontró token.');
                setStatus('Error');
                setProgress(0);
                isProcessing = false;
                return;
            }

            try {
                // --- Paso 1: Extraer Fechas ---
                setStatus('Extrayendo información clave...');
                setProgress(10); // Progreso inicial simulado

                const fetchDatesResponse = await fetch(`http://localhost:8000/api/ai/${fileId}/dates/`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ summary_model: summaryModel, json_model: jsonModel }),
                });

                const datesResult = await fetchDatesResponse.json();

                if (!fetchDatesResponse.ok) {
                    // Intenta obtener un mensaje de error más útil del backend
                    const errorMsg = datesResult?.detail || JSON.stringify(datesResult);
                    throw new Error(`Error ${fetchDatesResponse.status} al extraer: ${errorMsg}`);
                }

                setDatesDataForNav(datesResult);
                setStatus('Procesando datos extraídos...');
                setProgress(50); 
                // --- Paso 2: Procesar Datos Extraídos ---
                const processDataResponse = await fetch(`http://localhost:8000/api/ai/${fileId}/process-extracted-data/`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json', // Aunque no envíe body, es buena práctica
                    },
                    // No se envía body según el código funcional original
                });

                const processResult = await processDataResponse.json();

                if (!processDataResponse.ok) {
                    const errorMsg = processResult?.detail || JSON.stringify(processResult);
                    throw new Error(`Error ${processDataResponse.status} al procesar: ${errorMsg}`);
                }

                // --- Éxito ---
                setStatus('¡Proceso completado!');
                setProgress(100);

                // Pequeña pausa antes de redirigir para que el usuario vea el 100%
                setTimeout(() => {
                     // Navega a la página de resultados pasando los datos de la primera llamada
                    navigate(`/dates/${fileId}`, { state: { datesData: datesResult } });
                }, 500); // 0.5 segundos de espera

            } catch (err) {
                console.error('Error durante el procesamiento:', err);
                // Guarda solo el mensaje del error para mostrarlo
                setError(err.message || 'Ocurrió un error desconocido.');
                setStatus('Error en el procesamiento');
                setProgress(0); // Reinicia el progreso en caso de error
            } finally {
                isProcessing = false; // Marca como terminado (con éxito o error)
            }
        };

        // Inicia el proceso
        processFile();

        // Función de limpieza (no estrictamente necesaria aquí ya que no hay intervalos)
        // return () => { console.log("Limpiando efecto de LoadingScreen"); };

    // Dependencias del useEffect: se ejecuta si cambia alguna de estas
    }, [isAuthenticated, navigate, fileId, summaryModel, jsonModel, location.state]); // Incluir location.state si se quiere reaccionar a cambios en él

    // Función para el botón Cancelar
    const handleCancel = () => {
        console.log("Proceso cancelado por el usuario.");
        // Aquí podrías añadir una llamada a la API para cancelar el proceso en backend si existe esa funcionalidad
        navigate('/files'); // Navega a la lista de archivos (o donde prefieras)
    };

    // Renderizado condicional basado en el estado
    const showSpinner = !error && progress < 100;
    const showCancelButton = !error && progress < 100;
    const showProgressBar = !error && progress > 0; // Muestra la barra si ya empezó

    return (
        <LoadingContainer>
            <LoadingCard>
                <LoadingTitle>Procesando Archivo</LoadingTitle>

                {showSpinner && <LoadingSpinner />}

                {/* Muestra el estado actual */}
                <LoadingText>{status}</LoadingText>

                {/* Muestra la barra y texto de progreso si aplica */}
                {showProgressBar && (
                    <>
                        <ProgressBar progress={`${progress}%`} />
                        <ProgressText>{`${Math.round(progress)}% completado`}</ProgressText>
                    </>
                )}

                {/* Muestra el error si existe */}
                {error && (
                    <ErrorDisplay>
                        <strong>Error:</strong> {error}
                    </ErrorDisplay>
                )}

                {/* Muestra el botón de cancelar si aplica */}
                {showCancelButton && (
                    <CancelButton onClick={handleCancel} disabled={status === '¡Proceso completado!'}>
                        Cancelar
                    </CancelButton>
                )}
                 {/* Opcional: Mostrar un botón para ir a resultados si ya terminó pero hubo error al redirigir? */}
                 {/* {status === '¡Proceso completado!' && !error && (
                      <button onClick={() => navigate(`/dates/${fileId}`, { state: { datesData: datesDataForNav } })}>Ver Resultados</button>
                 )} */}
            </LoadingCard>
        </LoadingContainer>
    );
}

export default LoadingScreenFunctionalStyled; // Exporta el nuevo componente