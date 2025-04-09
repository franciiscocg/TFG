import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppNavbar from '../AppNavbar';
import '../App.css';

function FileList() {
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchFiles(page);
  }, [isAuthenticated, navigate, page]);

  const fetchFiles = async (pageNum) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8000/api/upload/list/?page=${pageNum}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (response.ok) {
        setFiles(result.results);
        setTotalCount(result.count);
        setNextPage(result.next);
        setPrevPage(result.previous);
      } else {
        setMessage('Error al cargar los archivos: ' + JSON.stringify(result));
      }
    } catch (error) {
      setMessage('Error al conectar con el servidor: ' + error.message);
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este archivo?')) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8000/api/upload/delete/${fileId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMessage('Archivo eliminado con éxito');
        fetchFiles(page);
      } else {
        const result = await response.json();
        setMessage('Error al eliminar el archivo: ' + JSON.stringify(result));
      }
    } catch (error) {
      setMessage('Error al conectar con el servidor: ' + error.message);
    }
  };

  const handleExtractText = async (fileId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8000/api/upload/${fileId}/extract/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (response.ok) {
        setMessage('Texto extraído con éxito');
        setFiles(files.map((file) =>
          file.id === fileId ? result.file : file
        ));
      } else {
        setMessage('Error al extraer el texto: ' + JSON.stringify(result));
      }
    } catch (error) {
      setMessage('Error al conectar con el servidor: ' + error.message);
    }
  };

  const handlePageChange = (direction) => {
    setPage((prev) => prev + direction);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="file-list-screen screen-container">
      <header className="screen-header">
        <h1>Mis Archivos Subidos</h1>
      </header>
      <div className="screen-body">
        {files.length > 0 ? (
          <>
            <ul className="file-list">
              {files.map((file) => (
                <li key={file.id}>
                  <div>
                    <a>{file.file.split('/').pop()}</a>
                    <span> (Subido el: {new Date(file.uploaded_at).toLocaleString()})</span>
                  </div>
                  <div className="button-group">
                    {file.text_file_url ? (
                      <Link to={`/text/${file.id}`}>
                        <button className="action-btn">Ver Texto</button>
                      </Link>
                    ) : (
                      <button 
                        className="action-btn extract-btn" 
                        onClick={() => handleExtractText(file.id)}
                      >
                        Extraer Texto
                      </button>
                    )}
                    {file.extracted_data && Object.keys(file.extracted_data).length > 0 && (
                      <Link to={`/dates/${file.id}`}>
                        <button className="action-btn data-btn">Ver Datos Extraídos</button>
                      </Link>
                    )}
                    <button 
                      className="action-btn delete-btn" 
                      onClick={() => handleDelete(file.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="pagination">
              <button disabled={!prevPage} onClick={() => handlePageChange(-1)}>
                Anterior
              </button>
              <span>Página {page} de {Math.ceil(totalCount / 5)}</span>
              <button disabled={!nextPage} onClick={() => handlePageChange(1)}>
                Siguiente
              </button>
            </div>
          </>
        ) : (
          <p>No has subido ningún archivo aún.</p>
        )}
        <Link to="/upload">
          <button>Subir un nuevo archivo</button>
        </Link>
        <Link to="/">
          <button>Volver al Inicio</button>
        </Link>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
}

export default FileList;