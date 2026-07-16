import { createContext, useContext, useState, useEffect } from 'react';
import API from '../utils/api';
import socket from '../utils/socket';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { userInfo } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const fetchNotifications = async () => {
    if (!userInfo) return;
    try {
      const { data } = await API.get('/notifications');
      setNotifications(data);
    } catch (e) {}
  };

  const markAllRead = async () => {
    try {
      await API.put('/notifications/readall');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {}
  };

  useEffect(() => {
    fetchNotifications();
  }, [userInfo]);

  useEffect(() => {
    const handleNew = (data) => {
      setNotifications((prev) => [
        { _id: Date.now(), ...data, isRead: false, createdAt: new Date() },
        ...prev,
      ]);
    };
    socket.on('yourTokenCalled', (data) =>
      handleNew({ title: '🔔 Your Token Called!', message: `Token #${data.tokenNumber} is now being served.`, type: 'success' })
    );
    socket.on('appointmentApproved', (data) =>
      handleNew({ title: '✅ Appointment Approved', message: 'Your appointment has been approved.', type: 'success' })
    );
    socket.on('appointmentCancelled', (data) =>
      handleNew({ title: '❌ Appointment Cancelled', message: 'Your appointment has been cancelled.', type: 'error' })
    );
    return () => {
      socket.off('yourTokenCalled');
      socket.off('appointmentApproved');
      socket.off('appointmentCancelled');
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAllRead, fetchNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
