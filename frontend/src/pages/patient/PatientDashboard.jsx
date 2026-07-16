import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from '../../components/Sidebar';
import NotificationBell from '../../components/NotificationBell';
import API from '../../utils/api';
import socket from '../../utils/socket';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';

const PatientDashboard = () => {
  const { userInfo } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const { data } = await API.get('/appointments/myappointments');
      setAppointments(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    socket.on('queueUpdated', fetchData);
    socket.on('appointmentApproved', fetchData);
    return () => { socket.off('queueUpdated'); socket.off('appointmentApproved'); };
  }, []);

  const activeQueue = appointments.find(a => a.status === 'approved');
  const upcoming = appointments.filter(a => ['pending','approved'].includes(a.status)).slice(0, 3);
  const recent = appointments.filter(a => a.status === 'completed').slice(0, 4);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="flex bg-surface min-h-screen">
      <Sidebar />
      <main className="ml-64 flex-1 p-lg min-h-screen">
        {/* Header */}
        <header className="flex justify-between items-center mb-lg">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">
              {greeting}, {userInfo?.name?.split(' ')[0] || 'Patient'}.
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Your health dashboard is up to date for today, {format(new Date(), 'MMM dd, yyyy')}.
            </p>
          </div>
          <div className="flex items-center space-x-sm">
            <NotificationBell />
            <Link to="/patient/book" className="btn-primary">Book Appointment</Link>
          </div>
        </header>

        {/* Bento Grid */}
        <div className="grid grid-cols-12 gap-gutter">

          {/* Jeevika AI Triage Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="col-span-12 rounded-2xl overflow-hidden relative card-shadow"
            style={{ background: 'linear-gradient(135deg, #0d0d0d 0%, #1a0a2e 50%, #0d1a2e 100%)' }}
          >
            <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at 70% 50%, #4f46e5 0%, transparent 60%)' }} />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-lg gap-lg">
              <div className="flex items-center gap-md">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 flex-shrink-0">
                  <span className="material-symbols-outlined text-white text-3xl">health_metrics</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-white text-xl tracking-tight uppercase">JEEVIKA AI</p>
                    <span className="px-2 py-0.5 bg-white/15 text-white/80 text-xs rounded-full border border-white/20 font-medium">Powered by Gemini</span>
                  </div>
                  <p className="text-white/60 text-sm max-w-md">
                    Describe your symptoms by voice or text. Jeevika will assess severity in English, Hindi, Marathi, or Tamil — instantly.
                  </p>
                </div>
              </div>
              <Link
                to="/patient/triage"
                className="flex-shrink-0 flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-xl font-semibold text-sm hover:bg-white/90 transition-all hover:scale-105 active:scale-95"
              >
                <span className="material-symbols-outlined text-sm">mic</span>
                Start Symptom Check
              </Link>
            </div>
          </motion.div>

          {/* Active Queue Card */}
          <div className="col-span-12 md:col-span-8 bg-surface-container-lowest rounded-2xl p-lg card-shadow relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center space-x-xs mb-sm">
                <span className={`w-2 h-2 rounded-full ${activeQueue ? 'bg-secondary live-pulse' : 'bg-outline'}`} />
                <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest">
                  {activeQueue ? 'Active Session' : 'No Active Queue'}
                </span>
              </div>

              {activeQueue ? (
                <>
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-md">
                    <div>
                      <p className="font-body-md text-body-md text-on-surface-variant mb-xs">Your Queue Number</p>
                      <h3 className="font-display-lg text-display-lg text-primary leading-none">#{activeQueue.tokenNumber}</h3>
                    </div>
                    <div className="bg-secondary-container p-md rounded-xl border border-secondary/20">
                      <p className="font-label-sm text-label-sm text-on-secondary-container uppercase">Doctor</p>
                      <p className="font-headline-md text-headline-md text-on-secondary-container">Dr. {activeQueue.doctor?.name}</p>
                      <p className="text-xs text-on-secondary-container/70 mt-0.5">{activeQueue.doctor?.department}</p>
                    </div>
                  </div>
                  <div className="mt-lg pt-lg border-t border-outline-variant flex items-center justify-between">
                    <p className="font-label-sm text-label-sm text-on-surface-variant">Slot: {activeQueue.timeSlot}</p>
                    <Link to="/patient/queue" className="text-secondary font-label-md text-label-md flex items-center hover:underline">
                      View Live Queue <span className="material-symbols-outlined ml-xs text-[18px]">arrow_forward</span>
                    </Link>
                  </div>
                </>
              ) : (
                <div className="py-lg text-center">
                  <span className="material-symbols-outlined text-outline" style={{ fontSize: '56px' }}>pending_actions</span>
                  <p className="font-body-md text-on-surface-variant mt-sm">No active appointments in the queue.</p>
                  <Link to="/patient/book" className="btn-teal inline-flex mt-md">Book an Appointment</Link>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="col-span-12 md:col-span-4 bg-surface-container-lowest rounded-2xl p-lg card-shadow flex flex-col justify-between">
            <div className="flex items-center justify-between mb-md">
              <h4 className="font-headline-md text-headline-md text-on-surface">Your Stats</h4>
            </div>
            <div className="space-y-md">
              {[
                { label: 'Total Visits', value: appointments.filter(a => a.status === 'completed').length, icon: 'check_circle', color: 'bg-secondary-container text-on-secondary-container' },
                { label: 'Upcoming', value: appointments.filter(a => ['pending','approved'].includes(a.status)).length, icon: 'upcoming', color: 'bg-primary-fixed text-on-primary-fixed' },
                { label: 'Total Booked', value: appointments.length, icon: 'calendar_month', color: 'bg-tertiary-fixed text-on-tertiary-fixed' },
              ].map(s => (
                <div key={s.label} className="flex items-center space-x-md">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${s.color}`}>
                    <span className="material-symbols-outlined">{s.icon}</span>
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface">{s.label}</p>
                    <p className="font-headline-md text-headline-md text-primary">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/patient/appointments" className="mt-lg w-full py-sm border border-outline-variant rounded-lg font-label-md text-label-md text-center hover:bg-surface-container-low transition-colors block">
              View All Appointments
            </Link>
          </div>

          {/* Upcoming Appointments */}
          <div className="col-span-12 md:col-span-5 bg-surface-container-lowest rounded-2xl p-lg card-shadow">
            <div className="flex items-center justify-between mb-lg">
              <h4 className="font-headline-md text-headline-md text-on-surface">Upcoming</h4>
              <Link to="/patient/appointments" className="text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined">more_horiz</span>
              </Link>
            </div>

            {loading ? (
              <div className="space-y-sm">{[1,2].map(i => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
            ) : upcoming.length === 0 ? (
              <div className="text-center py-lg">
                <span className="material-symbols-outlined text-outline" style={{ fontSize: '40px' }}>event_busy</span>
                <p className="font-body-md text-on-surface-variant mt-xs">No upcoming appointments.</p>
              </div>
            ) : upcoming.map(appt => (
              <div key={appt._id} className="p-md rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer group mb-sm">
                <div className="flex justify-between items-start mb-sm">
                  <div>
                    <p className="font-label-md text-label-md text-on-surface">Dr. {appt.doctor?.name}</p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">{appt.doctor?.department}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-label-md text-label-md text-primary">{format(new Date(appt.date), 'MMM d')}</p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">{appt.timeSlot}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`badge badge-${appt.status}`}>{appt.status}</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">#{appt.tokenNumber}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Visits */}
          <div className="col-span-12 md:col-span-7 bg-surface-container-lowest rounded-2xl card-shadow overflow-hidden">
            <div className="p-lg border-b border-outline-variant flex items-center justify-between">
              <h4 className="font-headline-md text-headline-md text-on-surface">Recent Visits</h4>
              <Link to="/patient/appointments" className="text-secondary font-label-md text-label-md hover:underline">View All</Link>
            </div>

            {loading ? (
              <div className="p-lg space-y-sm">{[1,2,3].map(i => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
            ) : recent.length === 0 ? (
              <div className="p-lg text-center">
                <span className="material-symbols-outlined text-outline" style={{ fontSize: '40px' }}>history</span>
                <p className="font-body-md text-on-surface-variant mt-xs">No completed visits yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-container-low">
                      <th className="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase">Doctor</th>
                      <th className="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase">Date</th>
                      <th className="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase">Status</th>
                      <th className="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {recent.map(appt => (
                      <tr key={appt._id} className="hover:bg-surface-container-low transition-colors cursor-pointer group">
                        <td className="px-lg py-md">
                          <p className="font-label-md text-label-md text-on-surface">Dr. {appt.doctor?.name}</p>
                          <p className="text-xs text-on-surface-variant">{appt.doctor?.department}</p>
                        </td>
                        <td className="px-lg py-md font-label-md text-label-md text-on-surface">{format(new Date(appt.date), 'MMM d, yyyy')}</td>
                        <td className="px-lg py-md"><span className={`badge badge-${appt.status}`}>{appt.status}</span></td>
                        <td className="px-lg py-md text-right">
                          <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">chevron_right</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default PatientDashboard;
