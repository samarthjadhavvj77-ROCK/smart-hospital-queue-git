const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join a room for a specific hospital
    socket.on('joinHospital', (hospitalId) => {
      socket.join(`hospital_${hospitalId}`);
      console.log(`Socket ${socket.id} joined hospital_${hospitalId}`);
    });

    // Join a room for a specific patient
    socket.on('joinPatient', (userId) => {
      socket.join(`patient_${userId}`);
      console.log(`Socket ${socket.id} joined patient_${userId}`);
    });

    // Admin calls next token
    socket.on('callNextToken', (data) => {
      // data: { hospitalId, doctorId, tokenNumber, patientUserId }
      io.to(`hospital_${data.hospitalId}`).emit('tokenCalled', data);
      if (data.patientUserId) {
        io.to(`patient_${data.patientUserId}`).emit('yourTokenCalled', data);
      }
    });

    // Queue updated event
    socket.on('queueUpdated', (data) => {
      io.to(`hospital_${data.hospitalId}`).emit('queueUpdated', data);
    });

    // Doctor status changed
    socket.on('doctorStatusChanged', (data) => {
      io.to(`hospital_${data.hospitalId}`).emit('doctorStatusChanged', data);
    });

    // Appointment approved
    socket.on('appointmentApproved', (data) => {
      io.to(`patient_${data.patientUserId}`).emit('appointmentApproved', data);
    });

    // Appointment cancelled
    socket.on('appointmentCancelled', (data) => {
      io.to(`patient_${data.patientUserId}`).emit('appointmentCancelled', data);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = socketHandler;
