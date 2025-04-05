import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../App.css';

function AsignaturaEdit() {
  const { asignaturaNombre } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [asignaturaData, setAsignaturaData] = useState(null);
  const [newHorario, setNewHorario] = useState({ grupo: '', tipo: 'teoria', hora: '', aula: '' });
  const [newFecha, setNewFecha] = useState({ titulo: '', fecha: '' });
  const [newProfesor, setNewProfesor] = useState({ nombre: '', despacho: '', enlace: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchAsignatura();
  }, [isAuthenticated, navigate, asignaturaNombre]);

  const fetchAsignatura = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8000/api/ai/calendar/data/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (response.ok && result.data) {
        const asignatura = result.data.find(
          (item) => item.asignatura.nombre === asignaturaNombre
        );
        if (asignatura) {
          setAsignaturaData(asignatura);
        } else {
          setMessage('Asignatura no encontrada.');
        }
      } else {
        setMessage('Error al cargar los datos: ' + JSON.stringify(result));
      }
    } catch (error) {
      setMessage('Error al conectar con el servidor: ' + error.message);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8000/api/ai/asignaturas/${asignaturaNombre}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(asignaturaData),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage('Cambios guardados con éxito');
      } else {
        setMessage('Error al guardar los cambios: ' + JSON.stringify(result));
      }
    } catch (error) {
      setMessage('Error al conectar con el servidor: ' + error.message);
    }
  };

  const addHorario = () => {
    setAsignaturaData({
      ...asignaturaData,
      horarios: [...asignaturaData.horarios, newHorario],
    });
    setNewHorario({ grupo: '', tipo: 'teoria', hora: '', aula: '' });
    setMessage('');
  };

  const addFecha = () => {
    setAsignaturaData({
      ...asignaturaData,
      fechas: [...asignaturaData.fechas, newFecha],
    });
    setNewFecha({ titulo: '', fecha: '' });
    setMessage('');
  };

  const addProfesor = () => {
    setAsignaturaData({
      ...asignaturaData,
      profesores: [...asignaturaData.profesores, newProfesor],
    });
    setNewProfesor({ nombre: '', despacho: '', enlace: '' });
    setMessage('');
  };

  const deleteItem = (section, index) => {
    const newSectionData = asignaturaData[section].filter((_, i) => i !== index);
    setAsignaturaData({ ...asignaturaData, [section]: newSectionData });
    setMessage('');
  };

  const handleDataChange = (field, value, section = 'asignatura', index = null) => {
    if (section === 'asignatura') {
      setAsignaturaData({
        ...asignaturaData,
        asignatura: { ...asignaturaData.asignatura, [field]: value },
      });
    } else if (index !== null) {
      const newSectionData = [...asignaturaData[section]];
      newSectionData[index][field] = value;
      setAsignaturaData({ ...asignaturaData, [section]: newSectionData });
    }
    setMessage('');
  };

  if (!isAuthenticated || !asignaturaData) return null;

  return (
    <div className="asignatura-edit-screen screen-container">
      <header className="screen-header">
        <h1>Editar {asignaturaData.asignatura.nombre}</h1>
      </header>
      <div className="screen-body">
        <div className="asignatura-form">
          {/* Datos Generales */}
          <section className="form-section">
            <h2>Datos Generales</h2>
            <label>Nombre</label>
            <input
              value={asignaturaData.asignatura.nombre}
              onChange={(e) => handleDataChange('nombre', e.target.value)}
            />
            <label>Grado</label>
            <input
              value={asignaturaData.asignatura.grado}
              onChange={(e) => handleDataChange('grado', e.target.value)}
            />
            <label>Departamento</label>
            <input
              value={asignaturaData.asignatura.departamento}
              onChange={(e) => handleDataChange('departamento', e.target.value)}
            />
            <label>Universidad</label>
            <input
              value={asignaturaData.asignatura.universidad}
              onChange={(e) => handleDataChange('universidad', e.target.value)}
            />
            <label>Condiciones de Aprobado</label>
            <textarea
              value={asignaturaData.asignatura.condiciones_aprobado}
              onChange={(e) => handleDataChange('condiciones_aprobado', e.target.value)}
              rows="4"
            />
          </section>

          {/* Horarios */}
          <section className="form-section">
            <h2>Horarios</h2>
            {asignaturaData.horarios.map((horario, index) => (
              <div key={index} className="item-row">
                <input
                  value={horario.grupo}
                  onChange={(e) => handleDataChange('grupo', e.target.value, 'horarios', index)}
                  placeholder="Grupo"
                />
                <select
                  value={horario.tipo}
                  onChange={(e) => handleDataChange('tipo', e.target.value, 'horarios', index)}
                >
                  <option value="teoria">Teoría</option>
                  <option value="practica">Práctica</option>
                  <option value="tutoria">Tutoría</option>
                </select>
                <input
                  value={horario.hora}
                  onChange={(e) => handleDataChange('hora', e.target.value, 'horarios', index)}
                  placeholder="Hora"
                />
                <input
                  value={horario.aula}
                  onChange={(e) => handleDataChange('aula', e.target.value, 'horarios', index)}
                  placeholder="Aula"
                />
                <button className="delete-btn" onClick={() => deleteItem('horarios', index)}>
                  Eliminar
                </button>
              </div>
            ))}
            <div className="new-item">
              <h3>Nuevo Horario</h3>
              <input
                value={newHorario.grupo}
                onChange={(e) => setNewHorario({ ...newHorario, grupo: e.target.value })}
                placeholder="Grupo"
              />
              <select
                value={newHorario.tipo}
                onChange={(e) => setNewHorario({ ...newHorario, tipo: e.target.value })}
              >
                <option value="teoria">Teoría</option>
                <option value="practica">Práctica</option>
                <option value="tutoria">Tutoría</option>
              </select>
              <input
                value={newHorario.hora}
                onChange={(e) => setNewHorario({ ...newHorario, hora: e.target.value })}
                placeholder="Hora"
              />
              <input
                value={newHorario.aula}
                onChange={(e) => setNewHorario({ ...newHorario, aula: e.target.value })}
                placeholder="Aula"
              />
              <button className="add-btn" onClick={addHorario}>
                Agregar Horario
              </button>
            </div>
          </section>

          {/* Fechas */}
          <section className="form-section">
            <h2>Fechas Importantes</h2>
            {asignaturaData.fechas.map((fecha, index) => (
              <div key={index} className="item-row">
                <input
                  value={fecha.titulo}
                  onChange={(e) => handleDataChange('titulo', e.target.value, 'fechas', index)}
                  placeholder="Título"
                />
                <input
                  type="date"
                  value={fecha.fecha}
                  onChange={(e) => handleDataChange('fecha', e.target.value, 'fechas', index)}
                />
                <button className="delete-btn" onClick={() => deleteItem('fechas', index)}>
                  Eliminar
                </button>
              </div>
            ))}
            <div className="new-item">
              <h3>Nueva Fecha</h3>
              <input
                value={newFecha.titulo}
                onChange={(e) => setNewFecha({ ...newFecha, titulo: e.target.value })}
                placeholder="Título"
              />
              <input
                type="date"
                value={newFecha.fecha}
                onChange={(e) => setNewFecha({ ...newFecha, fecha: e.target.value })}
              />
              <button className="add-btn" onClick={addFecha}>
                Agregar Fecha
              </button>
            </div>
          </section>

          {/* Profesores */}
          <section className="form-section">
            <h2>Profesores</h2>
            {asignaturaData.profesores.map((profesor, index) => (
              <div key={index} className="item-row">
                <input
                  value={profesor.nombre}
                  onChange={(e) => handleDataChange('nombre', e.target.value, 'profesores', index)}
                  placeholder="Nombre"
                />
                <input
                  value={profesor.despacho}
                  onChange={(e) => handleDataChange('despacho', e.target.value, 'profesores', index)}
                  placeholder="Despacho"
                />
                <input
                  value={profesor.enlace}
                  onChange={(e) => handleDataChange('enlace', e.target.value, 'profesores', index)}
                  placeholder="Enlace"
                />
                <button className="delete-btn" onClick={() => deleteItem('profesores', index)}>
                  Eliminar
                </button>
              </div>
            ))}
            <div className="new-item">
              <h3>Nuevo Profesor</h3>
              <input
                value={newProfesor.nombre}
                onChange={(e) => setNewProfesor({ ...newProfesor, nombre: e.target.value })}
                placeholder="Nombre"
              />
              <input
                value={newProfesor.despacho}
                onChange={(e) => setNewProfesor({ ...newProfesor, despacho: e.target.value })}
                placeholder="Despacho"
              />
              <input
                value={newProfesor.enlace}
                onChange={(e) => setNewProfesor({ ...newProfesor, enlace: e.target.value })}
                placeholder="Enlace"
              />
              <button className="add-btn" onClick={addProfesor}>
                Agregar Profesor
              </button>
            </div>
          </section>

          <button className="save-btn" onClick={handleSave}>
            Guardar Cambios
          </button>
        </div>
        {message && (
          <p data-message={message} className={message.includes('éxito') ? 'success' : 'error'}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default AsignaturaEdit;