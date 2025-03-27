import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppNavbar from '../AppNavbar';
import '../App.css';

function Upload() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB en bytes

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validar tipo y tamaño
      if (selectedFile.type !== 'application/pdf') {
        setMessage('Por favor, selecciona un archivo PDF válido.');
        setFile(null);
        return;
      }
      if (selectedFile.size > MAX_FILE_SIZE) {
        setMessage('El archivo excede el tamaño máximo de 5MB.');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setMessage(''); // Limpia mensajes previos
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('Por favor, selecciona un archivo PDF');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8000/api/upload/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        setMessage('Archivo subido con éxito');
        setFile(null);
        document.querySelector('input[type="file"]').value = ''; // Limpia el input
      } else {
        setMessage('Error: ' + JSON.stringify(result));
      }
    } catch (error) {
      setMessage('Error al conectar con el servidor: ' + error.message);
    }
  };

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  return (
    <div className="upload-screen screen-container">
      <header className="screen-header">
        <h1>Subir un PDF</h1>
      </header>
      <div className="screen-body">
        <form onSubmit={handleSubmit}>
          <div>
            <label>Selecciona un archivo PDF (máx. 5MB):</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
            />
          </div>
          <button type="submit">Subir</button>
          <Link to="/">
            <button type="button">Volver al Inicio</button>
          </Link>
        </form>
        {message && <p>{message}</p>}
      </div>
  </div>
  );
}

export default Upload;