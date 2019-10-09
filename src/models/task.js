const mongoose = require('mongoose');

const taskSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  goalDetail: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Goal',
  },
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;