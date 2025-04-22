import React, { useState, useEffect } from 'react';
import { Navbar, Container } from 'reactstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styled from 'styled-components';
import theme from '../theme';

// Estilos usando styled-components
const StyledNavbar = styled(Navbar)`
  background: ${theme.colors.primary.main};
  box-shadow: ${theme.shadows.md};
  padding: 0;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1000;
  transition: ${theme.transitions.default};
  height: 56px; /* Altura reducida para optimizar espacio vertical */
  
  @media (max-width: ${theme.breakpoints.md}) {
    height: auto;
  }
`;

const NavbarContainer = styled(Container)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 1rem;
  max-width: 100%;
  
  @media (max-width: ${theme.breakpoints.md}) {
    padding: 0.5rem 1rem;
    flex-wrap: wrap;
  }
`;

const NavbarBrand = styled(Link)`
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.primary.contrast} !important;
  text-decoration: none;
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 0.75rem;
  
  &:hover {
    color: ${theme.colors.primary.contrast} !important;
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  @media (max-width: ${theme.breakpoints.md}) {
    height: 48px;
    font-size: ${theme.typography.fontSize.md};
  }
`;

const BrandIcon = styled.div`
  width: 28px;
  height: 28px;
  background-color: ${theme.colors.secondary.main};
  border-radius: ${theme.borderRadius.md};
  margin-right: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.secondary.contrast};
  
  @media (max-width: ${theme.breakpoints.md}) {
    width: 24px;
    height: 24px;
  }
`;

const NavMenu = styled.div`
  display: flex;
  height: 100%;
  flex-direction: row; /* Asegura layout horizontal */
  flex-wrap: nowrap; /* Evita que los elementos se envuelvan */
  
  @media (max-width: ${theme.breakpoints.md}) {
    width: 100%;
    height: auto;
    flex-direction: column;
    display: ${props => (props.isOpen ? 'flex' : 'none')};
    margin-top: 0.5rem;
    background-color: ${theme.colors.primary.dark};
    border-radius: ${theme.borderRadius.md};
    overflow: hidden;
  }
`;

const NavItem = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  position: relative;
  
  @media (max-width: ${theme.breakpoints.md}) {
    height: auto;
    width: 100%;
  }
`;

const NavLink = styled(Link)`
  color: ${theme.colors.primary.contrast} !important;
  font-weight: ${theme.typography.fontWeight.medium};
  padding: 0 0.75rem;
  height: 100%;
  display: flex;
  align-items: center;
  transition: ${theme.transitions.default};
  position: relative;
  text-decoration: none;
  font-size: ${theme.typography.fontSize.sm}; /* Tamaño reducido para optimizar espacio */
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  &.active {
    background-color: rgba(255, 255, 255, 0.15);
    font-weight: ${theme.typography.fontWeight.semibold};
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 3px;
      background-color: ${theme.colors.secondary.main};
    }
  }
  
  @media (max-width: ${theme.breakpoints.md}) {
    padding: 0.75rem 1.25rem;
    width: 100%;
    
    &.active::after {
      height: 100%;
      width: 3px;
      top: 0;
    }
  }
`;

const LogoutButton = styled.button`
  color: ${theme.colors.primary.contrast};
  font-weight: ${theme.typography.fontWeight.medium};
  padding: 0 0.75rem;
  height: 100%;
  display: flex;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  transition: ${theme.transitions.default};
  font-size: ${theme.typography.fontSize.sm}; /* Tamaño reducido para optimizar espacio */
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  @media (max-width: ${theme.breakpoints.md}) {
    padding: 0.75rem 1.25rem;
    width: 100%;
    justify-content: flex-start;
  }
`;

const NavbarToggler = styled.button`
  background-color: transparent;
  border: none;
  color: ${theme.colors.primary.contrast};
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  display: none;
  
  @media (max-width: ${theme.breakpoints.md}) {
    display: block;
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
  margin-left: 0.5rem;
  
  @media (max-width: ${theme.breakpoints.md}) {
    height: auto;
    width: 100%;
    flex-direction: column;
    margin-left: 0;
  }
`;

const UserAvatar = styled.div`
  width: 28px;
  height: 28px;
  border-radius: ${theme.borderRadius.full};
  background-color: ${theme.colors.secondary.main};
  color: ${theme.colors.secondary.contrast};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${theme.typography.fontWeight.bold};
  margin-right: 0.5rem;
  font-size: ${theme.typography.fontSize.sm};
  
  @media (max-width: ${theme.breakpoints.md}) {
    display: none;
  }
`;

// Componente principal del navbar
const AppNavbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = () => {
    logout(); // Limpia los tokens y actualiza el estado
    navigate('/login'); // Redirige a la pantalla de login
    setIsOpen(false);
  };

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  const closeNavbar = () => {
    if (isOpen) setIsOpen(false);
  };

  // Obtener iniciales del usuario para el avatar
  const getUserInitials = () => {
    if (!user || !user.username) return 'U';
    return user.username.charAt(0).toUpperCase();
  };

  // Verificar si una ruta está activa
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <StyledNavbar expand="md" style={{ boxShadow: scrolled ? theme.shadows.lg : theme.shadows.md }}>
      <NavbarContainer>
        <NavbarBrand to="/" onClick={closeNavbar}>
          <BrandIcon>S</BrandIcon>
          StudySift
        </NavbarBrand>
        
        <NavbarToggler onClick={toggleNavbar}>
          <i className={isOpen ? "fas fa-times" : "fas fa-bars"}></i>
        </NavbarToggler>
        
        <NavMenu isOpen={isOpen}>
          <NavItem>
            <NavLink 
              to="/" 
              className={isActive('/') && location.pathname === '/' ? 'active' : ''} 
              onClick={closeNavbar}
            >
              <i className="fas fa-home" style={{ marginRight: '0.25rem' }}></i>
              Inicio
            </NavLink>
          </NavItem>
          
          {isAuthenticated ? (
            <>
              <NavItem>
                <NavLink 
                  to="/upload" 
                  className={isActive('/upload') ? 'active' : ''} 
                  onClick={closeNavbar}
                >
                  <i className="fas fa-upload" style={{ marginRight: '0.25rem' }}></i>
                  Subir PDF/PPTX
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink 
                  to="/files" 
                  className={isActive('/files') || isActive('/text') || isActive('/loading') || isActive('/dates') ? 'active' : ''} 
                  onClick={closeNavbar}
                >
                  <i className="fas fa-file-alt" style={{ marginRight: '0.25rem' }}></i>
                  Archivos
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink 
                  to="/calendar" 
                  className={isActive('/calendar') ? 'active' : ''} 
                  onClick={closeNavbar}
                >
                  <i className="fas fa-calendar-alt" style={{ marginRight: '0.25rem' }}></i>
                  Calendario
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink 
                  to="/asignaturas" 
                  className={isActive('/asignaturas') || isActive('/editar-asignatura') ? 'active' : ''} 
                  onClick={closeNavbar}
                >
                  <i className="fas fa-book" style={{ marginRight: '0.25rem' }}></i>
                  Asignaturas
                </NavLink>
              </NavItem>
              
              <UserSection>
                <UserAvatar>{getUserInitials()}</UserAvatar>
                <LogoutButton onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt" style={{ marginRight: '0.25rem' }}></i>
                  Salir
                </LogoutButton>
              </UserSection>
            </>
          ) : (
            <>
              <NavItem>
                <NavLink 
                  to="/login" 
                  className={isActive('/login') || isActive('/auth/callback') ? 'active' : ''} 
                  onClick={closeNavbar}
                >
                  <i className="fas fa-sign-in-alt" style={{ marginRight: '0.25rem' }}></i>
                  Iniciar sesión
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink 
                  to="/register" 
                  className={isActive('/register') ? 'active' : ''} 
                  onClick={closeNavbar}
                >
                  <i className="fas fa-user-plus" style={{ marginRight: '0.25rem' }}></i>
                  Registrarse
                </NavLink>
              </NavItem>
            </>
          )}
        </NavMenu>
      </NavbarContainer>
    </StyledNavbar>
  );
};

export default AppNavbar;
