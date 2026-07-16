const mongoose = require('mongoose');

const doctorSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: 'Hospital',
    },
    department: {
      type: String,
      required: true,
    },
    qualification: {
      type: String,
      required: false,
      default: 'MBBS',
    },
    experience: {
      type: Number,
      required: false,
      default: 1,
    },
    consultationTime: {
      type: Number,
      required: false,
      default: 15,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Doctor = mongoose.model('Doctor', doctorSchema);
module.exports = Doctor;
