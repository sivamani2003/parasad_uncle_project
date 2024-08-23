// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './components/Register.jsx';
import Login from './components/Login';
import TaskManager from './components/TaskManager';
import './index.css'
import Navbar from './components/Navbar.jsx';
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 p-6">
        <Navbar/>
        <Routes>
        <Route path="/register" element={<Register />} />
          <Route path="/" element={<Login />} />
          <Route path="/tasks" element={<TaskManager />} />
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;
