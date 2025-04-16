import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import theme from '../theme';

// Estilos usando styled-components
const HomeContainer = styled.div`
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

const HomeHeader = styled.header`
  background: ${theme.colors.gradient.primary};
  width: 100%;
  max-width: 800px;
  padding: 3rem 2rem;
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.lg};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB4PSIwIiB5PSIwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSgzMCkiPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXR0ZXJuKSIvPjwvc3ZnPg==');
    opacity: 0.3;
  }
  
  @media (max-width: ${theme.breakpoints.md}) {
    max-width: 90%;
    padding: 2rem 1.5rem;
  }
`;

const HeaderTitle = styled.h1`
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize['4xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.primary.contrast};
  margin: 0 0 1rem 0;
  position: relative;
  z-index: 1;
  
  @media (max-width: ${theme.breakpoints.md}) {
    font-size: ${theme.typography.fontSize['3xl']};
  }
  
  @media (max-width: ${theme.breakpoints.sm}) {
    font-size: ${theme.typography.fontSize['2xl']};
  }
`;

const HeaderSubtitle = styled.p`
  font-size: ${theme.typography.fontSize.xl};
  color: ${theme.colors.primary.contrast};
  margin-bottom: 2rem;
  max-width: 600px;
  position: relative;
  z-index: 1;
  
  @media (max-width: ${theme.breakpoints.md}) {
    font-size: ${theme.typography.fontSize.lg};
  }
  
  @media (max-width: ${theme.breakpoints.sm}) {
    font-size: ${theme.typography.fontSize.md};
    margin-bottom: 1.5rem;
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 1rem;
  position: relative;
  z-index: 1;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    flex-direction: column;
    width: 100%;
    max-width: 250px;
  }
`;

const PrimaryButton = styled(Link)`
  padding: 0.875rem 1.75rem;
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.semibold};
  background: ${theme.colors.secondary.main};
  border: none;
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.secondary.contrast};
  cursor: pointer;
  transition: ${theme.transitions.default};
  box-shadow: ${theme.shadows.md};
  text-decoration: none;
  text-align: center;
  
  &:hover {
    background: ${theme.colors.secondary.light};
    transform: translateY(-3px);
    box-shadow: ${theme.shadows.lg};
  }
  
  &:active {
    background: ${theme.colors.secondary.dark};
    transform: translateY(-1px);
  }
  
  @media (max-width: ${theme.breakpoints.sm}) {
    width: 100%;
  }
`;

const SecondaryButton = styled(PrimaryButton)`
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  
  &:hover {
    background: rgba(255, 255, 255, 0.25);
  }
  
  &:active {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const HomeBody = styled.div`
  width: 100%;
  max-width: 1200px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 0 1.5rem;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const FeatureCard = styled.div`
  background-color: ${theme.colors.background.paper};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: ${theme.transitions.default};
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${theme.shadows.lg};
  }
`;

const FeatureIcon = styled.div`
  width: 4rem;
  height: 4rem;
  border-radius: ${theme.borderRadius.full};
  background: ${props => props.gradient || theme.colors.gradient.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  color: white;
  font-size: 1.75rem;
`;

const FeatureTitle = styled.h3`
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: 1rem;
`;

const FeatureDescription = styled.p`
  font-size: ${theme.typography.fontSize.md};
  color: ${theme.colors.text.secondary};
  margin-bottom: 1.5rem;
`;

function Home() {
  return (
    <HomeContainer>
      <HomeHeader>
        <HeaderTitle>Plataforma Académica</HeaderTitle>
        <HeaderSubtitle>
          Gestiona tus asignaturas, archivos y calendario académico en un solo lugar. 
          Una solución completa para organizar tu vida estudiantil.
        </HeaderSubtitle>
        <ButtonsContainer>
          <PrimaryButton to="/register">Comenzar ahora</PrimaryButton>
          <SecondaryButton to="/login">Iniciar sesión</SecondaryButton>
        </ButtonsContainer>
      </HomeHeader>
      
      <HomeBody>
        <FeatureCard>
          <FeatureIcon gradient={theme.colors.gradient.primary}>
            <i className="fas fa-file-pdf"></i>
          </FeatureIcon>
          <FeatureTitle>Gestión de Archivos</FeatureTitle>
          <FeatureDescription>
            Sube y organiza tus documentos PDF. Extrae fechas importantes automáticamente para mantener tu calendario actualizado.
          </FeatureDescription>
        </FeatureCard>
        
        <FeatureCard>
          <FeatureIcon gradient={theme.colors.gradient.secondary}>
            <i className="fas fa-calendar-alt"></i>
          </FeatureIcon>
          <FeatureTitle>Calendario Inteligente</FeatureTitle>
          <FeatureDescription>
            Visualiza todas tus fechas importantes en un calendario interactivo. Nunca más te perderás una entrega o examen.
          </FeatureDescription>
        </FeatureCard>
        
        <FeatureCard>
          <FeatureIcon gradient="linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)">
            <i className="fas fa-book"></i>
          </FeatureIcon>
          <FeatureTitle>Gestión de Asignaturas</FeatureTitle>
          <FeatureDescription>
            Administra tus asignaturas, profesores y horarios en un solo lugar. Mantén toda tu información académica organizada.
          </FeatureDescription>
        </FeatureCard>
      </HomeBody>
    </HomeContainer>
  );
}

export default Home;
