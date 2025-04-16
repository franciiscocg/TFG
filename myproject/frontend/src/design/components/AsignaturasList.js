import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styled from 'styled-components';
import theme from '../theme';

// Estilos usando styled-components
const ListContainer = styled.div`
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: ${theme.colors.background.default};
  color: ${theme.colors.text.primary};
  box-sizing: border-box;
  padding-top: 6rem; /* Espacio para el navbar fijo */
  padding-bottom: 2rem;
  animation: ${theme.animations.fadeIn};
`;

const ListHeader = styled.header`
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

const AddButton = styled(Link)`
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

const ListBody = styled.div`
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

const AsignaturasList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const AsignaturaItem = styled.li`
  background-color: ${theme.colors.background.alt};
  border-radius: ${theme.borderRadius.md};
  padding: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: ${theme.transitions.default};
  border-left: 4px solid ${theme.colors.primary.main};
  
  &:hover {
    transform: translateX(5px);
    box-shadow: ${theme.shadows.sm};
  }
  
  @media (max-width: ${theme.breakpoints.sm}) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const AsignaturaInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const AsignaturaNombre = styled(Link)`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  text-decoration: none;
  transition: ${theme.transitions.default};
  
  &:hover {
    color: ${theme.colors.primary.main};
  }
`;

const AsignaturaDetalles = styled.span`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.secondary};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    width: 100%;
    justify-content: flex-end;
  }
`;

const EditButton = styled(Link)`
  padding: 0.5rem 1rem;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  background: ${theme.colors.primary.main};
  border: none;
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.primary.contrast};
  cursor: pointer;
  transition: ${theme.transitions.default};
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: ${theme.colors.primary.light};
    transform: translateY(-2px);
  }
  
  &:active {
    background: ${theme.colors.primary.dark};
    transform: translateY(0);
  }
  
  i {
    font-size: 0.875rem;
  }
`;

const DeleteButton = styled.button`
  padding: 0.5rem 1rem;
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
  animation: ${theme.animations.fadeIn};
  
  &:empty {
    display: none;
  }
  
  &[data-type="error"] {
    background-color: rgba(244, 67, 54, 0.1);
    color: #f44336;
  }
  
  &[data-type="success"] {
    background-color: rgba(76, 175, 80, 0.1);
    color: #4caf50;
  }
`;

// Modal para confirmación de eliminación
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ModalContent = styled.div`
  background-color: ${theme.colors.background.paper};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.xl};
  width: 90%;
  max-width: 500px;
  padding: 2rem;
  animation: slideUp 0.3s ease;
  
  @keyframes slideUp {
    from { transform: translateY(50px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

const ModalTitle = styled.h2`
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: 1rem;
`;

const ModalDetails = styled.div`
  margin-bottom: 1.5rem;
  
  p {
    margin-bottom: 0.75rem;
    font-size: ${theme.typography.fontSize.md};
    color: ${theme.colors.text.secondary};
  }
  
  strong {
    color: ${theme.colors.text.primary};
    font-weight: ${theme.typography.fontWeight.semibold};
  }
`;

const ModalButtons = styled.div`
  display: flex;
  justify-content: flex-end;
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

function AsignaturasListComponent() {
  const [asignaturas, setAsignaturas] = useState([]);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [asignaturaToDelete, setAsignaturaToDelete] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchAsignaturas();
  }, [isAuthenticated, navigate]);

  const fetchAsignaturas = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/ai/calendar/data/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (response.ok && result.data) {
        setAsignaturas(result.data);
      } else {
        setMessage('No se pudieron cargar las asignaturas: ' + JSON.stringify(result));
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Error al conectar con el servidor: ' + error.message);
      setMessageType('error');
    }
  };

  const handleDeleteClick = (asignatura) => {
    setAsignaturaToDelete(asignatura);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/ai/asignaturas/${asignaturaToDelete.asignatura.nombre}/delete/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (response.ok) {
        setAsignaturas(asignaturas.filter(item => item.asignatura.nombre !== asignaturaToDelete.asignatura.nombre));
        setMessage('Asignatura eliminada con éxito');
        setMessageType('success');
      } else {
        setMessage('Error al eliminar la asignatura: ' + JSON.stringify(result));
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Error al conectar con el servidor: ' + error.message);
      setMessageType('error');
    } finally {
      setShowModal(false);
      setAsignaturaToDelete(null);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <ListContainer>
      <ListHeader>
        <HeaderTitle>Lista de Asignaturas</HeaderTitle>
      </ListHeader>
      <ListBody>
        {asignaturas.length > 0 ? (
          <AsignaturasList>
            {asignaturas.map((item) => (
              <AsignaturaItem key={item.asignatura.nombre}>
                <AsignaturaInfo>
                  <AsignaturaNombre to={`/editar-asignatura/${item.asignatura.nombre}`}>
                    {item.asignatura.nombre}
                  </AsignaturaNombre>
                  <AsignaturaDetalles>
                    {item.asignatura.grado} - {item.asignatura.universidad}
                  </AsignaturaDetalles>
                </AsignaturaInfo>
                <ActionButtons>
                  <EditButton to={`/editar-asignatura/${item.asignatura.nombre}`}>
                    <i className="fas fa-edit"></i> Editar
                  </EditButton>
                  <DeleteButton onClick={() => handleDeleteClick(item)}>
                    <i className="fas fa-trash-alt"></i> Eliminar
                  </DeleteButton>
                </ActionButtons>
              </AsignaturaItem>
            ))}
          </AsignaturasList>
        ) : (
          <EmptyState>
            <EmptyStateIcon>
              <i className="fas fa-book"></i>
            </EmptyStateIcon>
            <EmptyStateText>No hay asignaturas disponibles.</EmptyStateText>
            <AddButton to="/nueva-asignatura">
              <i className="fas fa-plus"></i> Añadir tu primera asignatura
            </AddButton>
          </EmptyState>
        )}
        {message && <Message data-type={messageType}>{message}</Message>}
      </ListBody>

      {showModal && (
        <ModalOverlay>
          <ModalContent>
            <ModalTitle>Confirmar Eliminación</ModalTitle>
            <ModalDetails>
              <p>¿Estás seguro de que quieres eliminar la asignatura <strong>{asignaturaToDelete?.asignatura.nombre}</strong>?</p>
              <p>Esto eliminará también todos los horarios, fechas y profesores asociados.</p>
            </ModalDetails>
            <ModalButtons>
              <CancelButton onClick={() => setShowModal(false)}>Cancelar</CancelButton>
              <ConfirmButton onClick={confirmDelete}>Eliminar</ConfirmButton>
            </ModalButtons>
          </ModalContent>
        </ModalOverlay>
      )}
    </ListContainer>
  );
}

export default AsignaturasListComponent;
