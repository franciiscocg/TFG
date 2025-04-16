import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ResponsiveProvider from './design/ResponsiveProvider';

// Importar componentes rediseñados
import AppNavbar from './design/components/AppNavbar';
import Home from './design/components/Home';
import Login from './design/components/Login';
import Register from './design/components/Register';
import AsignaturasList from './design/components/AsignaturasList';
import FileList from './design/components/FileList';
import CalendarViewer from './design/components/CalendarViewer';
import Upload from './design/components/Upload';
import TextViewer from './design/components/TextViewer';
import LoadingScreen from './design/components/LoadingScreen';
import DatesResult from './design/components/DatesResult';
import AsignaturaEdit from './design/components/AsignaturaEdit';
import AuthCallback from './design/components/AuthCallback';

// Importar componentes de optimización
import { ResourcePreloader } from './design/components/PerformanceComponents';
import { SkipLink } from './design/components/AccessibilityComponents';

// Importar estilos CSS
import './design/responsive.css';
import './design/navbar-responsive.css';

function App() {
  return (
    <AuthProvider>
      <ResponsiveProvider>
        <ResourcePreloader />
        <Router>
          <SkipLink href="#main-content">Saltar al contenido principal</SkipLink>
          <AppNavbar />
          <main id="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/asignaturas" element={<AsignaturasList />} />
              <Route path="/files" element={<FileList />} />
              <Route path="/calendar" element={<CalendarViewer />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/text/:fileId" element={<TextViewer />} />
              <Route path="/loading/:fileId" element={<LoadingScreen />} />
              <Route path="/dates/:fileId" element={<DatesResult />} /> 
              <Route path="/editar-asignatura/:asignaturaNombre" element={<AsignaturaEdit />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
            </Routes>
          </main>
        </Router>
      </ResponsiveProvider>
    </AuthProvider>
  );
}

export default App;
