import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const patientLinks = [
  { to: '/patient/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/patient/book', icon: 'calendar_add_on', label: 'Book Appointment' },
  { to: '/patient/appointments', icon: 'calendar_today', label: 'My Appointments' },
  { to: '/patient/queue', icon: 'pending_actions', label: 'Queue Tracking' },
];

const adminLinks = [
  { to: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/admin/queue', icon: 'groups', label: 'Queue Management' },
  { to: '/admin/appointments', icon: 'calendar_month', label: 'Appointments' },
  { to: '/admin/doctors', icon: 'stethoscope', label: 'Doctors' },
  { to: '/admin/billing', icon: 'payments', label: 'Billing' },
];

const Sidebar = () => {
  const { userInfo, logout } = useAuth();
  const navigate = useNavigate();
  const links = userInfo?.role === 'admin' ? adminLinks : patientLinks;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-surface-container-lowest border-r border-outline-variant flex flex-col p-md space-y-xs z-50">
      <div className="mb-lg">
        <h1 className="font-headline-md text-headline-md font-bold text-primary">MediQueue</h1>
      </div>

      <div className="flex items-center space-x-sm mb-lg px-xs">
        <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-lg overflow-hidden">
          {userInfo?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="min-w-0">
          <p className="font-label-md text-label-md font-bold text-on-surface truncate">{userInfo?.name || 'User'}</p>
          <p className="text-on-surface-variant text-xs capitalize">{userInfo?.role || 'Guest'} Portal</p>
        </div>
      </div>

      <nav className="flex-1 space-y-xs overflow-y-auto">
        <p className="text-xs font-bold text-outline uppercase tracking-widest mb-2 px-xs">Navigation</p>
        {links.map(({ to, icon, label }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) => isActive ? 'sidebar-link-active' : 'sidebar-link'}>
            <span className="material-symbols-outlined">{icon}</span>
            <span className="font-label-md text-label-md">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="pt-lg border-t border-outline-variant space-y-xs">
        <button onClick={handleLogout} className="sidebar-link w-full text-left">
          <span className="material-symbols-outlined">logout</span>
          <span className="font-label-md text-label-md">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
