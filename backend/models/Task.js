const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  task: { type: String, required: true },
  description: { type: String, required: false }, 
  executor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  complete: { type: Boolean, default: false },
  file: {
    filename: { type: String, required: false },
    path: { type: String, required: false },
    mimetype: { type: String, required: false },
  },
  paid: { type: Boolean, default: false }, // Field to track payment status
  paymentDetails: { // Field to store payment details
    name: { type: String, default: null },
    address: { type: String, default: null },
    amount: { type: Number, default: 0 },
    amountPaid: { type: Number, default: 0 },
    paymentDate: { type: Date, default: null }
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
