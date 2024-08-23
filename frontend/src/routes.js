import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import Register from './components/Register.jsx';
import Login from './components/Login';
import TaskManager from './components/TaskManager';
import Navbar from './components/Navbar.jsx';

// Define your routes
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "tasks",
        element: <TaskManager />,
      }
    ]
  }
]);

export default router;
