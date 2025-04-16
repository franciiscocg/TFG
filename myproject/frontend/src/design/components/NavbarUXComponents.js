import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import theme from '../theme';

// Animaciones para mejorar la experiencia del navbar
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideDown = keyframes`
  from { transform: translateY(-10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

// Componente para mejorar la experiencia del usuario en el navbar
const NavbarUXEnhancer = ({ children, isScrolled }) => {
  return (
    <div className={`navbar-ux-container ${isScrolled ? 'scrolled' : ''}`}>
      {children}
    </div>
  );
};

// Componente para el indicador de página activa
const ActivePageIndicator = styled.span`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background-color: ${theme.colors.secondary.main};
  transition: all 0.3s ease;
  animation: ${fadeIn} 0.3s ease;
  
  @media (max-width: ${theme.breakpoints.md}) {
    width: 3px !important;
    height: 100% !important;
    left: 0;
    top: 0;
  }
`;

// Componente para el menú desplegable con animación mejorada
const AnimatedDropdownMenu = styled.div`
  animation: ${slideDown} 0.3s ease;
  transform-origin: top center;
  box-shadow: ${theme.shadows.lg};
  border-radius: ${theme.borderRadius.md};
  overflow: hidden;
  
  @media (max-width: ${theme.breakpoints.md}) {
    width: 100%;
    margin-top: 0.5rem;
  }
`;

// Componente para el botón de hamburguesa animado
const AnimatedHamburger = styled.button`
  background: transparent;
  border: none;
  width: 40px;
  height: 40px;
  position: relative;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  
  span {
    display: block;
    width: 24px;
    height: 2px;
    background-color: ${theme.colors.primary.contrast};
    position: relative;
    transition: background-color 0.3s ease;
    
    &:before, &:after {
      content: '';
      display: block;
      width: 24px;
      height: 2px;
      background-color: ${theme.colors.primary.contrast};
      position: absolute;
      transition: all 0.3s ease;
    }
    
    &:before {
      top: -6px;
    }
    
    &:after {
      bottom: -6px;
    }
  }
  
  &.open {
    span {
      background-color: transparent;
      
      &:before {
        transform: rotate(45deg);
        top: 0;
      }
      
      &:after {
        transform: rotate(-45deg);
        bottom: 0;
      }
    }
  }
`;

// Componente para el avatar de usuario con efecto de hover
const EnhancedUserAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: ${theme.borderRadius.full};
  background-color: ${theme.colors.secondary.main};
  color: ${theme.colors.secondary.contrast};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${theme.typography.fontWeight.bold};
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: ${theme.shadows.md};
  }
  
  @media (max-width: ${theme.breakpoints.md}) {
    display: none;
  }
`;

// Componente para el menú de usuario desplegable
const UserDropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background-color: ${theme.colors.background.paper};
  border-radius: ${theme.borderRadius.md};
  box-shadow: ${theme.shadows.lg};
  min-width: 200px;
  z-index: 1000;
  overflow: hidden;
  animation: ${slideDown} 0.3s ease;
  
  .user-menu-header {
    padding: 1rem;
    background-color: ${theme.colors.primary.main};
    color: ${theme.colors.primary.contrast};
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  .user-menu-items {
    padding: 0.5rem 0;
    
    .user-menu-item {
      padding: 0.75rem 1rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: ${theme.colors.text.primary};
      transition: all 0.2s ease;
      cursor: pointer;
      
      &:hover {
        background-color: ${theme.colors.background.alt};
      }
      
      &.logout {
        color: ${theme.colors.accent.error};
        border-top: 1px solid ${theme.colors.border.light};
        margin-top: 0.5rem;
      }
    }
  }
`;

// Hook personalizado para manejar el scroll del navbar
const useNavbarScroll = (threshold = 10) => {
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > threshold) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [threshold]);
  
  return scrolled;
};

// Hook personalizado para manejar el cierre del menú al hacer clic fuera
const useOutsideClick = (ref, callback) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, callback]);
};

// Componente para el botón de hamburguesa animado
const HamburgerButton = ({ isOpen, toggle }) => {
  return (
    <AnimatedHamburger className={isOpen ? 'open' : ''} onClick={toggle}>
      <span></span>
    </AnimatedHamburger>
  );
};

// Componente para el menú de usuario
const UserMenu = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = React.useRef(null);
  
  useOutsideClick(menuRef, () => setIsOpen(false));
  
  // Obtener iniciales del usuario para el avatar
  const getUserInitials = () => {
    if (!user || !user.username) return 'U';
    return user.username.charAt(0).toUpperCase();
  };
  
  return (
    <div style={{ position: 'relative' }} ref={menuRef}>
      <EnhancedUserAvatar onClick={() => setIsOpen(!isOpen)}>
        {getUserInitials()}
      </EnhancedUserAvatar>
      
      {isOpen && (
        <UserDropdownMenu>
          <div className="user-menu-header">
            <EnhancedUserAvatar>{getUserInitials()}</EnhancedUserAvatar>
            <div>
              <div style={{ fontWeight: theme.typography.fontWeight.semibold }}>{user?.username || 'Usuario'}</div>
              <div style={{ fontSize: theme.typography.fontSize.sm }}>{user?.email || 'usuario@ejemplo.com'}</div>
            </div>
          </div>
          <div className="user-menu-items">
            <div className="user-menu-item">
              <i className="fas fa-user"></i>
              Mi perfil
            </div>
            <div className="user-menu-item">
              <i className="fas fa-cog"></i>
              Configuración
            </div>
            <div className="user-menu-item logout" onClick={onLogout}>
              <i className="fas fa-sign-out-alt"></i>
              Cerrar sesión
            </div>
          </div>
        </UserDropdownMenu>
      )}
    </div>
  );
};

export {
  NavbarUXEnhancer,
  ActivePageIndicator,
  AnimatedDropdownMenu,
  HamburgerButton,
  UserMenu,
  useNavbarScroll,
  useOutsideClick
};
