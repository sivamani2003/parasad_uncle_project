import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { generateInvoicePDF } from './invoiceUtils';
import { IoSearch } from "react-icons/io5";
function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState('');
  const [description, setDescription] = useState('');
  const [executorUsername, setExecutorUsername] = useState('');
  const [file, setFile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('assigned');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskPaymentStatus, setTaskPaymentStatus] = useState({});
  const [paymentDetails, setPaymentDetails] = useState({
    name: '',
    address: '',
    amount: '',
    amountPaid: '',
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('https://parasad-uncle-project.onrender.com/api/tasks', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const tasks = response.data;

        // Fetch payment status for each task
        const paymentStatusPromises = tasks.map(async (task) => {
          const paymentStatusResponse = await axios.get(`https://parasad-uncle-project.onrender.com/api/tasks/pay/${task._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          return { taskId: task._id, status: paymentStatusResponse.data };
        });

        const paymentStatuses = await Promise.all(paymentStatusPromises);
        // Update the taskPaymentStatus state
        const taskPaymentStatusMap = paymentStatuses.reduce((acc, curr) => {
          acc[curr.taskId] = curr.status;
          return acc;
        }, {});

        setTaskPaymentStatus(taskPaymentStatusMap);
        setTasks(tasks);
      } catch (error) {
        console.error('Error fetching tasks:', error.response?.data || error.message);
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
      await axios.post('https://parasad-uncle-project.onrender.com/api/tasks', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      setTask('');
      setDescription('');
      setExecutorUsername('');
      setFile(null);
      const response = await axios.get('https://parasad-uncle-project.onrender.com/api/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(response.data);
    } catch (error) {
      console.error('Error adding task:', error.response?.data || error.message);
    }
  };

  const handleUpdateTask = async (taskId, complete) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`https://parasad-uncle-project.onrender.com/api/tasks/${taskId}`, { complete }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const response = await axios.get('https://parasad-uncle-project.onrender.com/api/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(response.data);
    } catch (error) {
      console.error('Error updating task:', error.response?.data || error.message);
    }
  };

  const handleReassignTask = async (taskId, newExecutorUsername) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`https://parasad-uncle-project.onrender.com/api/tasks/reassign/${taskId}`, { executorUsername: newExecutorUsername }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const response = await axios.get('https://parasad-uncle-project.onrender.com/api/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(response.data);
    } catch (error) {
      console.error('Error reassigning task:', error.response?.data || error.message);
    }
  };

  const handlePayTask = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`https://parasad-uncle-project.onrender.com/api/tasks/pay/${selectedTask._id}`, paymentDetails, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowPaymentModal(false);
      await fetchTaskPaymentStatus(selectedTask._id); // Refresh payment status
      const response = await axios.get('https://parasad-uncle-project.onrender.com/api/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(response.data);
    } catch (error) {
      console.error('Error paying for task:', error.response?.data || error.message);
    }
  };

  const fetchTaskPaymentStatus = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`https://parasad-uncle-project.onrender.com/api/tasks/pay/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTaskPaymentStatus((prev) => ({ ...prev, [taskId]: response.data }));
    } catch (error) {
      console.error('Error fetching payment status:', error.response?.data || error.message);
    }
  };

  const handleGenerateInvoice = async (taskId) => {
    const token = localStorage.getItem('token');
    await generateInvoicePDF(taskId, token); // Call the function from invoiceUtils
  };

  const filteredTasks = (status) => {
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = tasks.filter((task) => {
        const taskName = task.task ? task.task.toLowerCase() : '';
        const taskDescription = task.description ? task.description.toLowerCase() : '';
        const executorUsername = task.executor && task.executor.username ? task.executor.username.toLowerCase() : '';
  
        return (
          taskName.includes(lowercasedQuery) ||
          taskDescription.includes(lowercasedQuery) ||
          executorUsername.includes(lowercasedQuery)
        );
      });

      if (status === 'all') return filtered;
      const isComplete = status === 'completed';
      return filtered.filter((task) => task.complete === isComplete);
    }
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
      <div className="mb-4 flex justify-end">
        <div className="relative w-1/3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="border p-2 w-full rounded-lg pl-10"
          />
          <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>



      <div>
  {filteredTasks(activeTab).map((task) => (
    <div key={task._id} className="border border-gray-300 shadow-lg p-6 mb-4 rounded-lg bg-white">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">{task.task}</h2>
      <p className="text-gray-700 mb-1"><span className="font-semibold">Description:</span> {task.description}</p>
      <p className="text-gray-700 mb-1"><span className="font-semibold">Executor:</span> {task.executor.username}</p>
      <p className="text-gray-700 mb-1"><span className="font-semibold">Created at:</span> {new Date(task.createdAt).toLocaleString()}</p>
      <p className="text-gray-700 mb-1"><span className="font-semibold">Updated at:</span> {new Date(task.updatedAt).toLocaleString()}</p>
      {task.file && (
        <p className="text-blue-600 mb-2">
          <span className="font-semibold">File:</span> 
          <a href={`https://parasad-uncle-project.onrender.com/${task.file.path}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-800">
            Download file
          </a>
        </p>
      )}
      <p className="text-gray-700 mb-4"><span className="font-semibold">Status:</span> {task.complete ? 'Completed' : 'Incomplete'}</p>

      {task.complete && isAdmin && (
        <>
          {!taskPaymentStatus[task._id]?.paid ? (
            <button
              onClick={() => { setShowPaymentModal(true); setSelectedTask(task); }}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold p-2 rounded shadow mt-2"
            >
              Pay Now
            </button>
          ) : (
            <div>
              <button className="bg-blue-500 text-white font-semibold p-2 mt-2 rounded cursor-not-allowed shadow" disabled>
                Paid
              </button>
              <button onClick={() => handleGenerateInvoice(task._id)} className="bg-green-500 hover:bg-green-600 text-white font-semibold p-2 rounded shadow mt-2 ml-4">
                Generate Invoice
              </button>
            </div>
          )}
        </>
      )}

      {!task.complete && (
        <>
          {/* "Mark as Complete" button for all users */}
          <button 
            onClick={() => handleUpdateTask(task._id, true)} 
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold p-2 rounded shadow mt-2"
          >
            Mark as Complete
          </button>
          
          {/* "Reassign Task" button only for admins */}
          {isAdmin && (
            <button
              onClick={() => handleReassignTask(task._id, prompt('Enter new executor username'))}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold p-2 rounded shadow mt-2 ml-4"
            >
              Reassign Task
            </button>
          )}
          </>
        )}

      </div>
  ))}
      </div>


      {showPaymentModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-4 rounded shadow-md">
            <h2 className="text-xl font-bold mb-4">Payment Details</h2>
            <div className="mb-2">
              <input
                type="text"
                placeholder="Name"
                value={paymentDetails.name}
                onChange={(e) => setPaymentDetails({ ...paymentDetails, name: e.target.value })}
                className="border p-2 w-full"
              />
            </div>
            <div className="mb-2">
              <input
                type="text"
                placeholder="Address"
                value={paymentDetails.address}
                onChange={(e) => setPaymentDetails({ ...paymentDetails, address: e.target.value })}
                className="border p-2 w-full"
              />
            </div>
            <div className="mb-2">
              <input
                type="number"
                placeholder="Amount"
                value={paymentDetails.amount}
                onChange={(e) => setPaymentDetails({ ...paymentDetails, amount: e.target.value })}
                className="border p-2 w-full"
              />
            </div>
            <div className="mb-2">
              <input
                type="number"
                placeholder="Amount Paid"
                value={paymentDetails.amountPaid}
                onChange={(e) => setPaymentDetails({ ...paymentDetails, amountPaid: e.target.value })}
                className="border p-2 w-full"
              />
            </div>
            <button onClick={handlePayTask} className="bg-blue-500 text-white p-2 rounded">Submit Payment</button>
            <button onClick={() => setShowPaymentModal(false)} className="bg-gray-500 text-white p-2 rounded ml-2">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskManager;