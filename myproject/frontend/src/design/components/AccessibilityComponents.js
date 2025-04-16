import React from 'react';
import styled from 'styled-components';
import theme from '../theme';

// Componentes para mejorar la accesibilidad
const SkipLink = styled.a`
  position: absolute;
  top: -40px;
  left: 0;
  background: ${theme.colors.primary.main};
  color: ${theme.colors.primary.contrast};
  padding: 8px;
  z-index: 9999;
  transition: top 0.3s;
  
  &:focus {
    top: 0;
  }
`;

// Componente para mejorar el contraste y legibilidad
const AccessibleText = styled.span`
  color: ${props => props.highContrast ? theme.colors.text.highContrast : 'inherit'};
  font-size: ${props => props.increasedSize ? 'calc(100% + 2px)' : 'inherit'};
  font-weight: ${props => props.increasedWeight ? theme.typography.fontWeight.medium : 'inherit'};
  letter-spacing: ${props => props.increasedSpacing ? '0.01em' : 'inherit'};
`;

// Componente para etiquetas de formulario accesibles
const AccessibleLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
  
  .required-mark {
    color: ${theme.colors.accent.error};
    margin-left: 0.25rem;
  }
  
  .field-description {
    display: block;
    font-size: ${theme.typography.fontSize.sm};
    color: ${theme.colors.text.secondary};
    margin-top: 0.25rem;
  }
`;

// Componente para mensajes de error accesibles
const AccessibleErrorMessage = styled.div`
  color: ${theme.colors.accent.error};
  font-size: ${theme.typography.fontSize.sm};
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  i {
    font-size: 1rem;
  }
`;

// Componente para focus visible mejorado
const FocusableElement = styled.div`
  &:focus-within {
    outline: 2px solid ${theme.colors.primary.main};
    outline-offset: 2px;
  }
`;

// Componente para optimizar la carga visual con lazy loading
const LazyLoadContainer = styled.div`
  min-height: ${props => props.height || '200px'};
  width: 100%;
  background-color: ${theme.colors.background.alt};
  border-radius: ${theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  
  &.loaded {
    background-color: transparent;
  }
  
  .placeholder {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, ${theme.colors.background.alt} 0%, ${theme.colors.background.paper} 50%, ${theme.colors.background.alt} 100%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    
    @keyframes shimmer {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }
  }
  
  .content {
    opacity: 0;
    transition: opacity 0.3s ease;
    width: 100%;
    height: 100%;
    
    &.visible {
      opacity: 1;
    }
  }
`;

// Componente para mejorar la accesibilidad de formularios
const AccessibleForm = ({ children, onSubmit, ariaLabel, ...props }) => {
  return (
    <form 
      onSubmit={onSubmit} 
      aria-label={ariaLabel || "Formulario"}
      noValidate
      {...props}
    >
      {children}
    </form>
  );
};

// Componente para botones accesibles
const AccessibleButton = styled.button`
  padding: ${props => props.size === 'small' ? '0.5rem 0.75rem' : props.size === 'large' ? '1rem 1.5rem' : '0.75rem 1.25rem'};
  font-size: ${props => props.size === 'small' ? theme.typography.fontSize.sm : props.size === 'large' ? theme.typography.fontSize.lg : theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  background: ${props => props.variant === 'secondary' ? theme.colors.secondary.main : props.variant === 'outline' ? 'transparent' : theme.colors.primary.main};
  color: ${props => props.variant === 'outline' ? theme.colors.primary.main : theme.colors.primary.contrast};
  border: ${props => props.variant === 'outline' ? `1px solid ${theme.colors.primary.main}` : 'none'};
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  transition: ${theme.transitions.default};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;
  
  &:hover {
    background: ${props => props.variant === 'secondary' ? theme.colors.secondary.light : props.variant === 'outline' ? theme.colors.primary.main + '10' : theme.colors.primary.light};
    color: ${props => props.variant === 'outline' && props.hover === 'fill' ? theme.colors.primary.contrast : props.variant === 'outline' ? theme.colors.primary.main : theme.colors.primary.contrast};
  }
  
  &:focus {
    outline: 2px solid ${props => props.variant === 'secondary' ? theme.colors.secondary.main : theme.colors.primary.main};
    outline-offset: 2px;
  }
  
  &:active {
    transform: translateY(1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
  }
  
  /* Efecto de onda al hacer clic */
  .ripple {
    position: absolute;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.4);
    transform: scale(0);
    animation: ripple 0.6s linear;
    
    @keyframes ripple {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
  }
`;

// Componente para optimizar la carga de imágenes
const OptimizedImage = ({ src, alt, width, height, lazy = true, placeholder, ...props }) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isError, setIsError] = React.useState(false);
  const imgRef = React.useRef(null);
  
  React.useEffect(() => {
    if (lazy && imgRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target;
              img.src = src;
              observer.unobserve(img);
            }
          });
        },
        { rootMargin: '100px' }
      );
      
      observer.observe(imgRef.current);
      
      return () => {
        if (imgRef.current) {
          observer.unobserve(imgRef.current);
        }
      };
    }
  }, [src, lazy]);
  
  const handleLoad = () => {
    setIsLoaded(true);
  };
  
  const handleError = () => {
    setIsError(true);
  };
  
  return (
    <LazyLoadContainer height={height} className={isLoaded ? 'loaded' : ''}>
      {!isLoaded && <div className="placeholder"></div>}
      
      <div className={`content ${isLoaded ? 'visible' : ''}`}>
        <img
          ref={imgRef}
          src={lazy ? placeholder || 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==' : src}
          alt={alt}
          width={width}
          height={height}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
        
        {isError && (
          <div style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.colors.background.alt,
            color: theme.colors.text.secondary,
            padding: '1rem'
          }}>
            <div style={{ textAlign: 'center' }}>
              <i className="fas fa-image" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}></i>
              <p>No se pudo cargar la imagen</p>
            </div>
          </div>
        )}
      </div>
    </LazyLoadContainer>
  );
};

// Componente para crear un botón con efecto de onda al hacer clic
const RippleButton = ({ children, ...props }) => {
  const [ripples, setRipples] = React.useState([]);
  
  const addRipple = (e) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ripple = {
      key: Date.now(),
      style: {
        left: `${x}px`,
        top: `${y}px`,
      },
    };
    
    setRipples([...ripples, ripple]);
    
    // Limpiar ripples después de la animación
    setTimeout(() => {
      setRipples(prevRipples => prevRipples.filter(r => r.key !== ripple.key));
    }, 600);
  };
  
  return (
    <AccessibleButton {...props} onClick={(e) => { addRipple(e); props.onClick && props.onClick(e); }}>
      {children}
      {ripples.map(ripple => (
        <span key={ripple.key} className="ripple" style={ripple.style} />
      ))}
    </AccessibleButton>
  );
};

export {
  SkipLink,
  AccessibleText,
  AccessibleLabel,
  AccessibleErrorMessage,
  FocusableElement,
  LazyLoadContainer,
  AccessibleForm,
  AccessibleButton,
  OptimizedImage,
  RippleButton
};
