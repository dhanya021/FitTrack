const mongoose = require('mongoose');

const waterSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    date: {
      type: Date,
      required: [true, 'Please provide an entry date'],
      default: Date.now,
      index: true
    },
    amount: {
      type: Number,
      required: [true, 'Please specify water amount in ml'],
      min: [1, 'Water amount must be at least 1 ml']
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

waterSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Water', waterSchema);
