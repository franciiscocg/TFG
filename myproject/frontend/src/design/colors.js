/**
 * Paleta de colores para el rediseño de la interfaz académica
 * Basada en tendencias de diseño 2025 para entornos educativos
 */

const colors = {
  // Colores primarios
  primary: {
    main: '#1A5D8F',      // Azul académico profundo (Blue Willow adaptado)
    light: '#3A7DAF',     // Versión más clara para hover
    dark: '#0A4D7F',      // Versión más oscura para elementos activos
    contrast: '#FFFFFF',  // Color de texto sobre fondo primario
  },
  
  // Colores secundarios
  secondary: {
    main: '#E86A33',      // Naranja vibrante (Coral Serenade adaptado)
    light: '#FF8A53',     // Versión más clara para hover
    dark: '#D85A23',      // Versión más oscura para elementos activos
    contrast: '#FFFFFF',  // Color de texto sobre fondo secundario
  },
  
  // Colores de acento
  accent: {
    success: '#4CAF50',   // Verde para éxito
    warning: '#FFC107',   // Amarillo para advertencias (Glow Worm adaptado)
    error: '#F44336',     // Rojo para errores
    info: '#2196F3',      // Azul claro para información
  },
  
  // Colores neutros
  neutral: {
    white: '#FFFFFF',     // Blanco puro
    lightest: '#F5F7FA',  // Casi blanco (In The Cloud adaptado)
    lighter: '#E1E5EB',   // Gris muy claro
    light: '#C2C8D0',     // Gris claro
    medium: '#8F959E',    // Gris medio
    dark: '#4A4E54',      // Gris oscuro
    darker: '#292C31',    // Casi negro
    darkest: '#1A1D23',   // Fondo oscuro actual
  },
  
  // Colores para fondos y tarjetas
  background: {
    default: '#F5F7FA',   // Fondo principal claro (In The Cloud)
    paper: '#FFFFFF',     // Fondo de tarjetas y elementos elevados
    alt: '#EEF2F6',       // Fondo alternativo para secciones
  },
  
  // Colores para texto
  text: {
    primary: '#292C31',   // Texto principal sobre fondo claro
    secondary: '#4A4E54', // Texto secundario sobre fondo claro
    disabled: '#8F959E',  // Texto deshabilitado
    hint: '#8F959E',      // Texto de pistas
    light: '#FFFFFF',     // Texto sobre fondos oscuros
  },
  
  // Colores para bordes
  border: {
    light: '#E1E5EB',     // Bordes claros
    medium: '#C2C8D0',    // Bordes medios
  },
  
  // Colores para gradientes
  gradient: {
    primary: 'linear-gradient(135deg, #1A5D8F 0%, #3A7DAF 100%)',
    secondary: 'linear-gradient(135deg, #E86A33 0%, #FF8A53 100%)',
    accent: 'linear-gradient(135deg, #1A5D8F 0%, #E86A33 100%)',
  },
  
  // Colores para modo oscuro (mantiene compatibilidad con el diseño actual)
  dark: {
    background: '#1A1D23',
    paper: '#282C34',
    border: '#3A3E45',
    text: {
      primary: '#FFFFFF',
      secondary: '#C2C8D0',
    }
  },
};

export default colors;
