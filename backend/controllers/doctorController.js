const Doctor = require('../models/Doctor.js');

// @desc    Add a new doctor
// @route   POST /api/doctors
// @access  Private/Admin
const addDoctor = async (req, res) => {
  try {
    const { name, department, qualification, experience, consultationTime, hospital } = req.body;

    if (!name || !department) {
      return res.status(400).json({ message: 'Name and department are required.' });
    }

    const doctor = await Doctor.create({
      name,
      department,
      hospital: hospital || null,
      qualification: qualification || 'MBBS',
      experience: experience || 1,
      consultationTime: consultationTime || 15,
    });

    res.status(201).json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Get all doctors for a hospital
// @route   GET /api/doctors/hospital/:hospitalId
// @access  Public
const getDoctorsByHospital = async (req, res) => {
  try {
    const doctors = await Doctor.find({ hospital: req.params.hospitalId });
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all doctors (optionally filter by department and hospital)
// @route   GET /api/doctors?department=Cardiology&hospital=123
// @access  Public
const getDoctors = async (req, res) => {
  try {
    const filter = {};
    if (req.query.department) {
      filter.department = req.query.department;
    }
    if (req.query.hospital) {
      filter.hospital = req.query.hospital;
    }
    const doctors = await Doctor.find(filter).populate('hospital', 'name');
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addDoctor, getDoctorsByHospital, getDoctors };
