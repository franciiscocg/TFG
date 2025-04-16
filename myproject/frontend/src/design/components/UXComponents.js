import React from 'react';
import styled from 'styled-components';
import theme from '../theme';

// Componente para mejorar la experiencia de carga
const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(5px);
  animation: fadeIn 0.3s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const SpinnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
`;

const Spinner = styled.div`
  width: 4rem;
  height: 4rem;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: ${theme.colors.primary.main};
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
  text-align: center;
`;

const LoadingProgress = styled.div`
  width: 200px;
  height: 6px;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: ${theme.borderRadius.full};
  margin-top: 1rem;
  overflow: hidden;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => props.progress || '0%'};
    background-color: ${theme.colors.primary.main};
    border-radius: ${theme.borderRadius.full};
    transition: width 0.3s ease;
  }
`;

// Componente de carga mejorado
const LoadingScreen = ({ isLoading, progress, message }) => {
  if (!isLoading) return null;
  
  return (
    <LoadingOverlay>
      <SpinnerContainer>
        <Spinner />
        <LoadingText>{message || 'Cargando...'}</LoadingText>
        {progress !== undefined && (
          <LoadingProgress progress={`${progress}%`} />
        )}
      </SpinnerContainer>
    </LoadingOverlay>
  );
};

// Componente para mensajes de retroalimentación
const FeedbackMessage = styled.div`
  padding: 1rem;
  border-radius: ${theme.borderRadius.md};
  margin: 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  animation: slideIn 0.3s ease;
  
  @keyframes slideIn {
    from { transform: translateY(-10px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  background-color: ${props => {
    switch (props.type) {
      case 'success': return 'rgba(76, 175, 80, 0.1)';
      case 'error': return 'rgba(244, 67, 54, 0.1)';
      case 'warning': return 'rgba(255, 193, 7, 0.1)';
      case 'info': return 'rgba(33, 150, 243, 0.1)';
      default: return 'rgba(33, 150, 243, 0.1)';
    }
  }};
  
  color: ${props => {
    switch (props.type) {
      case 'success': return theme.colors.accent.success;
      case 'error': return theme.colors.accent.error;
      case 'warning': return theme.colors.accent.warning;
      case 'info': return theme.colors.accent.info;
      default: return theme.colors.accent.info;
    }
  }};
  
  i {
    font-size: 1.25rem;
  }
`;

// Componente para tooltips
const TooltipContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const TooltipContent = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: ${theme.colors.darker};
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  white-space: nowrap;
  z-index: 1000;
  box-shadow: ${theme.shadows.md};
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s, visibility 0.2s;
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-width: 5px;
    border-style: solid;
    border-color: ${theme.colors.darker} transparent transparent transparent;
  }
  
  ${TooltipContainer}:hover & {
    opacity: 1;
    visibility: visible;
  }
`;

const Tooltip = ({ children, text }) => (
  <TooltipContainer>
    {children}
    <TooltipContent>{text}</TooltipContent>
  </TooltipContainer>
);

// Componente para paginación
const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin: 1.5rem 0;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    flex-wrap: wrap;
  }
`;

const PageButton = styled.button`
  min-width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${props => props.active ? theme.colors.primary.main : theme.colors.border.light};
  background-color: ${props => props.active ? theme.colors.primary.main : 'transparent'};
  color: ${props => props.active ? theme.colors.primary.contrast : theme.colors.text.primary};
  font-weight: ${props => props.active ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.regular};
  cursor: pointer;
  transition: ${theme.transitions.default};
  
  &:hover {
    background-color: ${props => props.active ? theme.colors.primary.main : theme.colors.background.alt};
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
  
  @media (max-width: ${theme.breakpoints.sm}) {
    min-width: 2.25rem;
    height: 2.25rem;
  }
`;

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const renderPageButtons = () => {
    const buttons = [];
    
    // Botón anterior
    buttons.push(
      <PageButton 
        key="prev" 
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <i className="fas fa-chevron-left"></i>
      </PageButton>
    );
    
    // Primera página
    buttons.push(
      <PageButton 
        key={1} 
        active={currentPage === 1}
        onClick={() => onPageChange(1)}
      >
        1
      </PageButton>
    );
    
    // Puntos suspensivos iniciales
    if (currentPage > 3) {
      buttons.push(
        <PageButton key="dots1" disabled>
          ...
        </PageButton>
      );
    }
    
    // Páginas intermedias
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i === 1 || i === totalPages) continue;
      
      buttons.push(
        <PageButton 
          key={i} 
          active={currentPage === i}
          onClick={() => onPageChange(i)}
        >
          {i}
        </PageButton>
      );
    }
    
    // Puntos suspensivos finales
    if (currentPage < totalPages - 2) {
      buttons.push(
        <PageButton key="dots2" disabled>
          ...
        </PageButton>
      );
    }
    
    // Última página
    if (totalPages > 1) {
      buttons.push(
        <PageButton 
          key={totalPages} 
          active={currentPage === totalPages}
          onClick={() => onPageChange(totalPages)}
        >
          {totalPages}
        </PageButton>
      );
    }
    
    // Botón siguiente
    buttons.push(
      <PageButton 
        key="next" 
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <i className="fas fa-chevron-right"></i>
      </PageButton>
    );
    
    return buttons;
  };
  
  return (
    <PaginationContainer>
      {renderPageButtons()}
    </PaginationContainer>
  );
};

// Componente para tabs responsivos
const TabsContainer = styled.div`
  width: 100%;
  margin-bottom: 1.5rem;
`;

const TabsList = styled.div`
  display: flex;
  border-bottom: 1px solid ${theme.colors.border.light};
  overflow-x: auto;
  scrollbar-width: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
  
  @media (max-width: ${theme.breakpoints.sm}) {
    padding-bottom: 0.25rem;
  }
`;

const TabButton = styled.button`
  padding: 0.75rem 1.25rem;
  background: transparent;
  border: none;
  border-bottom: 2px solid ${props => props.active ? theme.colors.primary.main : 'transparent'};
  color: ${props => props.active ? theme.colors.primary.main : theme.colors.text.secondary};
  font-weight: ${props => props.active ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.regular};
  cursor: pointer;
  transition: ${theme.transitions.default};
  white-space: nowrap;
  
  &:hover {
    color: ${theme.colors.primary.main};
  }
  
  @media (max-width: ${theme.breakpoints.sm}) {
    padding: 0.5rem 1rem;
    font-size: ${theme.typography.fontSize.sm};
  }
`;

const TabContent = styled.div`
  padding: 1.5rem 0;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    padding: 1rem 0;
  }
`;

const Tabs = ({ tabs, activeTab, onTabChange, children }) => {
  return (
    <TabsContainer>
      <TabsList>
        {tabs.map((tab, index) => (
          <TabButton
            key={index}
            active={activeTab === index}
            onClick={() => onTabChange(index)}
          >
            {tab}
          </TabButton>
        ))}
      </TabsList>
      <TabContent>
        {children}
      </TabContent>
    </TabsContainer>
  );
};

export {
  LoadingScreen,
  FeedbackMessage,
  Tooltip,
  Pagination,
  Tabs
};
