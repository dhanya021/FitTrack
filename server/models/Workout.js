const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Please provide a workout name'],
      trim: true,
      maxlength: [100, 'Workout name cannot exceed 100 characters']
    },
    type: {
      type: String,
      required: [true, 'Please select a workout type'],
      enum: {
        values: [
          'Strength',
          'Cardio',
          'Running',
          'Cycling',
          'Walking',
          'Yoga',
          'HIIT',
          'Other'
        ],
        message: '{VALUE} is not a supported workout type'
      }
    },
    date: {
      type: Date,
      required: [true, 'Please provide a workout date'],
      default: Date.now,
      index: true
    },
    duration: {
      type: Number,
      required: [true, 'Please specify duration in minutes'],
      min: [1, 'Duration must be at least 1 minute']
    },
    caloriesBurned: {
      type: Number,
      required: [true, 'Please specify calories burned'],
      min: [0, 'Calories burned cannot be negative']
    },
    difficulty: {
      type: String,
      required: [true, 'Please select workout difficulty'],
      enum: {
        values: ['Easy', 'Moderate', 'Hard'],
        message: '{VALUE} is not a valid difficulty level'
      }
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Compound index for querying workouts by user and date range efficiently
workoutSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Workout', workoutSchema);
