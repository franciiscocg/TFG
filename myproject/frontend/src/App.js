import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './home/home';
import Register from './login/Register';
import Login from './login/Login';
import './App.css';
import AppNavbar from './AppNavbar';

function App() {
  return (
    <Router>
      <AppNavbar />
      <div className="App-wrapper"> 
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;