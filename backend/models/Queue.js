const mongoose = require('mongoose');

const queueSchema = mongoose.Schema(
  {
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Hospital',
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Doctor',
    },
    date: {
      type: Date,
      required: true,
    },
    currentToken: {
      type: Number,
      default: 0,
    },
    totalTokens: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Queue = mongoose.model('Queue', queueSchema);
module.exports = Queue;
