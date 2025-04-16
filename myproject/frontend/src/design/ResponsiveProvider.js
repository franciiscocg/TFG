import React from 'react';
import { createGlobalStyle } from 'styled-components';
import theme from './theme';

// Estilos globales responsivos usando styled-components
const GlobalStyles = createGlobalStyle`
  /* Importación de fuentes */
  ${theme.typography.fontImport}
  
  /* Estilos base */
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  html, body {
    font-family: ${theme.typography.fontFamily.primary};
    font-size: 16px;
    line-height: ${theme.typography.lineHeight.normal};
    color: ${theme.colors.text.primary};
    background-color: ${theme.colors.background.default};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
  }
  
  /* Ajustes de tipografía responsiva */
  h1, h2, h3, h4, h5, h6 {
    margin-bottom: 0.5rem;
    font-weight: ${theme.typography.fontWeight.bold};
    line-height: ${theme.typography.lineHeight.tight};
  }
  
  h1 {
    font-size: ${theme.typography.fontSize['3xl']};
    font-family: ${theme.typography.fontFamily.secondary};
  }
  
  h2 {
    font-size: ${theme.typography.fontSize['2xl']};
    font-family: ${theme.typography.fontFamily.secondary};
  }
  
  h3 {
    font-size: ${theme.typography.fontSize.xl};
    font-family: ${theme.typography.fontFamily.secondary};
  }
  
  h4 {
    font-size: ${theme.typography.fontSize.lg};
    font-family: ${theme.typography.fontFamily.primary};
  }
  
  h5 {
    font-size: ${theme.typography.fontSize.md};
    font-family: ${theme.typography.fontFamily.primary};
  }
  
  h6 {
    font-size: ${theme.typography.fontSize.base};
    font-family: ${theme.typography.fontFamily.primary};
  }
  
  p {
    margin-bottom: 1rem;
  }
  
  a {
    color: ${theme.colors.primary.main};
    text-decoration: none;
    transition: ${theme.transitions.default};
  }
  
  a:hover {
    color: ${theme.colors.primary.light};
  }
  
  /* Media queries para tipografía responsiva */
  @media (max-width: ${theme.breakpoints.md}) {
    html, body {
      font-size: 15px;
    }
    
    h1 {
      font-size: ${theme.typography.fontSize['2xl']};
    }
    
    h2 {
      font-size: ${theme.typography.fontSize.xl};
    }
    
    h3 {
      font-size: ${theme.typography.fontSize.lg};
    }
  }
  
  @media (max-width: ${theme.breakpoints.sm}) {
    html, body {
      font-size: 14px;
    }
    
    h1 {
      font-size: ${theme.typography.fontSize.xl};
    }
    
    h2 {
      font-size: ${theme.typography.fontSize.lg};
    }
    
    h3 {
      font-size: ${theme.typography.fontSize.md};
    }
    
    p {
      margin-bottom: 0.75rem;
    }
  }
  
  /* Contenedor principal responsivo */
  .container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 ${theme.spacing.md};
  }
  
  @media (max-width: ${theme.breakpoints.md}) {
    .container {
      padding: 0 ${theme.spacing.sm};
    }
  }
  
  /* Ajustes para pantallas táctiles */
  @media (hover: none) {
    a:hover, button:hover {
      /* Evitar efectos hover en dispositivos táctiles */
      transform: none !important;
    }
    
    /* Aumentar áreas táctiles */
    button, 
    [role="button"],
    input[type="submit"],
    input[type="reset"],
    input[type="button"] {
      min-height: 44px;
      min-width: 44px;
    }
    
    /* Aumentar espaciado para elementos interactivos */
    .touch-friendly {
      padding: ${theme.spacing.md} !important;
    }
  }
  
  /* Animaciones */
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
  
  .animate-fadeIn { animation: fadeIn 0.3s ease-in-out; }
  .animate-slideUp { animation: slideUp 0.4s ease-out; }
  .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
  
  /* Ajustes para accesibilidad */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
  
  /* Ajustes para impresión */
  @media print {
    body {
      background-color: white;
      color: black;
    }
    
    .no-print {
      display: none !important;
    }
    
    a {
      text-decoration: underline;
      color: black;
    }
    
    .container {
      max-width: 100%;
      padding: 0;
    }
  }
`;

// Componente que aplica los estilos globales
const ResponsiveProvider = ({ children }) => {
  return (
    <>
      <GlobalStyles />
      {children}
    </>
  );
};

export default ResponsiveProvider;
