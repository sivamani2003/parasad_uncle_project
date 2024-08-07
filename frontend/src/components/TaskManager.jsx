import React, { useState, useEffect } from 'react';
import axios from 'axios';

function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState('');
  const [description, setDescription] = useState('');
  const [executorUsername, setExecutorUsername] = useState('');
  const [file, setFile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('assigned');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5007/api/tasks', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks(response.data);
      } catch (error) {
        console.error(error.response.data);
      }
    };

    const checkRole = () => {
      const token = localStorage.getItem('token');
      if (token) {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setIsAdmin(decoded.role === 'admin');
      }
    };

    fetchTasks();
    checkRole();
  }, []);

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
      await axios.post('http://localhost:5007/api/tasks', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      setTask('');
      setDescription('');
      setExecutorUsername('');
      setFile(null);
      const response = await axios.get('http://localhost:5007/api/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(response.data);
    } catch (error) {
      console.error(error.response.data);
    }
  };

  const handleUpdateTask = async (taskId, complete) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5007/api/tasks/${taskId}`, { complete }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const response = await axios.get('http://localhost:5007/api/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(response.data);
    } catch (error) {
      console.error(error.response.data);
    }
  };

  const handleReassignTask = async (taskId, newExecutorUsername) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5007/api/tasks/reassign/${taskId}`, { executorUsername: newExecutorUsername }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const response = await axios.get('http://localhost:5007/api/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(response.data);
    } catch (error) {
      console.error(error.response.data);
    }
  };

  const filteredTasks = (status) => {
    if (status === 'all') return tasks;
    const isComplete = status === 'completed';
    return tasks.filter((task) => task.complete === isComplete);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Task Manager</h1>

      {isAdmin && (
        <form onSubmit={handleAddTask} className="mb-4">
          <div className="mb-2">
            <input
              type="text"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="Task name"
              className="border p-2 w-full"
              required
            />
          </div>
          <div className="mb-2">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task description"
              className="border p-2 w-full"
              required
            />
          </div>
          <div className="mb-2">
            <input
              type="text"
              value={executorUsername}
              onChange={(e) => setExecutorUsername(e.target.value)}
              placeholder="Executor username"
              className="border p-2 w-full"
              required
            />
          </div>
          <div className="mb-2">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="border p-2 w-full"
            />
          </div>
          <button type="submit" className="bg-blue-500 text-white p-2 rounded">Add Task</button>
        </form>
      )}

      <div className="flex justify-center mb-4">
        <button className={`p-2 ${activeTab === 'assigned' ? 'bg-gray-300' : ''}`} onClick={() => setActiveTab('assigned')}>Assigned Tasks</button>
        <button className={`p-2 ${activeTab === 'completed' ? 'bg-gray-300' : ''}`} onClick={() => setActiveTab('completed')}>Completed Tasks</button>
        {isAdmin && (
          <button className={`p-2 ${activeTab === 'all' ? 'bg-gray-300' : ''}`} onClick={() => setActiveTab('all')}>All Tasks</button>
        )}
      </div>

      <div>
        {filteredTasks(activeTab).map((task) => (
          <div key={task._id} className="border p-2 mb-2 flex justify-between items-center">
            <div>
              <h2 className="font-bold">{task.task}</h2>
              <p>{task.description}</p>
              <p><strong>Executor:</strong> {task.executor.username}</p>
              {task.file && (
                <a href={`http://localhost:5007/${task.file.path}`} download>{task.file.filename}</a>
              )}
            </div>
            <div>
              {!task.complete && (
                <button
                  onClick={() => handleUpdateTask(task._id, true)}
                  className="bg-green-500 text-white p-2 rounded"
                >
                  Complete
                </button>
              )}
              {isAdmin && !task.complete && (
                <button
                  onClick={() => {
                    const newExecutorUsername = prompt('Enter new executor username:');
                    if (newExecutorUsername) handleReassignTask(task._id, newExecutorUsername);
                  }}
                  className="bg-yellow-500 text-white p-2 rounded ml-2"
                >
                  Reassign
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TaskManager;
