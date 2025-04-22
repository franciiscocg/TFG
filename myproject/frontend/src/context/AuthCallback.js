// src/components/AuthCallback.js
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext'; // Tu hook de contexto

function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation(); // Hook para obtener info de la URL
  const { login } = useAuth(); // Obtén la función login de tu contexto

  useEffect(() => {
    // Parsea los parámetros de búsqueda de la URL actual
    const params = new URLSearchParams(location.search);
    const accessToken = params.get('access_token');

    if (accessToken) {
      console.log("AuthCallback: Access token received.");
      // Llama a la función login de tu contexto para guardar el token
      // en localStorage y actualizar el estado isAuthenticated
      login(accessToken);
      
      // Redirige al usuario a la página principal (o dashboard) después del login
      // Usa replace: true para que el callback no quede en el historial del navegador
      navigate('/', { replace: true });

    } else {
      // Si no hay access token, algo falló. Redirige a la página de login.
      console.error("AuthCallback: No access token found in URL parameters.");
      navigate('/login', { replace: true });
    }

    // Ejecuta este efecto solo una vez al montar el componente
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Dependencias vacías para que se ejecute solo al montar

  // Muestra algo mientras procesa
  return <div>Verificando autenticación...</div>;
}

export default AuthCallback;