import React from 'react';
import { BrowserRouter as Router, useRoutes } from 'react-router-dom';
import Register from './components/Register.jsx';
import Login from './components/Login';
import TaskManager from './components/TaskManager';
import './index.css';
import Navbar from './components/Navbar.jsx';

function AppRoutes() {
  let routes = useRoutes([
    { path: "/register", element: <Register /> },
    { path: "/login", element: <Login /> },
    { path: "/tasks", element: <TaskManager /> },
  ]);
  return routes;
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 p-6">
        <Navbar />
        <AppRoutes />
      </div>
    </Router>
  );
}

export default App;
