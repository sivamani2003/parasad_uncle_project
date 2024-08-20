const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const User = require('../models/User');
const Task = require('../models/Task');
const router = express.Router();

const JWT_SECRET = 'your_jwt_secret'; // Use a strong secret in production

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

router.post('/register', async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, role });
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      console.error('User not found');
      return res.status(400).json({ message: 'Invalid username ' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.error('Password mismatch');
      return res.status(400).json({ message: 'Invalid password' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');
  
  if (!authHeader) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Token format is incorrect' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};


const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};

router.post('/tasks', authMiddleware, adminMiddleware, upload.single('file'), async (req, res) => {
  const { task, description, executorUsername } = req.body;
  try {
    const executor = await User.findOne({ username: executorUsername });
    if (!executor) {
      return res.status(400).json({ error: 'Executor user not found' });
    }
    const newTask = new Task({
      task,
      description,
      executor: executor._id,
      complete: false,
      file: req.file ? {
        filename: req.file.filename,
        path: req.file.path,
        mimetype: req.file.mimetype
      } : null
    });
    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/tasks', authMiddleware, async (req, res) => {
  try {
    let tasks;
    if (req.user.role === 'admin') {
      tasks = await Task.find().populate('executor', 'username');
    } else {
      tasks = await Task.find({ executor: req.user.id }).populate('executor', 'username');
    }
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get('/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/tasks/paydetails/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const paymentStatus = {
      paid: task.paid,
      paymentDetails: task.paymentDetails
    };

    res.status(200).json(paymentStatus);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});


router.put('/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    if (req.user.role !== 'admin' && task.executor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    task.complete = req.body.complete;
    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.put('/tasks/pay/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { name, address, amount, amountPaid } = req.body;

    const task = await Task.findByIdAndUpdate(req.params.id, {
      paid: true,
      paymentDetails: {
        name,
        address,
        amount,
        amountPaid,
        paymentDate: new Date()
      }
    }, { new: true });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get('/tasks/pay/:id',authMiddleware, async (req, res) => {
  const { taskId } = req.params;

  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const paymentStatus = {
      paid: task.paid,
      paymentDetails: task.paymentDetails
    };

    res.status(200).json(paymentStatus);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
})



router.put('/tasks/reassign/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { executorUsername } = req.body;
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const executor = await User.findOne({ username: executorUsername });
    if (!executor) {
      return res.status(400).json({ error: 'Executor user not found' });
    }

    task.executor = executor._id;
    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
