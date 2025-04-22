import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Asegúrate de que la ruta a AuthContext y theme sea correcta
import { useAuth } from '../../context/AuthContext';
import styled from 'styled-components';
import theme from '../theme';
// Asumiendo que FeedbackMessage viene de UXComponents
import { FeedbackMessage } from './UXComponents';

// --- Styled Components (sin cambios respecto a tu código) ---
const UploadContainer = styled.div`
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
  animation: ${theme.animations.fadeIn};
`;

const UploadHeader = styled.header`
  background: ${theme.colors.gradient.primary};
  width: 100%;
  max-width: 800px;
  padding: 1.5rem 2rem;
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
  text-align: center;
  margin-bottom: 1.5rem;

  @media (max-width: ${theme.breakpoints.md}) {
    max-width: 90%;
    padding: 1.25rem 1.5rem;
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

const UploadBody = styled.div`
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

const UploadForm = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const UploadArea = styled.div`
  border: 2px dashed ${theme.colors.border.medium};
  border-radius: ${theme.borderRadius.lg};
  padding: 3rem 2rem;
  text-align: center;
  transition: ${theme.transitions.default};
  background-color: ${theme.colors.background.alt};
  cursor: pointer;

  &:hover, &.dragover {
    border-color: ${theme.colors.primary.main};
    background-color: ${theme.colors.primary.main}10; /* 10 = ~6% opacity */
  }

  input[type="file"] {
    display: none;
  }
`;

const UploadIcon = styled.div`
  font-size: 3rem;
  color: ${theme.colors.primary.main};
  margin-bottom: 1rem;
`;

const UploadText = styled.div`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.medium};
  margin-bottom: 0.5rem;
`;

const UploadSubtext = styled.div`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.secondary};
`;

const SelectedFile = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.background.alt};
  margin-top: 1rem;
  border: 1px solid ${theme.colors.border.medium}; /* Ligero borde */

  .file-icon {
    font-size: 1.5rem;
    color: ${theme.colors.primary.main};
    width: 24px; /* Ancho fijo para alinear */
    text-align: center;
  }

  .file-info {
    flex: 1;
    overflow: hidden; /* Evitar desbordamiento del nombre */

    .file-name {
      font-weight: ${theme.typography.fontWeight.medium};
      margin-bottom: 0.25rem;
      white-space: nowrap; /* Evitar salto de línea */
      overflow: hidden;
      text-overflow: ellipsis; /* Añadir ... si es muy largo */
    }

    .file-size {
      font-size: ${theme.typography.fontSize.sm};
      color: ${theme.colors.text.secondary};
    }
  }

  .remove-button {
    background: none;
    border: none;
    /* Ajusta el color si no tienes accent.error en tu theme */
    color: ${theme.colors.secondary?.main || '#f44336'};
    cursor: pointer;
    font-size: 1.25rem;
    transition: ${theme.transitions.default};
    padding: 0.25rem; /* Área de click un poco mayor */
    line-height: 1; /* Alinear mejor el icono */

    &:hover {
      transform: scale(1.1);
      color: ${theme.colors.secondary?.dark || '#d32f2f'};
    }
  }
`;


const SubmitButton = styled.button`
  width: 100%;
  padding: 0.875rem;
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.semibold};
  background: ${theme.colors.gradient.primary};
  border: none;
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.primary.contrast};
  cursor: pointer;
  transition: ${theme.transitions.default};
  box-shadow: ${theme.shadows.sm};
  display: flex; /* Para alinear icono */
  align-items: center;
  justify-content: center;
  gap: 0.5rem; /* Espacio entre icono y texto */

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.md};
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const BackButton = styled.button`
  width: 100%;
  padding: 0.875rem;
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.medium};
  background: ${theme.colors.neutral.light};
  border: none;
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.text.primary};
  cursor: pointer;
  transition: ${theme.transitions.default};
  margin-top: 1rem;

  &:hover {
    background: ${theme.colors.neutral.lighter};
  }
`;

// --- Componente React Modificado ---

function Upload() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'; // Asegúrate de que esta variable esté definida

  // **NUEVO:** Tipos de archivo permitidos (MIME types)
  const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation' // .pptx
  ];
  const ALLOWED_EXTENSIONS_STRING = ".pdf, .pptx";
  const USER_FRIENDLY_TYPES = "PDF o PPTX";

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }
  }, [navigate]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const validateFile = (selectedFile) => {
    if (selectedFile && ALLOWED_MIME_TYPES.includes(selectedFile.type)) {
        setFile(selectedFile);
        setMessage({ text: '', type: '' }); // Limpiar mensajes
        return true;
      } else {
        setFile(null); // Limpiar archivo inválido
        setMessage({
          text: `Solo se permiten archivos ${USER_FRIENDLY_TYPES}`,
          type: 'error'
        });
        return false;
      }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    validateFile(droppedFile);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateFile(selectedFile);
     // Reset input value para permitir seleccionar el mismo archivo de nuevo si se eliminó
    e.target.value = null;
  };

  const handleRemoveFile = () => {
    setFile(null);
    // Limpiar el input por si acaso
    const input = document.getElementById('file-input');
    if (input) {
      input.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // **NUEVO:** Función para obtener el icono correcto
  const getFileIconClass = (fileType) => {
    if (fileType === 'application/pdf') {
      return 'fas fa-file-pdf'; // Icono PDF
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
      return 'fas fa-file-powerpoint'; // Icono PowerPoint
    }
    return 'fas fa-file-alt'; // Icono genérico por defecto
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage({
        text: `Por favor selecciona un archivo ${USER_FRIENDLY_TYPES}`, // Mensaje actualizado
        type: 'error'
      });
      return;
    }

    setIsUploading(true);
    setMessage({ text: '', type: '' });

    try {
      const token = localStorage.getItem('accessToken');
      const formData = new FormData();
      formData.append('file', file); // El backend espera 'file'

      // Asegúrate que la URL del API sea la correcta
      const response = await fetch(`${backendUrl}/api/upload/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // 'Content-Type': 'multipart/form-data' // El navegador lo pone solo con FormData
        },
        body: formData,
      });

      const result = await response.json().catch(() => ({})); // Captura si la respuesta no es JSON

      if (response.ok) {
        setMessage({
          text: 'Archivo subido correctamente. Redirigiendo...',
          type: 'success'
        });
        setTimeout(() => {
           navigate('/files'); // O a donde quieras redirigir
        }, 1500); // Aumentado ligeramente el tiempo

      } else {
        setMessage({
          text: `Error al subir: ${result.detail || result.message || 'Respuesta no válida del servidor'}`,
          type: 'error'
        });
      }
    } catch (error) {
      console.error("Error en la subida:", error); // Loguear el error real
      setMessage({
        text: `Error de conexión o del servidor: ${error.message}`,
        type: 'error'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleBack = () => {
    navigate('/files'); // O a la página anterior deseada
  };

  if (!isAuthenticated) return null;

  return (
    <UploadContainer>
      <UploadHeader>
        {/* Título actualizado */}
        <HeaderTitle>Subir Archivo PDF o PPTX</HeaderTitle>
      </UploadHeader>

      <UploadBody>
        <UploadForm onSubmit={handleSubmit}>
          <UploadArea
            className={isDragging ? 'dragover' : ''}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            // Llama al click del input oculto
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <input
              id="file-input"
              type="file"
              // Atributo accept actualizado
              accept={ALLOWED_EXTENSIONS_STRING}
              onChange={handleFileChange}
            />
            <UploadIcon>
              <i className="fas fa-cloud-upload-alt"></i> {/* Icono alternativo */}
            </UploadIcon>
            <UploadText>
              {/* Texto actualizado */}
              Arrastra y suelta tu archivo {USER_FRIENDLY_TYPES} aquí
            </UploadText>
            <UploadSubtext>
              o haz clic para seleccionar un archivo
            </UploadSubtext>

            {/* Mostrar archivo seleccionado */}
            {file && (
              <SelectedFile>
                <div className="file-icon">
                   {/* Icono dinámico */}
                   <i className={getFileIconClass(file.type)}></i>
                </div>
                <div className="file-info">
                  <div className="file-name" title={file.name}>{file.name}</div>
                  <div className="file-size">{formatFileSize(file.size)}</div>
                </div>
                <button
                  type="button"
                  className="remove-button"
                  title="Quitar archivo"
                  // Detener la propagación para no activar el onClick de UploadArea
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile();
                  }}
                >
                  <i className="fas fa-times-circle"></i>
                </button>
              </SelectedFile>
            )}
          </UploadArea>

          {/* Mensaje de feedback */}
          {message.text && (
            <FeedbackMessage type={message.type}>
              <i className={message.type === 'error' ? 'fas fa-exclamation-circle' : 'fas fa-check-circle'} style={{ marginRight: '0.5rem' }}></i>
              {message.text}
            </FeedbackMessage>
          )}

          {/* Botón de Subir */}
          <SubmitButton
            type="submit"
            disabled={!file || isUploading}
          >
            {isUploading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Subiendo...
              </>
            ) : (
               <>
                 <i className="fas fa-upload"></i> {/* Icono subida */}
                  Subir Archivo
               </>
            )}
          </SubmitButton>

           {/* Botón de Volver */}
          <BackButton type="button" onClick={handleBack} disabled={isUploading}>
            Volver
          </BackButton>

        </UploadForm>
      </UploadBody>
    </UploadContainer>
  );
}

export default Upload;