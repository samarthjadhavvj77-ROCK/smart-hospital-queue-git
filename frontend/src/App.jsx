import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';


import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import PatientDashboard from './pages/patient/PatientDashboard';
import BookAppointment from './pages/patient/BookAppointment';
import MyAppointments from './pages/patient/MyAppointments';
import QueueStatus from './pages/patient/QueueStatus';
import JeevikaTriage from './pages/patient/JeevikaTriage';

import AdminDashboard from './pages/admin/AdminDashboard';
import DoctorManagement from './pages/admin/DoctorManagement';
import QueueManagement from './pages/admin/QueueManagement';
import AppointmentManagement from './pages/admin/AppointmentManagement';
import Billing from './pages/admin/Billing';

const PrivateRoute = ({ children, role }) => {
  const { userInfo } = useAuth();
  if (!userInfo) return <Navigate to="/login" />;
  if (role && userInfo.role !== role) return <Navigate to="/" />;
  return children;
};

const AdminProtectedRoute = ({ children }) => {
  const { userInfo } = useAuth();
  if (!userInfo || userInfo.role !== 'admin') return <Navigate to="/" />;
  if (userInfo.subscriptionStatus === 'expired' && window.location.pathname !== '/admin/billing') {
    return <Navigate to="/admin/billing" />;
  }
  return children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />

    {/* Patient Routes */}
    <Route path="/patient/dashboard" element={<PrivateRoute role="patient"><PatientDashboard /></PrivateRoute>} />
    <Route path="/patient/book" element={<PrivateRoute role="patient"><BookAppointment /></PrivateRoute>} />
    <Route path="/patient/appointments" element={<PrivateRoute role="patient"><MyAppointments /></PrivateRoute>} />
    <Route path="/patient/queue" element={<PrivateRoute role="patient"><QueueStatus /></PrivateRoute>} />
    <Route path="/patient/triage" element={<PrivateRoute role="patient"><JeevikaTriage /></PrivateRoute>} />
    <Route path="/patient/appointments/book" element={<PrivateRoute role="patient"><BookAppointment /></PrivateRoute>} />

    {/* Admin Routes */}
    <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
    <Route path="/admin/doctors" element={<AdminProtectedRoute><DoctorManagement /></AdminProtectedRoute>} />
    <Route path="/admin/queue" element={<AdminProtectedRoute><QueueManagement /></AdminProtectedRoute>} />
    <Route path="/admin/appointments" element={<AdminProtectedRoute><AppointmentManagement /></AdminProtectedRoute>} />
    <Route path="/admin/billing" element={<PrivateRoute role="admin"><Billing /></PrivateRoute>} />
  </Routes>
);



function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <AppRoutes />

        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
