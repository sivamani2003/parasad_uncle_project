import React from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './routes'; // Import the router

function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
