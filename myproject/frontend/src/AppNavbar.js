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
          <NavLink tag={Link} to="/">Home</NavLink>
        </NavItem>
        {isAuthenticated ? (
          <>
            <NavItem>
              <NavLink tag={Link} to="/upload">Upload</NavLink>
            </NavItem>
              <NavLink onClick={handleLogout} style={{ cursor: 'pointer' }}>
                Logout
            </NavLink>
            <NavItem>
              <NavLink tag={Link} to="/files">My Files</NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={Link} to="/calendar">Calendar</NavLink>
            </NavItem>
          </>
        ) : (
          <>
            <NavItem>
              <NavLink tag={Link} to="/login">Login</NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={Link} to="/register">Register</NavLink>
            </NavItem>
          </>
        )}
      </Nav>
    </Navbar>
  );
};

export default AppNavbar;