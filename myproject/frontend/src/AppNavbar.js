import React from 'react';
import { Navbar, Nav, NavItem, NavLink } from 'reactstrap';
import { Link } from 'react-router-dom';
import './AppNavbar.css';

const AppNavbar = () => {
  return (
    <Navbar color="dark" dark expand="md" className="app-navbar">
      <Nav navbar className="nav-horizontal">
        <NavItem>
          <NavLink tag={Link} to="/">Home</NavLink>
        </NavItem>
        <NavItem>
          <NavLink tag={Link} to="/login">Login</NavLink>
        </NavItem>
        <NavItem>
          <NavLink tag={Link} to="/register">Register</NavLink>
        </NavItem>
      </Nav>
    </Navbar>
  );
};

export default AppNavbar;