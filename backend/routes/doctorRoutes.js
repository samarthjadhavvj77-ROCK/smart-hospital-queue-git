const express = require('express');
const router = express.Router();
const { addDoctor, getDoctorsByHospital, getDoctors } = require('../controllers/doctorController.js');
const { updateDoctor, deleteDoctor, getDoctorById } = require('../controllers/adminController.js');
const { protect, admin } = require('../middlewares/authMiddleware.js');

// GET /api/doctors?department=Cardiology  — filter by department
// POST /api/doctors — add doctor (admin)
router.route('/').get(getDoctors).post(protect, admin, addDoctor);
router.route('/hospital/:hospitalId').get(getDoctorsByHospital);
router.route('/:id').get(getDoctorById).put(protect, admin, updateDoctor).delete(protect, admin, deleteDoctor);

module.exports = router;
