const mongoose = require('mongoose');

const sleepSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    date: {
      type: Date,
      required: [true, 'Please provide sleep date'],
      default: Date.now,
      index: true
    },
    bedtime: {
      type: Date,
      required: [true, 'Please provide bedtime']
    },
    wakeTime: {
      type: Date,
      required: [true, 'Please provide wake time']
    },
    duration: {
      type: Number, // duration in hours (e.g. 7.5)
      required: [true, 'Sleep duration is required'],
      min: [0, 'Duration cannot be negative']
    },
    quality: {
      type: String,
      required: [true, 'Please specify sleep quality'],
      enum: {
        values: ['Poor', 'Fair', 'Good', 'Excellent'],
        message: '{VALUE} is not a valid sleep quality option'
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

sleepSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Sleep', sleepSchema);
