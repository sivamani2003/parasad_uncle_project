// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// function TaskManager() {
//   const [tasks, setTasks] = useState([]);
//   const [task, setTask] = useState('');
//   const [description, setDescription] = useState('');
//   const [executorUsername, setExecutorUsername] = useState('');
//   const [file, setFile] = useState(null);
//   const [isAdmin, setIsAdmin] = useState(false);
//   const [activeTab, setActiveTab] = useState('assigned');
//   const [showPaymentModal, setShowPaymentModal] = useState(false);
//   const [selectedTask, setSelectedTask] = useState(null);
//   const [taskPaymentStatus, setTaskPaymentStatus] = useState({});
//   const [paymentDetails, setPaymentDetails] = useState({
//     name: '',
//     address: '',
//     amount: '',
//     amountPaid: '',
//   });

//   useEffect(() => {
//     const fetchTasks = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         const response = await axios.get('http://localhost:5007/api/tasks', {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const tasks = response.data;

//         // Fetch payment status for each task
//         const paymentStatusPromises = tasks.map(async (task) => {
//           const paymentStatusResponse = await axios.get(`http://localhost:5007/api/tasks/pay/${task._id}`, {
//             headers: { Authorization: `Bearer ${token}` },
//           });
//           return { taskId: task._id, status: paymentStatusResponse.data };
//         });

//         const paymentStatuses = await Promise.all(paymentStatusPromises);
//         // Update the taskPaymentStatus state
//         const taskPaymentStatusMap = paymentStatuses.reduce((acc, curr) => {
//           acc[curr.taskId] = curr.status;
//           return acc;
//         }, {});

//         setTaskPaymentStatus(taskPaymentStatusMap);
//         setTasks(tasks);
//       } catch (error) {
//         console.error('Error fetching tasks:', error.response?.data || error.message);
//       }
//     };
    
//     const checkRole = () => {
//       const token = localStorage.getItem('token');
//       if (token) {
//         const decoded = JSON.parse(atob(token.split('.')[1]));
//         setIsAdmin(decoded.role === 'admin');
//       }
//     };

//     fetchTasks();
//     checkRole();
//   }, []);

//   const handleAddTask = async (e) => {
//     e.preventDefault();
//     const formData = new FormData();
//     formData.append('task', task);
//     formData.append('description', description);
//     formData.append('executorUsername', executorUsername);
//     if (file) {
//       formData.append('file', file);
//     }

//     try {
//       const token = localStorage.getItem('token');
//       await axios.post('http://localhost:5007/api/tasks', formData, {
//         headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
//       });
//       setTask('');
//       setDescription('');
//       setExecutorUsername('');
//       setFile(null);
//       const response = await axios.get('http://localhost:5007/api/tasks', {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setTasks(response.data);
//     } catch (error) {
//       console.error('Error adding task:', error.response?.data || error.message);
//     }
//   };

//   const handleUpdateTask = async (taskId, complete) => {
//     try {
//       const token = localStorage.getItem('token');
//       await axios.put(`http://localhost:5007/api/tasks/${taskId}`, { complete }, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const response = await axios.get('http://localhost:5007/api/tasks', {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setTasks(response.data);
//     } catch (error) {
//       console.error('Error updating task:', error.response?.data || error.message);
//     }
//   };

//   const handleReassignTask = async (taskId, newExecutorUsername) => {
//     try {
//       const token = localStorage.getItem('token');
//       await axios.put(`http://localhost:5007/api/tasks/reassign/${taskId}`, { executorUsername: newExecutorUsername }, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const response = await axios.get('http://localhost:5007/api/tasks', {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setTasks(response.data);
//     } catch (error) {
//       console.error('Error reassigning task:', error.response?.data || error.message);
//     }
//   };

//   const handlePayTask = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       await axios.put(`http://localhost:5007/api/tasks/pay/${selectedTask._id}`, paymentDetails, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setShowPaymentModal(false);
//       await fetchTaskPaymentStatus(selectedTask._id); // Refresh payment status
//       const response = await axios.get('http://localhost:5007/api/tasks', {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setTasks(response.data);
//     } catch (error) {
//       console.error('Error paying for task:', error.response?.data || error.message);
//     }
//   };

//   const fetchTaskPaymentStatus = async (taskId) => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`http://localhost:5007/api/tasks/pay/${taskId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setTaskPaymentStatus((prev) => ({ ...prev, [taskId]: response.data }));
//     } catch (error) {
//       console.error('Error fetching payment status:', error.response?.data || error.message);
//     }
//   };

//   const filteredTasks = (status) => {
//     if (status === 'all') return tasks;
//     const isComplete = status === 'completed';
//     return tasks.filter((task) => task.complete === isComplete);
//   };

//   return (
//     <div className="p-4">
//       <h1 className="text-2xl font-bold mb-4">Task Manager</h1>

//       {isAdmin && (
//         <form onSubmit={handleAddTask} className="mb-4">
//           <div className="mb-2">
//             <input
//               type="text"
//               value={task}
//               onChange={(e) => setTask(e.target.value)}
//               placeholder="Task name"
//               className="border p-2 w-full"
//               required
//             />
//           </div>
//           <div className="mb-2">
//             <textarea
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               placeholder="Task description"
//               className="border p-2 w-full"
//               required
//             />
//           </div>
//           <div className="mb-2">
//             <input
//               type="text"
//               value={executorUsername}
//               onChange={(e) => setExecutorUsername(e.target.value)}
//               placeholder="Executor username"
//               className="border p-2 w-full"
//               required
//             />
//           </div>
//           <div className="mb-2">
//             <input
//               type="file"
//               onChange={(e) => setFile(e.target.files[0])}
//               className="border p-2 w-full"
//             />
//           </div>
//           <button type="submit" className="bg-blue-500 text-white p-2 rounded">Add Task</button>
//         </form>
//       )}

//       <div className="flex justify-center mb-4">
//         <button className={`p-2 ${activeTab === 'assigned' ? 'bg-gray-300' : ''}`} onClick={() => setActiveTab('assigned')}>Assigned Tasks</button>
//         <button className={`p-2 ${activeTab === 'completed' ? 'bg-gray-300' : ''}`} onClick={() => setActiveTab('completed')}>Completed Tasks</button>
//         {isAdmin && (
//           <button className={`p-2 ${activeTab === 'all' ? 'bg-gray-300' : ''}`} onClick={() => setActiveTab('all')}>All Tasks</button>
//         )}
//       </div>

//       <div>
//         {filteredTasks(activeTab).map((task) => (
//           <div key={task._id} className="border p-2 mb-2 flex justify-between items-center">
//             <div>
//               <h2 className="font-bold">{task.task}</h2>
//               <p>{task.description}</p>
//               <p><strong>Executor:</strong> {task.executor.username}</p>
//               {task.file && (
//                 <a href={`http://localhost:5007/${task.file.path}`} download>{task.file.filename}</a>
//               )}
//             </div>
//             <div>
//               {!task.complete && (
//                 <button
//                   onClick={() => handleUpdateTask(task._id, true)}
//                   className="bg-green-500 text-white p-2 rounded"
//                 >
//                   Complete
//                 </button>
//               )}
//               {isAdmin && !task.complete && (
//                 <button
//                   onClick={() => {
//                     const newExecutorUsername = prompt('Enter new executor username:');
//                     if (newExecutorUsername) handleReassignTask(task._id, newExecutorUsername);
//                   }}
//                   className="bg-yellow-500 text-white p-2 rounded ml-2"
//                 >
//                   Reassign
//                 </button>
//               )}
//               {isAdmin && (
//                 <>{taskPaymentStatus[task._id]?.paid && (
//                   <button
//                       // onClick={handleDownloadInvoice}
//                       className='bg-green-500 px-2 py-2 rounded'
//                   >
//                       Invoice
//                   </button>
//               )}<button
//                   onClick={async () => {
//                     await fetchTaskPaymentStatus(task._id);
//                     setSelectedTask(task);
//                     setShowPaymentModal(true);
//                   } }
//                   className="bg-blue-500 text-white p-2 rounded ml-2"
//                 >
//                   {taskPaymentStatus[task._id]?.paid ? 'Paid' : 'Mark as Paid'}
//                 </button></>
//               )}
//             </div>
//           </div>
//         ))}
//       </div>

//       {showPaymentModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
//           <div className="bg-white p-4 rounded">
//             <h2 className="text-xl font-bold mb-4">Payment Details</h2>
//             <input
//               type="text"
//               value={paymentDetails.name}
//               onChange={(e) => setPaymentDetails({ ...paymentDetails, name: e.target.value })}
//               placeholder="Name"
//               className="border p-2 mb-2 w-full"
//             />
//             <input
//               type="text"
//               value={paymentDetails.address}
//               onChange={(e) => setPaymentDetails({ ...paymentDetails, address: e.target.value })}
//               placeholder="Address"
//               className="border p-2 mb-2 w-full"
//             />
//             <input
//               type="number"
//               value={paymentDetails.amount}
//               onChange={(e) => setPaymentDetails({ ...paymentDetails, amount: e.target.value })}
//               placeholder="Amount"
//               className="border p-2 mb-2 w-full"
//             />
//             <input
//               type="number"
//               value={paymentDetails.amountPaid}
//               onChange={(e) => setPaymentDetails({ ...paymentDetails, amountPaid: e.target.value })}
//               placeholder="Amount Paid"
//               className="border p-2 mb-2 w-full"
//             />
//             <button
//               onClick={handlePayTask}
//               className="bg-blue-500 text-white p-2 rounded"
//             >
//               Submit
//             </button>
//             <button
//               onClick={() => setShowPaymentModal(false)}
//               className="bg-gray-500 text-white p-2 rounded ml-2"
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


//  export default TaskManager;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { generateInvoicePDF } from './invoiceUtils'; // Import the function

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

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5007/api/tasks', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const tasks = response.data;

        // Fetch payment status for each task
        const paymentStatusPromises = tasks.map(async (task) => {
          const paymentStatusResponse = await axios.get(`http://localhost:5007/api/tasks/pay/${task._id}`, {
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
      console.error('Error adding task:', error.response?.data || error.message);
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
      console.error('Error updating task:', error.response?.data || error.message);
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
      console.error('Error reassigning task:', error.response?.data || error.message);
    }
  };

  const handlePayTask = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5007/api/tasks/pay/${selectedTask._id}`, paymentDetails, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowPaymentModal(false);
      await fetchTaskPaymentStatus(selectedTask._id); // Refresh payment status
      const response = await axios.get('http://localhost:5007/api/tasks', {
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
      const response = await axios.get(`http://localhost:5007/api/tasks/pay/${taskId}`, {
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
          <div key={task._id} className="border p-4 mb-2">
            <h2 className="text-xl font-semibold">{task.task}</h2>
            <p className="text-gray-600">Description: {task.description}</p>
            <p className="text-gray-600">Executor: {task.executor.username}</p>
            <p className="text-gray-600">Created at: {new Date(task.createdAt).toLocaleString()}</p>
            <p className="text-gray-600">Updated at: {new Date(task.updatedAt).toLocaleString()}</p>
            {task.file && <p className="text-gray-600">File: <a href={`http://localhost:5007/api/tasks/${task._id}/file`} target="_blank" rel="noopener noreferrer">Download</a></p>}
            <p className="text-gray-600">Status: {task.complete ? 'Completed' : 'Incomplete'}</p>

            {task.complete && isAdmin && (
              <>
                {!taskPaymentStatus[task._id]?.paid ? (
                  <>
                    
                    <button
                      onClick={() => { setShowPaymentModal(true); setSelectedTask(task); }}
                      className="bg-yellow-500 text-white p-2 rounded mt-2"
                    >
                      Pay Now
                    </button>
                  </>
                ) : (
                 <div>
                   <button className="bg-gray-500 text-white p-2 mt-1 rounded mt-2 cursor-not-allowed" disabled>
                    Paid
                  </button>
                  <button onClick={() => handleGenerateInvoice(task._id)} className="bg-green-500 text-white ml-5 p-2 rounded mt-2">Generate Invoice</button>
                 </div>
                  
                )}
              </>
            )}

            {!task.complete && isAdmin && (
              <button onClick={() => handleUpdateTask(task._id, true)} className="bg-blue-500 text-white p-2 rounded mt-2">Mark as Complete</button>
            )}

            {!task.complete && isAdmin && (
              <button
                onClick={() => handleReassignTask(task._id, prompt('Enter new executor username'))}
                className="bg-red-500 text-white p-2 rounded mt-2"
              >
                Reassign Task
              </button>
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
