const express = require('express');
const router = express.Router();
const { registerHospital, getHospitalById, getHospitals } = require('../controllers/hospitalController.js');
const { protect, admin } = require('../middlewares/authMiddleware.js');

router.route('/').post(protect, admin, registerHospital).get(getHospitals);
router.route('/:id').get(getHospitalById);

module.exports = router;
