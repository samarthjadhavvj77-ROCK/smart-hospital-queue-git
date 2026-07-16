const Doctor = require('../models/Doctor.js');
const Appointment = require('../models/Appointment.js');
const Queue = require('../models/Queue.js');

// Update a doctor
const updateDoctor = async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

  const { name, department, qualification, experience, consultationTime, isAvailable } = req.body;

  doctor.name = name ?? doctor.name;
  doctor.department = department ?? doctor.department;
  doctor.qualification = qualification ?? doctor.qualification;
  doctor.experience = experience ?? doctor.experience;
  doctor.consultationTime = consultationTime ?? doctor.consultationTime;
  if (isAvailable !== undefined) doctor.isAvailable = isAvailable;

  const updated = await doctor.save();

  // Recalculate waiting times for active queue
  const io = req.app.get('io');
  if (io) {
    io.emit('doctorStatusChanged', { doctorId: doctor._id, isAvailable: doctor.isAvailable, consultationTime: doctor.consultationTime });
  }

  res.json(updated);
};

// Delete a doctor
const deleteDoctor = async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
  await doctor.deleteOne();
  res.json({ message: 'Doctor removed' });
};

// Get doctor by ID
const getDoctorById = async (req, res) => {
  const doctor = await Doctor.findById(req.params.id).populate('hospital', 'name');
  if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
  res.json(doctor);
};

// Get analytics for admin dashboard
const getAnalytics = async (req, res) => {
  const { hospitalId } = req.params;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const totalToday = await Appointment.countDocuments({
    hospital: hospitalId,
    createdAt: { $gte: today, $lt: tomorrow },
  });

  const completed = await Appointment.countDocuments({
    hospital: hospitalId,
    status: 'completed',
    createdAt: { $gte: today, $lt: tomorrow },
  });

  const activeQueue = await Appointment.countDocuments({
    hospital: hospitalId,
    status: 'approved',
    date: { $gte: today, $lt: tomorrow },
  });

  // Average waiting time - average consultationTime across all doctors in hospital
  const doctors = await Doctor.find({ hospital: hospitalId });
  const avgConsultation = doctors.length
    ? Math.round(doctors.reduce((sum, d) => sum + d.consultationTime, 0) / doctors.length)
    : 15;

  // Weekly data for chart (last 7 days)
  const weeklyData = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date();
    day.setDate(day.getDate() - i);
    day.setHours(0, 0, 0, 0);
    const nextDay = new Date(day);
    nextDay.setDate(nextDay.getDate() + 1);
    const count = await Appointment.countDocuments({
      hospital: hospitalId,
      createdAt: { $gte: day, $lt: nextDay },
    });
    weeklyData.push({ date: day.toLocaleDateString('en-US', { weekday: 'short' }), patients: count });
  }

  res.json({ totalToday, completed, activeQueue, avgWaitTime: avgConsultation, weeklyData, doctorCount: doctors.length });
};

module.exports = { updateDoctor, deleteDoctor, getDoctorById, getAnalytics };
