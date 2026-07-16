const Appointment = require('../models/Appointment.js');
const Doctor = require('../models/Doctor.js');
const Hospital = require('../models/Hospital.js');
const Queue = require('../models/Queue.js');
const User = require('../models/User.js');

/**
 * Build a rich live-data context string for the AI system prompt.
 * This is injected so the LLM can answer accurately without guessing.
 */
const buildHospitalContext = async (userId, userRole) => {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  let contextLines = [];

  try {
    // --- Hospitals ---
    const hospitals = await Hospital.find({}).lean();
    if (hospitals.length > 0) {
      contextLines.push('=== REGISTERED HOSPITALS ===');
      hospitals.forEach(h => {
        contextLines.push(`• ${h.name} | Address: ${h.address} | Phone: ${h.phone} | Email: ${h.email}`);
      });
    }

    // --- Doctors ---
    const doctors = await Doctor.find({ isAvailable: true }).populate('hospital', 'name').lean();
    if (doctors.length > 0) {
      contextLines.push('\n=== AVAILABLE DOCTORS TODAY ===');
      doctors.forEach(d => {
        const hospitalName = d.hospital ? d.hospital.name : 'Unassigned';
        contextLines.push(`• Dr. ${d.name} | ${d.department} | ${d.qualification} | ${d.experience} yrs exp | Consultation: ${d.consultationTime} min | Hospital: ${hospitalName}`);
      });
    }

    // --- Patient-specific context ---
    if (userRole === 'patient' && userId) {
      const myAppointments = await Appointment.find({
        patient: userId,
        date: { $gte: startOfDay, $lte: endOfDay },
      })
        .populate('doctor', 'name department consultationTime')
        .populate('hospital', 'name')
        .lean();

      if (myAppointments.length > 0) {
        contextLines.push('\n=== PATIENT\'S APPOINTMENTS TODAY ===');
        for (const appt of myAppointments) {
          contextLines.push(`• Token #${appt.tokenNumber} | Dr. ${appt.doctor?.name} (${appt.doctor?.department}) | ${appt.timeSlot} | Status: ${appt.status} | Hospital: ${appt.hospital?.name}`);

          // Queue/Waiting time
          if (appt.status === 'approved' || appt.status === 'pending') {
            const patientsAhead = await Appointment.countDocuments({
              doctor: appt.doctor?._id,
              date: { $gte: startOfDay, $lte: endOfDay },
              tokenNumber: { $lt: appt.tokenNumber },
              status: { $in: ['approved', 'pending'] },
            });
            const consultTime = appt.doctor?.consultationTime || 15;
            const estWaitMins = patientsAhead * consultTime;
            contextLines.push(`  → Patients ahead: ${patientsAhead} | Estimated wait: ~${estWaitMins} minutes`);
          }
        }
      } else {
        contextLines.push('\n=== PATIENT\'S APPOINTMENTS TODAY ===');
        contextLines.push('No appointments scheduled for today.');
      }

      // All upcoming appointments
      const upcomingAppts = await Appointment.find({
        patient: userId,
        date: { $gte: now },
        status: { $in: ['pending', 'approved'] },
      })
        .populate('doctor', 'name department')
        .populate('hospital', 'name')
        .sort({ date: 1 })
        .limit(5)
        .lean();

      if (upcomingAppts.length > 0) {
        contextLines.push('\n=== UPCOMING APPOINTMENTS ===');
        upcomingAppts.forEach(a => {
          const dateStr = new Date(a.date).toDateString();
          contextLines.push(`• ${dateStr} at ${a.timeSlot} | Dr. ${a.doctor?.name} (${a.doctor?.department}) | Token #${a.tokenNumber} | ${a.hospital?.name}`);
        });
      }
    }

    // --- Admin-specific context ---
    if (userRole === 'admin' || userRole === 'hospital_admin') {
      const todayAppts = await Appointment.find({
        date: { $gte: startOfDay, $lte: endOfDay },
      })
        .populate('patient', 'name')
        .populate('doctor', 'name department')
        .lean();

      contextLines.push('\n=== TODAY\'S HOSPITAL STATS ===');
      contextLines.push(`• Total appointments today: ${todayAppts.length}`);
      contextLines.push(`• Pending: ${todayAppts.filter(a => a.status === 'pending').length}`);
      contextLines.push(`• Approved: ${todayAppts.filter(a => a.status === 'approved').length}`);
      contextLines.push(`• Completed: ${todayAppts.filter(a => a.status === 'completed').length}`);
    }

    // --- Queue summary across all doctors ---
    const queues = await Queue.find({
      date: { $gte: startOfDay, $lte: endOfDay },
    }).populate('doctor', 'name department').lean();

    if (queues.length > 0) {
      contextLines.push('\n=== LIVE QUEUE STATUS ===');
      queues.forEach(q => {
        contextLines.push(`• Dr. ${q.doctor?.name} (${q.doctor?.department}) | Current Token: ${q.currentToken} | Total: ${q.totalTokens} | Waiting: ${q.totalTokens - q.currentToken}`);
      });
    }

  } catch (err) {
    contextLines.push(`\n[Context fetch error: ${err.message}]`);
  }

  return contextLines.join('\n');
};

module.exports = { buildHospitalContext };
