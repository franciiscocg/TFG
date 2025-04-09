import React from 'react';
import { Navbar, Nav, NavItem, NavLink } from 'reactstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import './AppNavbar.css';

const AppNavbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Limpia los tokens y actualiza el estado
    navigate('/login'); // Redirige a la pantalla de login
  };

  return (
    <Navbar color="dark" dark expand="md" className="app-navbar">
      <Nav navbar className="nav-horizontal">
        <NavItem>
          <NavLink tag={Link} to="/">Inicio</NavLink>
        </NavItem>
        {isAuthenticated ? (
          <>
            <NavItem>
              <NavLink tag={Link} to="/upload">Subir PDF</NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={Link} to="/files">Mis archivos</NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={Link} to="/calendar">Calendario</NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={Link} to="/asignaturas">Asignaturas</NavLink>
            </NavItem>
            <NavLink onClick={handleLogout} style={{ cursor: 'pointer' }}>
                Cerrar sesión
            </NavLink>
          </>
        ) : (
          <>
            <NavItem>
              <NavLink tag={Link} to="/login">Iniciar sesión</NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={Link} to="/register">Registrarse</NavLink>
            </NavItem>
          </>
        )}
      </Nav>
    </Navbar>
  );
};

export default AppNavbar;