import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import theme from '../theme';
import { useAuth } from '../../context/AuthContext';

// --- Estilos ---

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

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
  animation: ${fadeIn} 0.5s ease-out;

  @media (max-width: ${theme.breakpoints.sm}) {
    padding: 2rem;
    max-width: 90%;
  }
`;

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
  width: 4rem;
  height: 4rem;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: ${theme.colors.primary.main};
  animation: ${spin} 1s linear infinite;
  margin: 0 auto 2rem;
`;

const LoadingText = styled.p`
  font-size: ${theme.typography.fontSize.lg};
  color: ${theme.colors.text.secondary};
  margin-bottom: 1.5rem;
  min-height: 2em;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background-color: ${theme.colors.background.alt};
  border-radius: ${theme.borderRadius.full};
  margin-bottom: 0.5rem;
  overflow: hidden;

  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${props => props.progress || '0%'};
    background-color: ${theme.colors.primary.main};
    border-radius: ${theme.borderRadius.full};
    transition: width 0.4s ease-in-out;
  }
`;

const ProgressText = styled.p`
  font-size: ${theme.typography.fontSize.md};
  color: ${theme.colors.text.secondary};
  margin-bottom: 2rem;
`;

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
    box-shadow: ${theme.shadows.sm};
  }

  &:active {
    transform: translateY(0);
    box-shadow: none;
  }
`;

const ErrorDisplay = styled.div`
  color: ${theme.colors.accent.error};
  margin-bottom: 1.5rem;
  padding: 0.75rem;
  background-color: rgba(244, 67, 54, 0.1);
  border-radius: ${theme.borderRadius.md};
  border: 1px solid rgba(244, 67, 54, 0.2);
  font-size: ${theme.typography.fontSize.sm};
  text-align: left;
  word-break: break-word;
`;

// --- Componente React ---
function LoadingScreenFunctionalStyled() {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Obtener el payload de location.state
  const { model_mode, summary_model, json_model } = location.state || {};

  // Estados
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Iniciando proceso...');
  const [error, setError] = useState(null);
  const [datesDataForNav, setDatesDataForNav] = useState(null);
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

  useEffect(() => {
    // 1. Comprobar autenticación
    if (!isAuthenticated) {
      console.log("Usuario no autenticado, redirigiendo a login...");
      navigate('/login');
      return;
    }

    // 2. Verificar si tenemos el payload necesario
    if (!model_mode || !summary_model || !json_model) {
      console.error("Falta información en location.state (model_mode, summary_model, json_model)");
      setError("Error de configuración: No se especificaron los modelos necesarios.");
      setStatus("Error de configuración");
      setProgress(0);
      return;
    }

    // Bandera para evitar doble ejecución en React.StrictMode
    let isProcessing = false;

    const processFile = async () => {
      if (isProcessing) return;
      isProcessing = true;
      setError(null);

      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('Error de autenticación: No se encontró token.');
        setStatus('Error');
        setProgress(0);
        isProcessing = false;
        return;
      }

      try {
        // Paso 1: Extraer Fechas
        setStatus(model_mode === 'api' ? 'Conectando con Gemini API...' : 'Extrayendo información clave...');
        setProgress(10);

        const fetchDatesResponse = await fetch(`${backendUrl}/api/ai/${fileId}/dates/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model_mode,
            summary_model,
            json_model,
          }),
        });

        const datesResult = await fetchDatesResponse.json();

        if (!fetchDatesResponse.ok) {
          const errorMsg = datesResult?.detail || JSON.stringify(datesResult);
          throw new Error(`Error ${fetchDatesResponse.status} al extraer: ${errorMsg}`);
        }

        setDatesDataForNav(datesResult);
        setStatus('Procesando datos extraídos...');
        setProgress(50);

        // Paso 2: Procesar Datos Extraídos
        const processDataResponse = await fetch(`${backendUrl}/api/ai/${fileId}/process-extracted-data/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const processResult = await processDataResponse.json();

        if (!processDataResponse.ok) {
          const errorMsg = processResult?.detail || JSON.stringify(processResult);
          throw new Error(`Error ${processDataResponse.status} al procesar: ${errorMsg}`);
        }

        // Éxito
        setStatus('Procesamiento completado.');
        setProgress(100);

        // Redirigir
        setTimeout(() => {
          navigate(`/dates/${fileId}`, { state: { datesData: datesResult } });
        }, 500);

      } catch (err) {
        console.error('Error durante el procesamiento:', err);
        setError(err.message || 'Ocurrió un error desconocido.');
        setStatus('Error en el procesamiento');
        setProgress(0);
      } finally {
        isProcessing = false;
      }
    };

    processFile();

  }, [isAuthenticated, navigate, fileId, model_mode, summary_model, json_model]);

  // Función para el botón Cancelar
  const handleCancel = () => {
    console.log("Proceso cancelado por el usuario.");
    navigate('/files');
  };

  // Renderizado condicional
  const showSpinner = !error && progress < 100;
  const showCancelButton = !error && progress < 100;
  const showProgressBar = !error && progress > 0;

  return (
    <LoadingContainer>
      <LoadingCard>
        <LoadingTitle>Procesando Archivo</LoadingTitle>

        {showSpinner && <LoadingSpinner />}

        <LoadingText>{status}</LoadingText>

        {showProgressBar && (
          <>
            <ProgressBar progress={`${progress}%`} />
            <ProgressText>{`${Math.round(progress)}% completado`}</ProgressText>
          </>
        )}

        {error && (
          <ErrorDisplay>
            <strong>Error:</strong> {error}
          </ErrorDisplay>
        )}

        {showCancelButton && (
          <CancelButton onClick={handleCancel} disabled={status === 'Procesamiento completado.'}>
            Cancelar
          </CancelButton>
        )}
      </LoadingCard>
    </LoadingContainer>
  );
}

export default LoadingScreenFunctionalStyled;