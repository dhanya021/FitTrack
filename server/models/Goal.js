const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Please provide a goal title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    category: {
      type: String,
      required: [true, 'Please select a goal category'],
      enum: {
        values: [
          'Steps',
          'Workouts',
          'Water',
          'Sleep',
          'Distance',
          'Calories',
          'Active Minutes'
        ],
        message: '{VALUE} is not a valid goal category'
      }
    },
    target: {
      type: Number,
      required: [true, 'Please provide a target value'],
      min: [1, 'Target must be at least 1']
    },
    current: {
      type: Number,
      default: 0,
      min: [0, 'Current progress cannot be negative']
    },
    unit: {
      type: String,
      required: [true, 'Please provide a unit of measurement'],
      trim: true
    },
    deadline: {
      type: Date
    },
    status: {
      type: String,
      enum: ['In Progress', 'Completed', 'Paused'],
      default: 'In Progress'
    }
  },
  {
    timestamps: true
  }
);

goalSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Goal', goalSchema);
