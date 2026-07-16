import { createContext, useContext, useState, useEffect } from 'react';
import socket from '../utils/socket';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(() => {
    const stored = localStorage.getItem('userInfo');
    return stored ? JSON.parse(stored) : null;
  });

  const login = (data) => {
    localStorage.setItem('userInfo', JSON.stringify(data));
    setUserInfo(data);
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    setUserInfo(null);
    socket.disconnect();
  };

  useEffect(() => {
    if (userInfo) {
      socket.connect();
      socket.emit('joinPatient', userInfo._id);
    }
  }, [userInfo]);

  return (
    <AuthContext.Provider value={{ userInfo, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
