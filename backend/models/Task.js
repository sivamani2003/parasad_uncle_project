const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  task: { type: String, required: true },
  description: { type: String, required: false }, // New field for task description
  executor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  complete: { type: Boolean, default: false },
  file: {
    filename: { type: String, required: false },
    path: { type: String, required: false },
    mimetype: { type: String, required: false },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

taskSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
