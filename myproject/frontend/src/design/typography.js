/**
 * Tipografías para el rediseño de la interfaz académica
 * Basada en tendencias de diseño 2025 para entornos educativos
 */

const typography = {
  // Fuentes principales
  fontFamily: {
    primary: "'Outfit', sans-serif",     // Sans-serif moderna y legible para textos principales
    secondary: "'Fraunces', serif",      // Serif elegante para títulos y encabezados
    monospace: "'JetBrains Mono', monospace", // Monoespaciada para código o datos técnicos
  },
  
  // Tamaños de fuente
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    md: '1.125rem',     // 18px
    lg: '1.25rem',      // 20px
    xl: '1.5rem',       // 24px
    '2xl': '1.875rem',  // 30px
    '3xl': '2.25rem',   // 36px
    '4xl': '3rem',      // 48px
    '5xl': '3.75rem',   // 60px
  },
  
  // Pesos de fuente
  fontWeight: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  
  // Altura de línea
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  
  // Espaciado entre letras
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
  
  // Estilos predefinidos para diferentes elementos
  styles: {
    h1: {
      fontFamily: "'Fraunces', serif",
      fontSize: '2.25rem',
      fontWeight: 700,
      lineHeight: 1.25,
      letterSpacing: '-0.025em',
    },
    h2: {
      fontFamily: "'Fraunces', serif",
      fontSize: '1.875rem',
      fontWeight: 700,
      lineHeight: 1.25,
      letterSpacing: '-0.025em',
    },
    h3: {
      fontFamily: "'Fraunces', serif",
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.375,
      letterSpacing: '-0.025em',
    },
    h4: {
      fontFamily: "'Outfit', sans-serif",
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.375,
      letterSpacing: 'normal',
    },
    h5: {
      fontFamily: "'Outfit', sans-serif",
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.375,
      letterSpacing: 'normal',
    },
    h6: {
      fontFamily: "'Outfit', sans-serif",
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
      letterSpacing: 'normal',
    },
    body1: {
      fontFamily: "'Outfit', sans-serif",
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: 'normal',
    },
    body2: {
      fontFamily: "'Outfit', sans-serif",
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: 'normal',
    },
    button: {
      fontFamily: "'Outfit', sans-serif",
      fontSize: '0.875rem',
      fontWeight: 600,
      lineHeight: 1.5,
      letterSpacing: '0.025em',
      textTransform: 'uppercase',
    },
    caption: {
      fontFamily: "'Outfit', sans-serif",
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: 'normal',
    },
    overline: {
      fontFamily: "'Outfit', sans-serif",
      fontSize: '0.75rem',
      fontWeight: 600,
      lineHeight: 1.5,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
    },
  },
  
  // Importación de fuentes
  fontImport: `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;500;600;700;800&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');
  `,
};

export default typography;
