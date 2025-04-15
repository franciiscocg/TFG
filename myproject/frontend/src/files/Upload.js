import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../App.css';

function Upload() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const ALLOWED_MIME_TYPES = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ];

  const ALLOWED_EXTENSIONS_STRING = ".pdf,.pptx";



  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!ALLOWED_MIME_TYPES.includes(selectedFile.type)) {
        setMessage('Por favor, selecciona un archivo PDF o PowerPoint (.pptx) válido.');
        setFile(null);
        e.target.value = '';
        return;
      }

      if (selectedFile.size > MAX_FILE_SIZE) {
        setMessage('El archivo excede el tamaño máximo de 5MB.');
        setFile(null);
        e.target.value = '';
        return;
      }

      setFile(selectedFile);
      setMessage(''); 
    } else {
        setFile(null);
        setMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('Por favor, selecciona un archivo PDF o PowerPoint');
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
        setMessage(`Archivo "${file.name}" subido con éxito.`);
        setFile(null);
        document.querySelector('input[type="file"]').value = '';
      } else {
         const errorDetail = result?.file?.[0] || result?.message || JSON.stringify(result);
         setMessage(`Error al subir el archivo: ${errorDetail}`);
      }
    } catch (error) {
       console.error("Error en handleSubmit:", error);
       setMessage(`Error de red o al conectar con el servidor: ${error.message}`);
    }
  };

  React.useEffect(() => {
      if (!isAuthenticated) {
          navigate('/login');
      }
  }, [isAuthenticated, navigate]);


  return (
    <div className="upload-screen screen-container">
      <header className="screen-header">
        <h1>Subir Archivo</h1>
      </header>
      <div className="screen-body">
        <form onSubmit={handleSubmit}>
          <div>
            <label>Selecciona un archivo PDF o PowerPoint (máx. 5MB):</label>
            <input
              type="file"
  
              accept={ALLOWED_EXTENSIONS_STRING}
              onChange={handleFileChange}
              key={file ? 'file-selected' : 'no-file'}
            />
          </div>
          <button type="submit" disabled={!file}>Subir Archivo</button>
          <Link to="/">
            <button type="button">Volver al Inicio</button>
          </Link>
        </form>
        {message && <p className={`message ${message.startsWith('Error') ? 'error' : 'success'}`}>{message}</p>}
      </div>
    </div>
  );
}

export default Upload;