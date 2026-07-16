import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { userInfo, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav className={`sticky top-0 z-50 border-b border-outline-variant transition-all duration-200 ${
      scrolled ? 'py-2 glass-header shadow-card' : 'py-4 bg-surface'
    }`}>
      <div className="flex justify-between items-center px-gutter w-full max-w-7xl mx-auto">
        <Link to="/" className="font-headline-md text-headline-md font-bold text-primary">MediQueue</Link>

        <div className="hidden md:flex items-center space-x-lg">
          <a href="#features" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">Features</a>
          <a href="#" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">How it Works</a>
        </div>

        <div className="flex items-center gap-sm">
          {userInfo ? (
            <>
              <NotificationBell />
              <span className="font-label-md text-label-md text-on-surface-variant hidden sm:block">
                Hi, <span className="text-primary font-bold">{userInfo.name?.split(' ')[0]}</span>
              </span>
              <button onClick={handleLogout}
                className="px-md py-xs font-label-md text-label-md text-secondary border border-outline-variant rounded-lg hover:bg-secondary-container transition-all">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-md py-xs font-label-md text-label-md text-secondary border border-outline-variant rounded-lg hover:bg-secondary-container transition-all">
                Track
              </Link>
              <Link to="/register" className="px-md py-xs font-label-md text-label-md bg-primary text-on-primary rounded-lg shadow-sm hover:opacity-90 transition-all">
                Book
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
