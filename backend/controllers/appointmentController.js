const Appointment = require('../models/Appointment.js');
const Queue = require('../models/Queue.js');
const Doctor = require('../models/Doctor.js');

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private
const createAppointment = async (req, res) => {
  try {
    const { doctor, hospital, date, timeSlot, reason } = req.body;

    if (!doctor || !date || !timeSlot || !hospital) {
      return res.status(400).json({ message: 'Hospital, Doctor, date, and time slot are required.' });
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const duplicateCheck = await Appointment.findOne({
      patient: req.user._id,
      doctor,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    if (duplicateCheck) {
      return res.status(400).json({ message: 'You already have an appointment booked with this doctor on this date.' });
    }

    // Calculate token number for that doctor on that day
    const existingAppointments = await Appointment.countDocuments({
      doctor,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    const tokenNumber = existingAppointments + 1;

    const appointment = await Appointment.create({
      patient: req.user._id,
      hospital,
      doctor,
      date,
      timeSlot,
      tokenNumber,
      reason: reason || '',
    });

    // Update/create Queue for that day
    let queue = await Queue.findOne({ hospital, doctor, date: { $gte: startOfDay, $lte: endOfDay } });
    if (!queue) {
      queue = await Queue.create({
        hospital,
        doctor,
        date: startOfDay,
        totalTokens: 1,
        currentToken: 0,
      });
    } else {
      queue.totalTokens += 1;
      await queue.save();
    }

    req.app.get('io').emit('queueUpdated', { doctor, queue });

    const populated = await Appointment.findById(appointment._id)
      .populate('doctor', 'name department')
      .populate('patient', 'name email phone');

    res.status(201).json(populated);
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Get patient appointments
// @route   GET /api/appointments/myappointments
// @access  Private
const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user._id })
      .populate('doctor', 'name department')
      .populate('hospital', 'name')
      .sort({ date: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get ALL appointments (admin)
// @route   GET /api/appointments/all
// @access  Private/Admin
const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({})
      .populate('patient', 'name email phone')
      .populate('doctor', 'name department')
      .sort({ createdAt: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all appointments for a hospital
// @route   GET /api/appointments/hospital/:hospitalId
// @access  Private/Admin
const getHospitalAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ hospital: req.params.hospitalId })
      .populate('patient', 'name email phone')
      .populate('doctor', 'name');
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update appointment status
// @route   PUT or PATCH /api/appointments/:id/status
// @access  Private/Admin
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    appointment.status = status;
    await appointment.save();

    // Update queue if completed or skipped
    if (status === 'completed' || status === 'skipped') {
      const startOfDay = new Date(appointment.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(appointment.date);
      endOfDay.setHours(23, 59, 59, 999);

      const queue = await Queue.findOne({
        hospital: appointment.hospital,
        doctor: appointment.doctor,
        date: { $gte: startOfDay, $lte: endOfDay },
      });

      if (queue) {
        queue.currentToken = appointment.tokenNumber;
        await queue.save();
        req.app.get('io').emit('tokenCalled', {
          doctor: appointment.doctor,
          token: appointment.tokenNumber,
          queue,
        });
      }
    }

    // Emit general update
    req.app.get('io').emit('queueUpdated', { appointmentId: appointment._id, status });
    if (status === 'approved') {
      req.app.get('io').emit('appointmentApproved', { appointmentId: appointment._id });
    }

    const updated = await Appointment.findById(appointment._id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name department');

    res.json(updated);
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get queue info and estimated wait time
// @route   GET /api/appointments/queue/:doctorId/:date
// @access  Public
const getQueueInfo = async (req, res) => {
  try {
    const { doctorId, date } = req.params;

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const queue = await Queue.findOne({
      doctor: doctorId,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    const waitingCount = await Appointment.countDocuments({
      doctor: doctorId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: 'approved',
    });

    res.json({
      currentToken: queue ? queue.currentToken : 0,
      totalTokens: queue ? queue.totalTokens : 0,
      waitingCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get queue status for a specific appointment
// @route   GET /api/appointments/queue-status/:appointmentId
// @access  Private
const getQueueStatusForAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.appointmentId).populate('doctor', 'name department');
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    const startOfDay = new Date(appointment.date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(appointment.date);
    endOfDay.setHours(23, 59, 59, 999);

    const queue = await Queue.findOne({
      doctor: appointment.doctor._id,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    const waitingCount = await Appointment.countDocuments({
      doctor: appointment.doctor._id,
      tokenNumber: { $lt: appointment.tokenNumber },
      status: 'approved',
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    res.json({
      currentToken: queue ? queue.currentToken : 0,
      waitingCount,
      myToken: appointment.tokenNumber,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private
const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    await appointment.deleteOne();
    res.json({ message: 'Appointment removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createAppointment,
  getMyAppointments,
  getAllAppointments,
  getHospitalAppointments,
  updateAppointmentStatus,
  getQueueInfo,
  getQueueStatusForAppointment,
  deleteAppointment,
};
