const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getMyAppointments,
  getAllAppointments,
  getHospitalAppointments,
  updateAppointmentStatus,
  getQueueInfo,
  getQueueStatusForAppointment,
  deleteAppointment,
} = require('../controllers/appointmentController.js');
const { protect, admin } = require('../middlewares/authMiddleware.js');

router.route('/').post(protect, createAppointment);
router.route('/myappointments').get(protect, getMyAppointments);
router.route('/all').get(protect, admin, getAllAppointments);
router.route('/hospital/:hospitalId').get(protect, admin, getHospitalAppointments);
router.route('/queue/:doctorId/:date').get(getQueueInfo);
router.route('/queue-status/:appointmentId').get(protect, getQueueStatusForAppointment);

// Support both PUT and PATCH for status updates
router.route('/:id/status').put(protect, admin, updateAppointmentStatus).patch(protect, admin, updateAppointmentStatus);
router.route('/:id').delete(protect, deleteAppointment);

module.exports = router;
