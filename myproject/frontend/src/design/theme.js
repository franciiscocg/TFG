/**
 * Sistema de diseño para el rediseño de la interfaz académica
 * Combina colores, tipografía y otros elementos de diseño
 */

import colors from './colors';
import typography from './typography';

const theme = {
  colors,
  typography,
  
  // Espaciado consistente
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '2.5rem',  // 40px
    '3xl': '3rem',    // 48px
    '4xl': '4rem',    // 64px
  },
  
  // Bordes redondeados
  borderRadius: {
    none: '0',
    sm: '0.25rem',    // 4px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    full: '9999px',   // Completamente redondeado (círculo)
  },
  
  // Sombras
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  },
  
  // Transiciones
  transitions: {
    default: 'all 0.3s ease',
    fast: 'all 0.15s ease',
    slow: 'all 0.5s ease',
  },
  
  // Breakpoints para diseño responsive
  breakpoints: {
    xs: '0px',
    sm: '600px',
    md: '900px',
    lg: '1200px',
    xl: '1536px',
  },
  
  // Estilos de componentes comunes
  components: {
    // Botones
    button: {
      primary: {
        backgroundColor: colors.primary.main,
        color: colors.primary.contrast,
        borderRadius: '0.5rem',
        padding: '0.75rem 1.5rem',
        fontWeight: typography.fontWeight.semibold,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        transition: 'all 0.3s ease',
        hover: {
          backgroundColor: colors.primary.light,
          transform: 'translateY(-2px)',
          boxShadow: '0 6px 10px -1px rgba(0, 0, 0, 0.1), 0 4px 6px -1px rgba(0, 0, 0, 0.06)',
        },
        active: {
          backgroundColor: colors.primary.dark,
          transform: 'translateY(0)',
        },
      },
      secondary: {
        backgroundColor: colors.secondary.main,
        color: colors.secondary.contrast,
        borderRadius: '0.5rem',
        padding: '0.75rem 1.5rem',
        fontWeight: typography.fontWeight.semibold,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        transition: 'all 0.3s ease',
        hover: {
          backgroundColor: colors.secondary.light,
          transform: 'translateY(-2px)',
          boxShadow: '0 6px 10px -1px rgba(0, 0, 0, 0.1), 0 4px 6px -1px rgba(0, 0, 0, 0.06)',
        },
        active: {
          backgroundColor: colors.secondary.dark,
          transform: 'translateY(0)',
        },
      },
      outline: {
        backgroundColor: 'transparent',
        color: colors.primary.main,
        borderRadius: '0.5rem',
        padding: '0.75rem 1.5rem',
        fontWeight: typography.fontWeight.semibold,
        border: `2px solid ${colors.primary.main}`,
        transition: 'all 0.3s ease',
        hover: {
          backgroundColor: colors.primary.main,
          color: colors.primary.contrast,
          transform: 'translateY(-2px)',
        },
        active: {
          backgroundColor: colors.primary.dark,
          borderColor: colors.primary.dark,
          color: colors.primary.contrast,
          transform: 'translateY(0)',
        },
      },
    },
    
    // Tarjetas
    card: {
      backgroundColor: colors.background.paper,
      borderRadius: '0.75rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      padding: '1.5rem',
      transition: 'all 0.3s ease',
      hover: {
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        transform: 'translateY(-4px)',
      },
    },
    
    // Inputs
    input: {
      backgroundColor: colors.background.paper,
      borderRadius: '0.5rem',
      border: `1px solid ${colors.border.medium}`,
      padding: '0.75rem 1rem',
      fontSize: typography.fontSize.base,
      transition: 'all 0.3s ease',
      focus: {
        borderColor: colors.primary.main,
        boxShadow: `0 0 0 3px ${colors.primary.main}25`,
      },
    },
    
    // Navegación
    navbar: {
      backgroundColor: colors.primary.main,
      color: colors.primary.contrast,
      height: '4rem',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
  },
  
  // Animaciones
  animations: {
    fadeIn: 'fade-in 0.3s ease-in-out',
    slideUp: 'slide-up 0.4s ease-out',
    pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  },
  
  // Estilos globales
  globalStyles: `
    ${typography.fontImport}
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    html, body {
      font-family: ${typography.fontFamily.primary};
      font-size: 16px;
      line-height: ${typography.lineHeight.normal};
      color: ${colors.text.primary};
      background-color: ${colors.background.default};
    }
    
    h1, h2, h3, h4, h5, h6 {
      margin-bottom: 0.5rem;
      font-weight: ${typography.fontWeight.bold};
      line-height: ${typography.lineHeight.tight};
    }
    
    h1 {
      font-size: ${typography.fontSize['3xl']};
      font-family: ${typography.fontFamily.secondary};
    }
    
    h2 {
      font-size: ${typography.fontSize['2xl']};
      font-family: ${typography.fontFamily.secondary};
    }
    
    h3 {
      font-size: ${typography.fontSize.xl};
      font-family: ${typography.fontFamily.secondary};
    }
    
    p {
      margin-bottom: 1rem;
    }
    
    a {
      color: ${colors.primary.main};
      text-decoration: none;
      transition: color 0.3s ease;
    }
    
    a:hover {
      color: ${colors.primary.light};
    }
    
    @keyframes fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slide-up {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
  `,
};

export default theme;
