require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db.js');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware.js');
const socketHandler = require('./socket/socketHandler.js');

const authRoutes = require('./routes/authRoutes.js');
const hospitalRoutes = require('./routes/hospitalRoutes.js');
const doctorRoutes = require('./routes/doctorRoutes.js');
const appointmentRoutes = require('./routes/appointmentRoutes.js');
const notificationRoutes = require('./routes/notificationRoutes.js');
const aiRoutes = require('./routes/aiRoutes.js');

connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Store io instance on app for use in controllers
app.set('io', io);

// Middlewares
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);

app.get('/', (req, res) => {
  res.send('Smart Hospital API is running...');
});

// Socket.IO
socketHandler(io);

// Error Handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
