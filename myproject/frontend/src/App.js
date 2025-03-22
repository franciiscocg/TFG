import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './home/home';
import Register from './login/Register';
import Login from './login/Login';
import Upload from './files/Upload';
import FileList from './files/FileList';
import './App.css';
import AppNavbar from './AppNavbar';

function App() {
  return (
    <AuthProvider>
    <Router>
      <AppNavbar />
      <div className="App-wrapper"> 
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/files" element={<FileList />} />
        </Routes>
      </div>
    </Router>
    </AuthProvider>
  );
}

export default App;