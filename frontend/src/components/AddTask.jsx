import React, { useState } from 'react';
import axios from 'axios';

function AddTask({ fetchTasks }) {
  const [task, setTask] = useState('');
  const [description, setDescription] = useState('');
  const [executorUsername, setExecutorUsername] = useState('');
  const [file, setFile] = useState(null);

  const handleAddTask = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('task', task);
    formData.append('description', description);
    formData.append('executorUsername', executorUsername);
    if (file) {
      formData.append('file', file);
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post('https://parasad-uncle-project.onrender.com/api/tasks', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      setTask('');
      setDescription('');
      setExecutorUsername('');
      setFile(null);
      fetchTasks(); // Fetch tasks again to update the list
    } catch (error) {
      console.error(error.response.data);
    }
  };

  return (
    <form onSubmit={handleAddTask} className="mb-6">
      <div className="mb-4">
        <label className="block text-gray-700">Task</label>
        <input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Executor Username</label>
        <input
          type="text"
          value={executorUsername}
          onChange={(e) => setExecutorUsername(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Attachment</label>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full p-2 border rounded"
        />
      </div>
      <button type="submit" className="bg-blue-500 text-white p-2 rounded-md">Add Task</button>
    </form>
  );
}

export default AddTask;
