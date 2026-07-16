const mongoose = require('mongoose');

const hospitalSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Hospital = mongoose.model('Hospital', hospitalSchema);
module.exports = Hospital;
