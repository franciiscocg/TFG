import React from 'react';
import styled from 'styled-components';
import theme from '../theme';

// Componente para optimizar la carga inicial
const LazyLoadWrapper = styled.div`
  min-height: ${props => props.height || 'auto'};
  width: 100%;
  position: relative;
`;

// Componente para cargar componentes bajo demanda
const LazyLoadComponent = ({ children, height, placeholder, delay = 300 }) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, delay);

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [delay]);

  return (
    <LazyLoadWrapper ref={ref} height={height}>
      {(isLoaded && isVisible) ? children : placeholder || (
        <div style={{
          height: height || '200px',
          width: '100%',
          backgroundColor: theme.colors.background.alt,
          borderRadius: theme.borderRadius.md,
          animation: 'pulse 1.5s infinite ease-in-out',
        }} />
      )}
    </LazyLoadWrapper>
  );
};

// Componente para precarga de recursos críticos
const ResourcePreloader = () => {
  React.useEffect(() => {
    // Precarga de fuentes
    const fontPreloadLinks = [
      { href: 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap', as: 'style' },
      { href: 'https://fonts.googleapis.com/css2?family=Fraunces:wght@400;500;600;700;800&display=swap', as: 'style' }
    ];

    // Precarga de iconos críticos
    const iconPreloadLinks = [
      { href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/webfonts/fa-solid-900.woff2', as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' }
    ];

    // Crear y añadir enlaces de precarga al head
    [...fontPreloadLinks, ...iconPreloadLinks].forEach(link => {
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      Object.entries(link).forEach(([key, value]) => {
        preloadLink[key] = value;
      });
      document.head.appendChild(preloadLink);
    });

    // Limpiar al desmontar
    return () => {
      document.querySelectorAll('link[rel="preload"]').forEach(link => {
        document.head.removeChild(link);
      });
    };
  }, []);

  return null;
};

// Componente para optimizar la carga de imágenes con blur-up
const ProgressiveImage = ({ src, placeholderSrc, alt, ...props }) => {
  const [imgSrc, setImgSrc] = React.useState(placeholderSrc || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlMWU1ZWIiLz48L3N2Zz4=');
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setImgSrc(src);
      setIsLoaded(true);
    };
  }, [src]);

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <img
        src={imgSrc}
        alt={alt}
        style={{
          filter: isLoaded ? 'none' : 'blur(10px)',
          transition: 'filter 0.3s ease-out',
          width: '100%',
          height: 'auto'
        }}
        {...props}
      />
    </div>
  );
};

// Componente para optimizar la carga de listas largas
const VirtualizedList = ({ items, renderItem, itemHeight, containerHeight, overscan = 5 }) => {
  const [scrollTop, setScrollTop] = React.useState(0);
  const containerRef = React.useRef(null);

  const handleScroll = () => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  };

  // Calcular qué elementos son visibles
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
  );

  // Elementos visibles
  const visibleItems = items.slice(startIndex, endIndex + 1);

  // Estilo para posicionar los elementos
  const innerHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  return (
    <div
      ref={containerRef}
      style={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative'
      }}
      onScroll={handleScroll}
    >
      <div
        style={{
          height: innerHeight,
          position: 'relative'
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            transform: `translateY(${offsetY}px)`
          }}
        >
          {visibleItems.map((item, index) => (
            <div key={startIndex + index} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Componente para optimizar la carga de datos
const DataLoader = ({ children, loadData, dependencies = [], loadingComponent }) => {
  const [data, setData] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const fetchData = async () => {
      try {
        const result = await loadData();
        if (isMounted) {
          setData(result);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  if (isLoading) {
    return loadingComponent || (
      <div style={{
        padding: '2rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{
          width: '3rem',
          height: '3rem',
          borderRadius: '50%',
          border: `4px solid ${theme.colors.background.alt}`,
          borderTopColor: theme.colors.primary.main,
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '2rem',
        backgroundColor: 'rgba(244, 67, 54, 0.1)',
        color: theme.colors.accent.error,
        borderRadius: theme.borderRadius.md,
        textAlign: 'center'
      }}>
        <p>Error al cargar los datos: {error.message}</p>
        <button
          onClick={() => setIsLoading(true)}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: theme.colors.primary.main,
            color: theme.colors.primary.contrast,
            border: 'none',
            borderRadius: theme.borderRadius.md,
            cursor: 'pointer'
          }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  return children(data);
};

// Componente para optimizar la carga de scripts externos
const ScriptLoader = ({ src, onLoad, onError }) => {
  React.useEffect(() => {
    // Verificar si el script ya existe
    const existingScript = document.querySelector(`script[src="${src}"]`);
    
    if (existingScript) {
      if (onLoad) onLoad();
      return;
    }
    
    // Crear nuevo script
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    
    // Eventos
    script.onload = () => {
      if (onLoad) onLoad();
    };
    
    script.onerror = () => {
      if (onError) onError();
    };
    
    // Añadir al documento
    document.body.appendChild(script);
    
    // Limpiar al desmontar
    return () => {
      // No eliminamos scripts externos para evitar problemas con otras partes de la aplicación
    };
  }, [src, onLoad, onError]);
  
  return null;
};

export {
  LazyLoadComponent,
  ResourcePreloader,
  ProgressiveImage,
  VirtualizedList,
  DataLoader,
  ScriptLoader
};
