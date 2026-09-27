const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    date: {
      type: Date,
      required: [true, 'Please provide an activity date'],
      default: Date.now,
      index: true
    },
    steps: {
      type: Number,
      default: 0,
      min: [0, 'Steps cannot be negative']
    },
    distance: {
      type: Number,
      default: 0,
      min: [0, 'Distance cannot be negative']
    },
    activeMinutes: {
      type: Number,
      default: 0,
      min: [0, 'Active minutes cannot be negative']
    },
    caloriesBurned: {
      type: Number,
      default: 0,
      min: [0, 'Calories burned cannot be negative']
    }
  },
  {
    timestamps: true
  }
);

// Compound index for querying user activity by date
activitySchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Activity', activitySchema);
