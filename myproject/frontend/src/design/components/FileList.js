import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styled, { keyframes } from 'styled-components';
import theme from '../theme';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const FileListContainer = styled.div`
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

const FileListHeader = styled.header`
  background: ${theme.colors.gradient.primary};
  width: 100%;
  max-width: 1000px;
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

const UploadButton = styled(Link)`
  padding: 0.75rem 1.25rem;
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  background: ${theme.colors.secondary.main};
  border: none;
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.secondary.contrast};
  cursor: pointer;
  transition: ${theme.transitions.default};
  box-shadow: ${theme.shadows.sm};
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: ${theme.colors.secondary.light};
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.md};
  }

  &:active {
    background: ${theme.colors.secondary.dark};
    transform: translateY(0);
  }

  i {
    font-size: 1rem;
  }
`;

const FileListBody = styled.div`
  width: 100%;
  max-width: 1000px;
  background-color: ${theme.colors.background.paper};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
  padding: 1.5rem;

  @media (max-width: ${theme.breakpoints.md}) {
    max-width: 90%;
    padding: 1.25rem;
  }
`;

const FileGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;

  @media (max-width: ${theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const FileCard = styled.div`
  background-color: ${theme.colors.background.alt};
  border-radius: ${theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: ${theme.shadows.sm};
  transition: ${theme.transitions.default};
  display: flex;
  flex-direction: column;
  height: 100%;

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${theme.shadows.md};
  }
`;

const FileHeader = styled.div`
  background: ${theme.colors.gradient.primary};
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const FileName = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.primary.contrast};
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const FileContent = styled.div`
  padding: 1.25rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const FileInfo = styled.div`
  margin-bottom: 1rem;
`;

const FileDate = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  margin-bottom: 0.5rem;
`;

const FileStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: ${theme.typography.fontSize.sm};
  color: ${props => props.color || theme.colors.text.secondary};

  i {
    font-size: 0.875rem;
  }
`;

const FileActions = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const ActionButton = styled(Link)`
  flex: 1;
  padding: 0.6rem;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  background: ${props => props.background || theme.colors.primary.main};
  border: none;
  border-radius: ${theme.borderRadius.md};
  color: ${props => props.color || theme.colors.primary.contrast};
  cursor: pointer;
  transition: ${theme.transitions.default};
  text-decoration: none;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    filter: brightness(1.1);
    transform: translateY(-2px);
  }

  &:active {
    filter: brightness(0.9);
    transform: translateY(0);
  }

  i {
    font-size: 0.875rem;
  }
`;

const ExtractButton = styled.button`
  flex: 1;
  padding: 0.6rem;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  background: ${theme.colors.secondary.main};
  border: none;
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.secondary.contrast};
  cursor: pointer;
  transition: ${theme.transitions.default};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
      background: ${theme.colors.secondary.light};
      transform: translateY(-2px);
  }
  &:active {
      background: ${theme.colors.secondary.dark};
      transform: translateY(0);
  }
  &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
  }
  i {
      font-size: 0.875rem;
  }
`;

const DeleteButton = styled.button`
  flex: 0 1 auto;
  padding: 0.6rem 0.8rem;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  background: ${theme.colors.accent.error};
  border: none;
  border-radius: ${theme.borderRadius.md};
  color: white;
  cursor: pointer;
  transition: ${theme.transitions.default};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    background: #d32f2f;
    transform: translateY(-2px);
  }

  &:active {
    background: #b71c1c;
    transform: translateY(0);
  }

  i {
    font-size: 0.875rem;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
`;

const EmptyStateIcon = styled.div`
  font-size: 3rem;
  color: ${theme.colors.neutral.light};
  margin-bottom: 1.5rem;
`;

const EmptyStateText = styled.p`
  font-size: ${theme.typography.fontSize.lg};
  color: ${theme.colors.text.secondary};
  margin-bottom: 1.5rem;
`;

const Message = styled.p`
  margin-top: 1.25rem;
  font-size: ${theme.typography.fontSize.md};
  text-align: center;
  padding: 0.75rem;
  border-radius: ${theme.borderRadius.md};
  width: 100%;
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
  animation: ${fadeIn} 0.3s;

  &:empty {
    display: none;
  }

  &[data-type="error"] {
    background-color: rgba(244, 67, 54, 0.1);
    color: #f44336;
    border: 1px solid rgba(244, 67, 54, 0.2);
  }

  &[data-type="success"] {
    background-color: rgba(76, 175, 80, 0.1);
    color: #4caf50;
    border: 1px solid rgba(76, 175, 80, 0.2);
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2rem;
  gap: 0.5rem;
`;

const PaginationButton = styled.button`
  padding: 0.5rem 1rem;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  background: ${props => props.active ? theme.colors.primary.main : theme.colors.background.alt};
  color: ${props => props.active ? theme.colors.primary.contrast : theme.colors.text.primary};
  border: 1px solid ${props => props.active ? theme.colors.primary.main : theme.colors.border.medium};
  border-radius: ${theme.borderRadius.md};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.5 : 1};
  transition: ${theme.transitions.default};

  &:hover:not(:disabled) {
    background: ${props => props.active ? theme.colors.primary.light : theme.colors.background.paper};
    transform: translateY(-2px);
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
  max-width: 450px;
  padding: 2rem;
  animation: ${slideUp} 0.3s ease-out;
`;

const ModalTitle = styled.h2`
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: 1rem;
  text-align: center;
`;

const ModalDetails = styled.div`
  margin-bottom: 1.5rem;
  text-align: center;

  p {
    margin-bottom: 0.75rem;
    font-size: ${theme.typography.fontSize.md};
    color: ${theme.colors.text.secondary};
    line-height: 1.5;
  }

  strong {
    color: ${theme.colors.text.primary};
    font-weight: ${theme.typography.fontWeight.semibold};
  }
`;

const ModalButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
`;

const ConfirmButton = styled.button`
  padding: 0.75rem 1.5rem;
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  background: ${theme.colors.accent.error};
  border: none;
  border-radius: ${theme.borderRadius.md};
  color: white;
  cursor: pointer;
  transition: ${theme.transitions.default};

  &:hover {
    background: #d32f2f;
  }
`;

const CancelButton = styled.button`
  padding: 0.75rem 1.5rem;
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  background: ${theme.colors.neutral.light};
  border: none;
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.text.primary};
  cursor: pointer;
  transition: ${theme.transitions.default};

  &:hover {
    background: ${theme.colors.neutral.lighter};
  }
`;

function FileList() {
  const [files, setFiles] = useState([]);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    currentPage: 1,
    totalPages: 1
  });
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extractingId, setExtractingId] = useState(null);
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, navigate]);

  const fetchFiles = async (url = `${backendUrl}/api/upload/list/`) => {
    setLoading(true);
    setMessage('');
    setMessageType('');
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (response.ok) {
        setFiles(result.results || []);
        const currentPage = getCurrentPageFromUrl(url);
        const pageSize = 6;
        const totalPages = Math.ceil(result.count / pageSize);
        setPagination({
          count: result.count || 0,
          next: result.next,
          previous: result.previous,
          currentPage: currentPage,
          totalPages: totalPages > 0 ? totalPages : 1
        });
      } else {
        setMessage('Error al cargar los archivos: ' + (result.detail || JSON.stringify(result)));
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Error de conexión: ' + error.message);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPageFromUrl = (url) => {
    try {
      const urlObj = new URL(url, 'http://dummybase');
      const page = urlObj.searchParams.get('page');
      return page ? parseInt(page) : 1;
    } catch (e) {
      return 1;
    }
  };

  const handlePageChange = (url) => {
    if (url) {
      fetchFiles(url);
    }
  };

  const handleDeleteClick = (file) => {
    setFileToDelete(file);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!fileToDelete) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${backendUrl}/api/upload/delete/${fileToDelete.id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok || response.status === 204) {
        setFiles(files.filter(file => file.id !== fileToDelete.id));
         const newCount = pagination.count - 1;
         const newTotalPages = Math.ceil(newCount / (files.length > 0 ? files.length : 10));
         if (files.length === 1 && pagination.currentPage > 1) {
            handlePageChange(pagination.previous);
         } else {
            setPagination(prev => ({...prev, count: newCount, totalPages: newTotalPages > 0 ? newTotalPages : 1}));
         }

        setMessage('Archivo eliminado con éxito');
        setMessageType('success');
      } else {
        const result = await response.json().catch(() => ({}));
        setMessage('Error al eliminar: ' + (result.detail || `Status ${response.status}`));
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Error de conexión al eliminar: ' + error.message);
      setMessageType('error');
    } finally {
      setShowModal(false);
      setFileToDelete(null);
      setLoading(false);
    }
  };

  const handleExtractText = async (fileId) => {
      setExtractingId(fileId);
      setMessage('');
      setMessageType('');
      try {
          const token = localStorage.getItem('accessToken');
          const response = await fetch(`${backendUrl}/api/upload/${fileId}/extract/`, {
              method: 'POST',
              headers: {
                  'Authorization': `Bearer ${token}`,
              },
          });

          const result = await response.json();
          if (response.ok) {
              setMessage('Texto extraído con éxito para el archivo.');
              setMessageType('success');
              setFiles(files.map((file) =>
                  file.id === fileId ? result.file : file
              ));
          } else {
              setMessage('Error al extraer texto: ' + (result.detail || JSON.stringify(result)));
              setMessageType('error');
          }
      } catch (error) {
          setMessage('Error de conexión al extraer: ' + error.message);
          setMessageType('error');
      } finally {
          setExtractingId(null);
      }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha desconocida';
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  const getStatusInfo = (file) => {
      if (extractingId === file.id || file.processing) {
          return { text: 'Procesando...', icon: 'fas fa-spinner fa-spin', color: theme.colors.accent.warning };
      } else if (file.text_file_url) {
          return { text: 'Texto Disponible', icon: 'fas fa-check-circle', color: theme.colors.accent.success };
      } else {
          return { text: 'Pendiente de procesar', icon: 'fas fa-clock', color: theme.colors.text.secondary };
      }
  };

  const getFilenameFromUrl = (url) => {
    if (!url) return "Archivo sin nombre";
    try {
        const decodedUrl = decodeURIComponent(url);
        const parts = decodedUrl.split('/');
        const filenameWithParams = parts[parts.length - 1];
        const filename = filenameWithParams.split('?')[0];
        return filename;
    } catch (e) {
        console.error("Error decodificando URL:", url, e);
        const parts = url.split('/');
        return parts[parts.length - 1].split('?')[0] || "Error al leer nombre";
    }
  };

  if (!isAuthenticated) return null;

  return (
    <FileListContainer>
      {message && <Message data-type={messageType}>{message}</Message>}

      <FileListHeader>
        <HeaderTitle>Mis Archivos</HeaderTitle>
        <UploadButton to="/upload">
          <i className="fas fa-upload"></i> Subir nuevo archivo
        </UploadButton>
      </FileListHeader>

      <FileListBody>
        {loading && files.length === 0 && <p>Cargando archivos...</p>}
        {!loading && files.length === 0 ? (
          <EmptyState>
            <EmptyStateIcon><i className="fas fa-folder-open"></i></EmptyStateIcon>
            <EmptyStateText>No tienes archivos subidos.</EmptyStateText>
            <UploadButton to="/upload">
              <i className="fas fa-upload"></i> Subir tu primer archivo
            </UploadButton>
          </EmptyState>
        ) : (
          <>
            <FileGrid>
              {files.map((file) => {
                const statusInfo = getStatusInfo(file);
                const filename = getFilenameFromUrl(file.file);
                const canViewText = !!file.text_file_url;
                const canViewDates = file.extracted_data && Object.keys(file.extracted_data).length > 0;
                const isExtractingCurrent = extractingId === file.id;

                return (
                  <FileCard key={file.id}>
                    <FileHeader>
                      <FileName title={filename}>{filename}</FileName>
                    </FileHeader>
                    <FileContent>
                      <FileInfo>
                        <FileDate>Subido el {formatDate(file.uploaded_at)}</FileDate>
                        <FileStatus color={statusInfo.color}>
                          <i className={statusInfo.icon}></i>
                          {statusInfo.text}
                        </FileStatus>
                      </FileInfo>
                      <FileActions>
                        {canViewText ? (
                          <ActionButton to={`/text/${file.id}`} background={theme.colors.primary.main}>
                            <i className="fas fa-file-alt"></i> Ver texto
                          </ActionButton>
                        ) : (
                            <ExtractButton
                                onClick={() => handleExtractText(file.id)}
                                disabled={isExtractingCurrent}
                             >
                                {isExtractingCurrent ? (
                                     <i className="fas fa-spinner fa-spin"></i>
                                ) : (
                                     <i className="fas fa-cogs"></i>
                                )}
                               {isExtractingCurrent ? 'Extrayendo...' : 'Extraer Texto'}
                            </ExtractButton>
                        )}

                        {canViewDates && (
                          <ActionButton to={`/dates/${file.id}`} background={theme.colors.accent.success}>
                            <i className="fas fa-calendar-alt"></i> Ver fechas
                          </ActionButton>
                        )}

                        <DeleteButton onClick={() => handleDeleteClick(file)} disabled={isExtractingCurrent || loading}>
                             <i className="fas fa-trash-alt"></i> Eliminar
                        </DeleteButton>
                      </FileActions>
                    </FileContent>
                  </FileCard>
                );
              })}
            </FileGrid>

            {pagination.count > (files?.length || 10) && (
               <PaginationContainer>
                 <PaginationButton
                   onClick={() => handlePageChange(pagination.previous)}
                   disabled={!pagination.previous || loading}
                 >
                   <i className="fas fa-chevron-left"></i> Anterior
                 </PaginationButton>
                 <PaginationButton active disabled>
                   {`Pág. ${pagination.currentPage} de ${pagination.totalPages}`}
                 </PaginationButton>
                 <PaginationButton
                   onClick={() => handlePageChange(pagination.next)}
                   disabled={!pagination.next || loading}
                 >
                   Siguiente <i className="fas fa-chevron-right"></i>
                 </PaginationButton>
               </PaginationContainer>
             )}
          </>
        )}
      </FileListBody>

      {showModal && (
        <ModalOverlay onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()} >
            <ModalTitle>Confirmar Eliminación</ModalTitle>
            <ModalDetails>
              <p>¿Estás seguro de que quieres eliminar el archivo <strong>{getFilenameFromUrl(fileToDelete?.file)}</strong>?</p>
              <p>Esta acción no se puede deshacer.</p>
            </ModalDetails>A
            <ModalButtons>
              <CancelButton onClick={() => setShowModal(false)} disabled={loading}>Cancelar</CancelButton>
              <ConfirmButton onClick={confirmDelete} disabled={loading}>
                 {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Eliminar'}
              </ConfirmButton>
            </ModalButtons>
          </ModalContent>
        </ModalOverlay>
      )}
    </FileListContainer>
  );
}

export default FileList;