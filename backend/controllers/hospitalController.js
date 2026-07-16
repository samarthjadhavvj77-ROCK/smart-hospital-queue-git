const Hospital = require('../models/Hospital.js');

// @desc    Register a new hospital
// @route   POST /api/hospitals
// @access  Private/Admin
const registerHospital = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    const hospitalExists = await Hospital.findOne({ email });

    if (hospitalExists) {
      res.status(400).json({ message: 'Hospital already exists' });
      return;
    }

    const hospital = await Hospital.create({
      name,
      admin: req.user._id,
      email,
      phone,
      address,
    });

    if (hospital) {
      res.status(201).json(hospital);
    } else {
      res.status(400).json({ message: 'Invalid hospital data' });
    }
  } catch (error) {
    console.error('Hospital Registration Error:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Get hospital profile
// @route   GET /api/hospitals/:id
// @access  Public
const getHospitalById = async (req, res) => {
  const hospital = await Hospital.findById(req.params.id).populate('admin', 'name email');

  if (hospital) {
    res.json(hospital);
  } else {
    res.status(404).json({ message: 'Hospital not found' });
  }
};

// @desc    Get all hospitals
// @route   GET /api/hospitals
// @access  Public
const getHospitals = async (req, res) => {
  const hospitals = await Hospital.find({});
  res.json(hospitals);
};

module.exports = { registerHospital, getHospitalById, getHospitals };
