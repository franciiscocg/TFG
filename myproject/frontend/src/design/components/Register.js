import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import theme from '../theme';

// Estilos usando styled-components
const RegisterContainer = styled.div`
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

const RegisterHeader = styled.header`
  background: ${theme.colors.gradient.secondary};
  width: 100%;
  max-width: 500px;
  padding: 2rem;
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
  text-align: center;
  margin-bottom: 1.5rem;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    max-width: 90%;
    padding: 1.5rem;
    margin-bottom: 1rem;
  }
`;

const HeaderTitle = styled.h1`
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.secondary.contrast};
  margin: 0;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    font-size: ${theme.typography.fontSize.xl};
  }
`;

const RegisterBody = styled.div`
  background-color: ${theme.colors.background.paper};
  width: 100%;
  max-width: 500px;
  padding: 2rem;
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
  display: flex;
  flex-direction: column;
  align-items: center;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    max-width: 90%;
    padding: 1.5rem;
  }
`;

const Form = styled.form`
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: ${theme.typography.fontSize.base};
  border: 1px solid ${theme.colors.border.medium};
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.background.paper};
  color: ${theme.colors.text.primary};
  transition: ${theme.transitions.default};
  
  &:focus {
    border-color: ${theme.colors.secondary.main};
    box-shadow: 0 0 0 3px ${theme.colors.secondary.main}25;
    outline: none;
  }
  
  &::placeholder {
    color: ${theme.colors.text.hint};
    opacity: 0.8;
  }
`;

const PrimaryButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.semibold};
  background: ${theme.colors.gradient.secondary};
  border: none;
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.secondary.contrast};
  cursor: pointer;
  margin-top: 0.5rem;
  transition: ${theme.transitions.default};
  box-shadow: ${theme.shadows.sm};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.md};
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const SecondaryButton = styled(PrimaryButton)`
  background: ${theme.colors.neutral.medium};
  margin-top: 0.75rem;
`;

const Message = styled.p`
  margin-top: 1.25rem;
  font-size: ${theme.typography.fontSize.md};
  text-align: center;
  padding: 0.75rem;
  border-radius: ${theme.borderRadius.md};
  width: 100%;
  max-width: 400px;
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

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const navigate = useNavigate();
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación básica
    if (password !== confirmPassword) {
      setMessage('Las contraseñas no coinciden');
      setMessageType('error');
      return;
    }
    
    const data = { username, email, password };

    try {
      const response = await fetch(`${backendUrl}/api/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage('Registro exitoso. Ahora puedes iniciar sesión.');
        setMessageType('success');
        
        // Limpia los campos
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        
        // Redirige después de un breve retraso
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setMessage('Error: ' + JSON.stringify(result));
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Error al conectar con el servidor: ' + error.message);
      setMessageType('error');
    }
  };

  return (
    <RegisterContainer>
      <RegisterHeader>
        <HeaderTitle>Registrarse</HeaderTitle>
      </RegisterHeader>
      <RegisterBody>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="username">Usuario:</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Crea un nombre de usuario"
              required
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="email">Correo electrónico:</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ingresa tu correo electrónico"
              required
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="password">Contraseña:</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Crea una contraseña"
              required
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="confirmPassword">Confirmar contraseña:</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirma tu contraseña"
              required
            />
          </FormGroup>
          <PrimaryButton type="submit">Registrarse</PrimaryButton>
          
          <Link to="/login" style={{ textDecoration: 'none', width: '100%', marginTop: '0.5rem' }}>
            <SecondaryButton type="button" style={{ background: theme.colors.primary.main }}>
              Volver a Iniciar Sesión
            </SecondaryButton>
          </Link>
          
          <Link to="/" style={{ textDecoration: 'none', width: '100%' }}>
            <SecondaryButton type="button">
              Volver al Inicio
            </SecondaryButton>
          </Link>
        </Form>
        {message && <Message data-type={messageType}>{message}</Message>}
      </RegisterBody>
    </RegisterContainer>
  );
}

export default Register;
