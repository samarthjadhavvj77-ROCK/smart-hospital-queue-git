const mongoose = require('mongoose');

const appointmentSchema = mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
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
    timeSlot: {
      type: String, // e.g., '10:00 AM'
      required: true,
    },
    tokenNumber: {
      type: Number,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'completed', 'cancelled', 'skipped'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);
module.exports = Appointment;
