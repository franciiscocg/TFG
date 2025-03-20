import React from 'react';
import { Navbar, Nav, NavItem, NavLink } from 'reactstrap';

const AppNavbar = () => {
    return (
        <Navbar color="dark" dark expand="md">
            <Nav className="mr-auto" navbar>
                <NavItem>
                    <NavLink href="/">Home</NavLink>
                </NavItem>
                <NavItem>
                    <NavLink href="/login">login</NavLink>
                </NavItem>
            </Nav>
        </Navbar>
    );
};

export default AppNavbar;