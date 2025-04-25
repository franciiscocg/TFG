import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Asegúrate que la ruta sea correcta
import styled, { keyframes } from 'styled-components';
import theme from '../theme'; // Asegúrate que la ruta sea correcta y que theme.js exista

// --- Estilos (Copiados del primer bloque) ---

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// Asumiendo que theme.js tiene una estructura similar a esta (ejemplo):
// const theme = {
//   colors: {
//     background: { default: '#f4f6f8', paper: '#ffffff', alt: '#e0e0e0' },
//     text: { primary: '#333333', secondary: '#666666' },
//     primary: { main: '#3f51b5', contrast: '#ffffff' },
//     secondary: { main: '#f50057', light: '#ff4081' },
//     border: { medium: '#cccccc' },
//     neutral: { light: '#e0e0e0', lighter: '#f5f5f5' },
//     gradient: { primary: 'linear-gradient(to right, #3f51b5, #5c6bc0)' },
//   },
//   borderRadius: { sm: '4px', md: '8px', lg: '12px' },
//   shadows: { sm: '0 1px 3px rgba(0,0,0,0.1)', md: '0 4px 6px rgba(0,0,0,0.1)' },
//   typography: {
//     fontFamily: { primary: 'Roboto, sans-serif', secondary: 'Montserrat, sans-serif' },
//     fontSize: { base: '1rem', md: '1.125rem', lg: '1.25rem', xl: '1.5rem', '2xl': '1.875rem' },
//     fontWeight: { regular: 400, medium: 500, semibold: 600, bold: 700 },
//   },
//   transitions: { default: 'all 0.3s ease-in-out' },
//   animations: { fadeIn: `${fadeIn} 0.5s ease-out` },
//   breakpoints: { sm: '640px', md: '768px', lg: '1024px' },
// };

const EditContainer = styled.div`
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: ${theme.colors.background.default};
  color: ${theme.colors.text.primary};
  box-sizing: border-box;
  padding-top: 6rem; /* Espacio para el navbar fijo si existe */
  padding-bottom: 2rem;
  animation: ${theme.animations.fadeIn};
`;

const EditHeader = styled.header`
  background: ${theme.colors.gradient.primary};
  width: 100%;
  max-width: 900px; /* Un poco más ancho para acomodar más info */
  padding: 1.5rem 2rem;
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;

  @media (max-width: ${theme.breakpoints.md}) {
    max-width: 90%;
    padding: 1.25rem 1.5rem;
    flex-direction: column;
    gap: 1rem;
  }
`;

const HeaderTitle = styled.h1`
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.primary.contrast};
  margin: 0;
  word-break: break-word; /* Para nombres largos */

  @media (max-width: ${theme.breakpoints.md}) {
    font-size: ${theme.typography.fontSize.xl};
    text-align: center;
  }
`;

const ActionButton = styled.button`
  padding: 0.75rem 1.25rem;
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  background: ${props => props.secondary ? theme.colors.secondary.main : 'rgba(255, 255, 255, 0.2)'};
  border: none;
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.primary.contrast};
  cursor: pointer;
  transition: ${theme.transitions.default};
  box-shadow: ${theme.shadows.sm};
  display: inline-flex; /* Cambiado a inline-flex */
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: ${props => props.secondary ? theme.colors.secondary.light : 'rgba(255, 255, 255, 0.3)'};
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.md};
  }

  &:active {
    transform: translateY(0);
  }

  i {
    font-size: 1rem;
  }
`;

const EditBody = styled.div`
  width: 100%;
  max-width: 900px; /* Coincidir con header */
  background-color: ${theme.colors.background.paper};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
  padding: 2rem;

  @media (max-width: ${theme.breakpoints.md}) {
    max-width: 90%;
    padding: 1.5rem;
  }
`;

const FormSection = styled.section`
  margin-bottom: 2.5rem;
  border-bottom: 1px solid ${theme.colors.border.medium};
  padding-bottom: 1.5rem;

  &:last-of-type {
    border-bottom: none;
    padding-bottom: 0;
    margin-bottom: 1rem; /* Menos espacio antes de los botones finales */
  }
`;

const SectionTitle = styled.h2`
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.primary.main};
  margin-top: 0;
  margin-bottom: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const FormLabel = styled.label`
  display: block;
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.medium};
  margin-bottom: 0.5rem;
  color: ${theme.colors.text.primary};
`;

const FormInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: ${theme.typography.fontSize.base};
  border: 1px solid ${theme.colors.border.medium};
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.background.alt};
  color: ${theme.colors.text.primary};
  transition: ${theme.transitions.default};
  box-sizing: border-box; /* Añadido */

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
    box-shadow: 0 0 0 2px ${theme.colors.primary.main}30; /* 30 es opacidad ~19% */
  }
`;

const FormTextarea = styled.textarea`
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: ${theme.typography.fontSize.base};
  border: 1px solid ${theme.colors.border.medium};
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.background.alt};
  color: ${theme.colors.text.primary};
  transition: ${theme.transitions.default};
  min-height: 100px; /* Ajustado */
  resize: vertical;
  box-sizing: border-box; /* Añadido */

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
    box-shadow: 0 0 0 2px ${theme.colors.primary.main}30;
  }
`;

const FormSelect = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: ${theme.typography.fontSize.base};
  border: 1px solid ${theme.colors.border.medium};
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.background.alt};
  color: ${theme.colors.text.primary};
  transition: ${theme.transitions.default};
  box-sizing: border-box; /* Añadido */

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
    box-shadow: 0 0 0 2px ${theme.colors.primary.main}30;
  }
`;

const ItemRow = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
  padding: 1rem;
  background-color: ${theme.colors.background.alt}50; /* Ligero fondo */
  border-radius: ${theme.borderRadius.md};

  & > * { /* Aplica a inputs/selects dentro del row */
    flex: 1;
    min-width: 100px; /* Evita que se encojan demasiado */
  }

  @media (max-width: ${theme.breakpoints.md}) {
    flex-direction: column;
    align-items: stretch;
    padding: 0.75rem;
  }
`;

const NewItemContainer = styled.div`
  margin-top: 1.5rem;
  padding: 1.5rem;
  border: 1px dashed ${theme.colors.border.medium};
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.background.paper};
`;

const NewItemTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.medium};
  margin-top: 0;
  margin-bottom: 1rem;
  color: ${theme.colors.text.secondary};
`;

// Botón pequeño para acciones inline (Agregar, Eliminar)
const InlineButton = styled.button`
  padding: 0.5rem 1rem;
  font-size: ${theme.typography.fontSize.base}; /* Un poco más pequeño */
  font-weight: ${theme.typography.fontWeight.medium};
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  transition: ${theme.transitions.default};
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;

  ${props => props.add && `
    background-color: ${theme.colors.primary.main}20; /* Tono claro de primario */
    color: ${theme.colors.primary.main};
    &:hover {
      background-color: ${theme.colors.primary.main}30;
    }
  `}

  ${props => props.delete && `
    background-color: ${theme.colors.secondary.main}20; /* Tono claro de secundario */
    color: ${theme.colors.secondary.main};
    margin-left: auto; /* Empuja a la derecha en flex row */
    flex-shrink: 0; /* Evita que se encoja */
    &:hover {
      background-color: ${theme.colors.secondary.main}30;
    }

    @media (max-width: ${theme.breakpoints.md}) {
       margin-left: 0; /* Centrado en columna */
       margin-top: 0.5rem;
       width: 100%;
       justify-content: center;
    }
  `}
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  border-top: 1px solid ${theme.colors.border.medium};
  padding-top: 1.5rem;

  @media (max-width: ${theme.breakpoints.sm}) {
    flex-direction: column;
  }
`;

const SubmitButton = styled.button`
  flex: 1;
  padding: 0.875rem;
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.semibold};
  background: ${theme.colors.gradient.primary};
  border: none;
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.primary.contrast};
  cursor: pointer;
  transition: ${theme.transitions.default};
  box-shadow: ${theme.shadows.sm};
  display: flex; /* Para alinear icono y texto */
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.md};
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  @media (max-width: ${theme.breakpoints.sm}) {
    width: 100%;
  }
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 0.875rem;
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.medium};
  background: ${theme.colors.neutral.light};
  border: none;
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.text.primary};
  cursor: pointer;
  transition: ${theme.transitions.default};

  &:hover {
    background: ${theme.colors.neutral.lighter};
  }

  @media (max-width: ${theme.breakpoints.sm}) {
    width: 100%;
  }
`;

const Message = styled.div`
  margin-top: 1.5rem; /* Más espacio arriba */
  margin-bottom: 1.5rem; /* Espacio abajo también */
  font-size: ${theme.typography.fontSize.md};
  text-align: center;
  padding: 1rem; /* Más padding */
  border-radius: ${theme.borderRadius.md};
  width: 100%;
  animation: ${fadeIn} 0.3s ease-out;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem; /* Más espacio para el icono */
  box-sizing: border-box;

  &:empty {
    display: none;
  }

  /* Iconos más grandes */
  i {
    font-size: 1.25rem;
  }

  &[data-type="error"] {
    background-color: rgba(244, 67, 54, 0.1);
    color: #d32f2f; /* Un rojo más oscuro */
    border: 1px solid rgba(244, 67, 54, 0.3);
  }

  &[data-type="success"] {
    background-color: rgba(76, 175, 80, 0.1);
    color: #388e3c; /* Un verde más oscuro */
    border: 1px solid rgba(76, 175, 80, 0.3);
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60vh; /* Más altura para centrar mejor */
`;

const Spinner = styled.div`
  width: 3.5rem; /* Más grande */
  height: 3.5rem;
  border-radius: 50%;
  border: 5px solid ${theme.colors.background.alt};
  border-top-color: ${theme.colors.primary.main};
  animation: ${spin} 1s linear infinite;
`;


// --- Componente React (Lógica del segundo bloque + JSX adaptado) ---

function AsignaturaEdit() {
  const { asignaturaNombre } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth(); // Asume que useAuth provee este booleano

  // Estado inicial más robusto para evitar errores de 'undefined'
  const initialAsignaturaData = {
    asignatura: { nombre: '', grado: '', departamento: '', universidad: '', condiciones_aprobado: '' },
    horarios: [],
    fechas: [],
    profesores: [],
  };

  const [asignaturaData, setAsignaturaData] = useState(initialAsignaturaData);
  const [newHorario, setNewHorario] = useState({ grupo: '', tipo: 'teoria', hora: '', dia:'Lunes', aula: '' });
  const [newFecha, setNewFecha] = useState({ titulo: '', fecha: '' });
  const [newProfesor, setNewProfesor] = useState({ nombre: '', despacho: '', enlace: '' });
  const [message, setMessage] = useState({ text: '', type: '' }); // Objeto para texto y tipo
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'; // URL del backend

  // Verificar autenticación
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login'); // Redirige si no está autenticado
    }
  }, [isAuthenticated, navigate]);

  // Cargar datos de la asignatura
  useEffect(() => {
    // Solo ejecuta si está autenticado y tenemos un nombre de asignatura
    if (!isAuthenticated || !asignaturaNombre) return;

    const fetchAsignatura = async () => {
      setLoading(true);
      setMessage({ text: '', type: '' }); // Limpiar mensajes previos
      try {
        const token = localStorage.getItem('accessToken');
        // Usamos el endpoint del segundo ejemplo para obtener todos los datos
        const response = await fetch(`${backendUrl}/api/ai/calendar/data/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({})); // Intenta parsear error
          throw new Error(`Error ${response.status}: ${errorData.detail || response.statusText || 'No se pudo obtener la lista de asignaturas'}`);
        }

        const result = await response.json();
        if (result.data) {
          // Buscamos la asignatura específica por nombre
          const asignatura = result.data.find(
            (item) => item.asignatura.nombre === asignaturaNombre
          );
          if (asignatura) {
            // Asegurarse de que todas las secciones existan, incluso si están vacías
            setAsignaturaData({
              asignatura: asignatura.asignatura || initialAsignaturaData.asignatura,
              horarios: asignatura.horarios || [],
              fechas: asignatura.fechas || [],
              profesores: asignatura.profesores || [],
            });
          } else {
            throw new Error('Asignatura no encontrada en los datos recibidos.');
          }
        } else {
          throw new Error('La respuesta del API no contiene la sección "data" esperada.');
        }
      } catch (error) {
        console.error("Error fetching asignatura:", error);
        setMessage({
          text: `Error al cargar datos: ${error.message}`,
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAsignatura();
  }, [isAuthenticated, asignaturaNombre, navigate]);
  // --- Handlers (Copiados y adaptados del segundo bloque) ---

  const handleDataChange = (field, value, section = 'asignatura', index = null) => {
    setMessage({ text: '', type: '' }); // Limpiar mensaje al cambiar
    setAsignaturaData(prev => {
      const newData = { ...prev };
      if (section === 'asignatura') {
        newData.asignatura = { ...newData.asignatura, [field]: value };
      } else if (index !== null && newData[section] && newData[section][index]) {
        // Clonar la sección array
        const newSectionArray = [...newData[section]];
        // Clonar el objeto dentro del array antes de modificarlo
        newSectionArray[index] = { ...newSectionArray[index], [field]: value };
        newData[section] = newSectionArray;
      }
      return newData;
    });
  };

  const addHorario = () => {
     if (!newHorario.grupo || !newHorario.hora) {
        setMessage({ text: 'Por favor, complete al menos Grupo y Hora para el nuevo horario.', type: 'error' });
        return;
     }
    setAsignaturaData(prev => ({
      ...prev,
      horarios: [...prev.horarios, newHorario],
    }));
    setNewHorario({ grupo: '', tipo: 'teoria', hora: '', dia: 'lunes', aula: '' }); 
    setMessage({ text: 'Horario añadido temporalmente. Guarda para confirmar.', type: 'success' });
  };

  const addFecha = () => {
    if (!newFecha.titulo || !newFecha.fecha) {
        setMessage({ text: 'Por favor, complete Título y Fecha para la nueva fecha.', type: 'error' });
        return;
    }
    setAsignaturaData(prev => ({
      ...prev,
      fechas: [...prev.fechas, newFecha],
    }));
    setNewFecha({ titulo: '', fecha: '' }); // Resetear
    setMessage({ text: 'Fecha añadida temporalmente. Guarda para confirmar.', type: 'success' });
  };

  const addProfesor = () => {
     if (!newProfesor.nombre) {
        setMessage({ text: 'Por favor, complete al menos el Nombre para el nuevo profesor.', type: 'error' });
        return;
     }
    setAsignaturaData(prev => ({
      ...prev,
      profesores: [...prev.profesores, newProfesor],
    }));
    setNewProfesor({ nombre: '', despacho: '', enlace: '' }); // Resetear
    setMessage({ text: 'Profesor añadido temporalmente. Guarda para confirmar.', type: 'success' });
  };

  const deleteItem = (section, index) => {
    setAsignaturaData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index),
    }));
    setMessage({ text: 'Elemento eliminado temporalmente. Guarda para confirmar.', type: 'success' });
  };

  const handleSave = async (e) => {
    e.preventDefault(); // Prevenir submit default del form
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8000/api/ai/asignaturas/${encodeURIComponent(asignaturaNombre)}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        // Enviamos el estado completo actual
        body: JSON.stringify(asignaturaData),
      });

      const result = await response.json().catch(() => ({})); // Intenta parsear respuesta

      if (!response.ok) {
          throw new Error(`Error ${response.status}: ${result.detail || JSON.stringify(result) || response.statusText || 'No se pudo guardar la asignatura'}`);
      }

      setMessage({
        text: 'Asignatura actualizada correctamente',
        type: 'success'
      });

      // Redirigir después de un breve retraso
      setTimeout(() => {
        navigate('/asignaturas'); // O a la vista de detalle si existe
      }, 1500);

    } catch (error) {
      console.error("Error saving asignatura:", error);
      setMessage({
        text: `Error al guardar: ${error.message}`,
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/asignaturas'); // Volver a la lista
  };

  // --- Renderizado ---

  if (!isAuthenticated) return null; // No renderiza nada si no está autenticado (ya se redirige en useEffect)

  if (loading) {
    return (
      <EditContainer>
        <LoadingSpinner>
          <Spinner />
        </LoadingSpinner>
      </EditContainer>
    );
  }

  // Si asignaturaData no se cargó correctamente (puede pasar si fetch falla y no se inicializa bien)
  if (!asignaturaData || !asignaturaData.asignatura) {
     return (
       <EditContainer>
          <EditHeader>
             <HeaderTitle>Error</HeaderTitle>
          </EditHeader>
          <EditBody>
            <Message data-type="error">
               <i className="fas fa-exclamation-triangle"></i>
               No se pudieron cargar los datos de la asignatura. {message.text}
            </Message>
             <ButtonGroup>
               <CancelButton type="button" onClick={handleCancel}>
                 Volver
               </CancelButton>
             </ButtonGroup>
          </EditBody>
       </EditContainer>
     )
  }

  return (
    <EditContainer>
      <EditHeader>
        <HeaderTitle>
          Editar {asignaturaData.asignatura?.nombre || 'Asignatura'}
        </HeaderTitle>
        <ActionButton onClick={handleCancel}>
          <i className="fas fa-arrow-left"></i>
          Volver
        </ActionButton>
      </EditHeader>

      <EditBody>
        {/* Mensaje Global */}
        {message.text && (
          <Message data-type={message.type}>
            <i className={message.type === 'error' ? 'fas fa-exclamation-circle' : 'fas fa-check-circle'}></i>
            {message.text}
          </Message>
        )}

        <form onSubmit={handleSave}>
          {/* Sección Datos Generales */}
          <FormSection>
            <SectionTitle>Datos Generales</SectionTitle>
            <FormGroup>
              <FormLabel htmlFor="nombre">Nombre de la asignatura</FormLabel>
              <FormInput
                type="text" id="nombre" name="nombre"
                value={asignaturaData.asignatura.nombre}
                onChange={(e) => handleDataChange('nombre', e.target.value)}
                required
              />
            </FormGroup>
            <FormGroup>
              <FormLabel htmlFor="grado">Grado</FormLabel>
              <FormInput
                type="text" id="grado" name="grado"
                value={asignaturaData.asignatura.grado}
                onChange={(e) => handleDataChange('grado', e.target.value)}
              />
            </FormGroup>
             <FormGroup>
              <FormLabel htmlFor="departamento">Departamento</FormLabel>
              <FormInput
                type="text" id="departamento" name="departamento"
                value={asignaturaData.asignatura.departamento}
                onChange={(e) => handleDataChange('departamento', e.target.value)}
              />
            </FormGroup>
             <FormGroup>
              <FormLabel htmlFor="universidad">Universidad</FormLabel>
              <FormInput
                type="text" id="universidad" name="universidad"
                value={asignaturaData.asignatura.universidad}
                onChange={(e) => handleDataChange('universidad', e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <FormLabel htmlFor="condiciones_aprobado">Condiciones de Aprobado</FormLabel>
              <FormTextarea
                id="condiciones_aprobado" name="condiciones_aprobado"
                value={asignaturaData.asignatura.condiciones_aprobado}
                onChange={(e) => handleDataChange('condiciones_aprobado', e.target.value)}
                rows="4"
              />
            </FormGroup>
          </FormSection>

          {/* Sección Horarios */}
          <FormSection>
            <SectionTitle>Horarios</SectionTitle>
            {asignaturaData.horarios?.map((horario, index) => (
              <ItemRow key={`horario-${index}`}>
                <FormInput
                  value={horario.grupo}
                  onChange={(e) => handleDataChange('grupo', e.target.value, 'horarios', index)}
                  placeholder="Grupo (Ej: A1)"
                />
                <FormSelect
                  value={horario.tipo}
                  onChange={(e) => handleDataChange('tipo', e.target.value, 'horarios', index)}
                >
                  <option value="teoria">Teoría</option>
                  <option value="practica">Práctica</option>
                  <option value="tutoria">Tutoría</option>
                  <option value="laboratorio">Laboratorio</option>
                  <option value="seminario">Seminario</option>
                </FormSelect>
                <FormInput
                  value={horario.hora}
                  onChange={(e) => handleDataChange('hora', e.target.value, 'horarios', index)}
                  placeholder="Hora (Ej: Lunes 10:00-12:00)"
                />
                <FormSelect
                  value={horario.dia}
                  onChange={(e) => handleDataChange('dia', e.target.value, 'horarios', index)}
                >
                  <option value="Lunes">Lunes</option>
                  <option value="Martes">Martes</option>
                  <option value="Miércoles">Miércoles</option>
                  <option value="Jueves">Jueves</option>
                  <option value="Viernes">Viernes</option>
                  <option value="Sábado">Sábado</option>
                  <option value="Domingo">Domingo</option>
                </FormSelect>
                <FormInput
                  value={horario.aula}
                  onChange={(e) => handleDataChange('aula', e.target.value, 'horarios', index)}
                  placeholder="Aula (Ej: B5)"
                />
                <InlineButton type="button" delete onClick={() => deleteItem('horarios', index)}>
                   <i className="fas fa-trash-alt"></i> Eliminar
                </InlineButton>
              </ItemRow>
            ))}
            <NewItemContainer>
              <NewItemTitle>Añadir Nuevo Horario</NewItemTitle>
              <ItemRow>
                 <FormInput
                  value={newHorario.grupo}
                  onChange={(e) => setNewHorario({ ...newHorario, grupo: e.target.value })}
                  placeholder="Grupo"
                />
                <FormSelect
                  value={newHorario.tipo}
                  onChange={(e) => setNewHorario({ ...newHorario, tipo: e.target.value })}
                >
                  <option value="teoria">Teoría</option>
                  <option value="practica">Práctica</option>
                  <option value="tutoria">Tutoría</option>
                  <option value="laboratorio">Laboratorio</option>
                   <option value="seminario">Seminario</option>
                </FormSelect>
                <FormInput
                  value={newHorario.hora}
                  onChange={(e) => setNewHorario({ ...newHorario, hora: e.target.value })}
                  placeholder="Hora"
                />
                <FormSelect
                  value={newHorario.dia}
                  onChange={(e) => setNewHorario({ ...newHorario, dia: e.target.value })}
                >
                  <option value="Lunes">Lunes</option>
                  <option value="Martes">Martes</option>
                  <option value="Miércoles">Miércoles</option>
                  <option value="Jueves">Jueves</option>
                  <option value="Viernes">Viernes</option>
                  <option value="Sábado">Sábado</option>
                  <option value="Domingo">Domingo</option>
                </FormSelect>
                <FormInput
                  value={newHorario.aula}
                  onChange={(e) => setNewHorario({ ...newHorario, aula: e.target.value })}
                  placeholder="Aula"
                />
                 <InlineButton type="button" add onClick={addHorario}>
                   <i className="fas fa-plus"></i> Añadir
                 </InlineButton>
              </ItemRow>
            </NewItemContainer>
          </FormSection>

          {/* Sección Fechas */}
          <FormSection>
             <SectionTitle>Fechas Importantes</SectionTitle>
              {asignaturaData.fechas?.map((fecha, index) => (
                <ItemRow key={`fecha-${index}`}>
                    <FormInput
                      value={fecha.titulo}
                      onChange={(e) => handleDataChange('titulo', e.target.value, 'fechas', index)}
                      placeholder="Título (Ej: Parcial 1)"
                      style={{ flex: 2 }} /* Más espacio para título */
                    />
                    <FormInput
                      type="date"
                      value={fecha.fecha}
                      onChange={(e) => handleDataChange('fecha', e.target.value, 'fechas', index)}
                      style={{ flex: 1 }}
                    />
                   <InlineButton type="button" delete onClick={() => deleteItem('fechas', index)}>
                      <i className="fas fa-trash-alt"></i> Eliminar
                   </InlineButton>
                </ItemRow>
              ))}
              <NewItemContainer>
                <NewItemTitle>Añadir Nueva Fecha</NewItemTitle>
                 <ItemRow>
                    <FormInput
                        value={newFecha.titulo}
                        onChange={(e) => setNewFecha({ ...newFecha, titulo: e.target.value })}
                        placeholder="Título"
                         style={{ flex: 2 }}
                    />
                    <FormInput
                        type="date"
                        value={newFecha.fecha}
                        onChange={(e) => setNewFecha({ ...newFecha, fecha: e.target.value })}
                        style={{ flex: 1 }}
                    />
                    <InlineButton type="button" add onClick={addFecha}>
                        <i className="fas fa-plus"></i> Añadir
                    </InlineButton>
                 </ItemRow>
              </NewItemContainer>
          </FormSection>

          {/* Sección Profesores */}
          <FormSection>
              <SectionTitle>Profesores</SectionTitle>
              {asignaturaData.profesores?.map((profesor, index) => (
                  <ItemRow key={`profesor-${index}`}>
                      <FormInput
                          value={profesor.nombre}
                          onChange={(e) => handleDataChange('nombre', e.target.value, 'profesores', index)}
                          placeholder="Nombre del Profesor"
                      />
                      <FormInput
                          value={profesor.despacho}
                          onChange={(e) => handleDataChange('despacho', e.target.value, 'profesores', index)}
                          placeholder="Despacho (Ej: D-101)"
                      />
                      <FormInput
                          type="url" /* Para mejor validación */
                          value={profesor.enlace}
                          onChange={(e) => handleDataChange('enlace', e.target.value, 'profesores', index)}
                          placeholder="Enlace (Web, email,...)"
                      />
                     <InlineButton type="button" delete onClick={() => deleteItem('profesores', index)}>
                         <i className="fas fa-trash-alt"></i> Eliminar
                     </InlineButton>
                  </ItemRow>
              ))}
              <NewItemContainer>
                  <NewItemTitle>Añadir Nuevo Profesor</NewItemTitle>
                   <ItemRow>
                      <FormInput
                          value={newProfesor.nombre}
                          onChange={(e) => setNewProfesor({ ...newProfesor, nombre: e.target.value })}
                          placeholder="Nombre"
                      />
                      <FormInput
                          value={newProfesor.despacho}
                          onChange={(e) => setNewProfesor({ ...newProfesor, despacho: e.target.value })}
                          placeholder="Despacho"
                      />
                      <FormInput
                           type="url"
                           value={newProfesor.enlace}
                           onChange={(e) => setNewProfesor({ ...newProfesor, enlace: e.target.value })}
                           placeholder="Enlace"
                      />
                      <InlineButton type="button" add onClick={addProfesor}>
                          <i className="fas fa-plus"></i> Añadir
                      </InlineButton>
                   </ItemRow>
              </NewItemContainer>
          </FormSection>

          {/* Botones Finales */}
          <ButtonGroup>
            <CancelButton type="button" onClick={handleCancel} disabled={saving}>
              Cancelar
            </CancelButton>
            <SubmitButton type="submit" disabled={saving || loading}>
              {saving ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Guardando...
                </>
              ) : (
                 <>
                  <i className="fas fa-save"></i>
                   Guardar Cambios
                 </>
              )}
            </SubmitButton>
          </ButtonGroup>
        </form>
      </EditBody>
    </EditContainer>
  );
}

export default AsignaturaEdit;