import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../context/NotificationContext';
import { format } from 'date-fns';

const NotificationBell = () => {
  const { notifications, unreadCount, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="relative w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-container-high transition-colors">
        <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '22px' }}>notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-on-error text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div initial={{ opacity: 0, y: 8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }} transition={{ duration: 0.15 }}
              className="absolute right-0 top-14 w-80 bg-surface-container-lowest rounded-2xl shadow-modal border border-outline-variant z-50 overflow-hidden">
              <div className="flex items-center justify-between px-md py-sm border-b border-outline-variant">
                <h3 className="font-headline-md text-headline-md">Notifications</h3>
                <div className="flex items-center gap-sm">
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-xs text-secondary hover:underline font-label-md">Mark all read</button>
                  )}
                  <button onClick={() => setOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                  </button>
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-lg text-center">
                    <span className="material-symbols-outlined text-outline" style={{ fontSize: '40px' }}>notifications_off</span>
                    <p className="font-body-md text-on-surface-variant mt-xs">No notifications yet</p>
                  </div>
                ) : notifications.slice(0, 10).map(n => (
                  <div key={n._id} className={`px-md py-sm border-b border-outline-variant hover:bg-surface-container-low transition-colors ${!n.isRead ? 'bg-primary-fixed/10' : ''}`}>
                    <div className="flex justify-between items-start gap-sm">
                      <div>
                        <p className="font-label-md text-label-md text-on-surface font-bold">{n.title}</p>
                        <p className="text-xs text-on-surface-variant mt-0.5">{n.message}</p>
                        <p className="text-xs text-outline mt-1">{format(new Date(n.createdAt), 'MMM d, h:mm a')}</p>
                      </div>
                      {!n.isRead && <span className="w-2 h-2 bg-primary rounded-full mt-1 flex-shrink-0" />}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
