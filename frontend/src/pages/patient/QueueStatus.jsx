import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../../components/Sidebar';
import NotificationBell from '../../components/NotificationBell';
import API from '../../utils/api';
import socket from '../../utils/socket';
import { format } from 'date-fns';

const QueueStatus = () => {
  const [appointment, setAppointment] = useState(null);
  const [queueInfo, setQueueInfo] = useState({ currentToken: 0, waitingCount: 0 });
  const [loading, setLoading] = useState(true);

  const fetchQueueData = async () => {
    try {
      const { data: myAppts } = await API.get('/appointments/myappointments');
      const active = myAppts.find(a => a.status === 'approved');
      setAppointment(active);

      if (active) {
        const { data: status } = await API.get(`/appointments/queue-status/${active._id}`);
        setQueueInfo(status);
      }
    } catch (err) {}
    setLoading(false);
  };

  useEffect(() => {
    fetchQueueData();
    socket.on('queueUpdated', fetchQueueData);
    socket.on('appointmentApproved', fetchQueueData);
    return () => { socket.off('queueUpdated'); socket.off('appointmentApproved'); };
  }, []);

  const progress = appointment ? Math.min(100, Math.max(0, 100 - (queueInfo.waitingCount * 15))) : 0;
  const isNext = queueInfo.waitingCount === 0 && appointment?.tokenNumber > 0;

  return (
    <div className="flex bg-surface min-h-screen">
      <Sidebar />
      <main className="ml-64 flex-1 p-lg min-h-screen">
        <header className="flex justify-between items-center mb-lg">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Live Queue Tracker</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Monitor your position in real-time.</p>
          </div>
          <NotificationBell />
        </header>

        {loading ? (
          <div className="max-w-3xl mx-auto space-y-md">
            <div className="skeleton h-64 rounded-2xl" />
            <div className="grid grid-cols-2 gap-md">
              <div className="skeleton h-32 rounded-xl" />
              <div className="skeleton h-32 rounded-xl" />
            </div>
          </div>
        ) : !appointment ? (
          <div className="max-w-3xl mx-auto bg-surface-container-lowest rounded-2xl p-xl text-center card-shadow">
            <span className="material-symbols-outlined text-outline" style={{ fontSize: '64px' }}>location_off</span>
            <h3 className="font-headline-md text-headline-md text-on-surface mt-md mb-xs">No Active Queue</h3>
            <p className="font-body-md text-on-surface-variant">You don't have any approved appointments for today.</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-md">
            
            {/* Main Status */}
            <div className="md:col-span-8 bg-surface-container-lowest rounded-2xl p-lg card-shadow relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-surface-container">
                <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-secondary" />
              </div>

              <div className="flex items-center space-x-xs mb-lg">
                <span className="w-2 h-2 rounded-full bg-secondary live-pulse" />
                <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest">Live Updates</span>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-xl mb-xl">
                <div className="text-center w-full md:w-auto">
                  <p className="font-label-md text-label-md text-on-surface-variant mb-xs uppercase">Your Token</p>
                  <div className={`w-32 h-32 rounded-full flex items-center justify-center border-4 ${isNext ? 'border-primary bg-primary-container text-on-primary-container' : 'border-outline-variant text-primary'} mx-auto`}>
                    <span className="font-display-lg text-display-lg leading-none">#{appointment.tokenNumber}</span>
                  </div>
                </div>

                <div className="flex-1 space-y-lg w-full text-center md:text-left">
                  {isNext ? (
                    <div className="bg-primary-container text-on-primary-container p-md rounded-xl animate-pulse">
                      <h3 className="font-headline-md text-headline-md flex items-center gap-xs justify-center md:justify-start">
                        <span className="material-symbols-outlined">campaign</span> It's Your Turn!
                      </h3>
                      <p className="font-body-md mt-1">Please proceed to Doctor {appointment.doctor.name}'s room.</p>
                    </div>
                  ) : (
                    <>
                      <div>
                        <p className="font-label-md text-label-md text-on-surface-variant mb-1 uppercase">Currently Serving</p>
                        <p className="font-headline-lg text-headline-lg text-primary">#{queueInfo.currentToken}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-sm">
                        <div className="bg-surface-container rounded-lg p-sm">
                          <p className="text-xs text-on-surface-variant uppercase">Ahead of You</p>
                          <p className="font-headline-md text-headline-md text-on-surface">{queueInfo.waitingCount}</p>
                        </div>
                        <div className="bg-secondary-container text-on-secondary-container rounded-lg p-sm">
                          <p className="text-xs uppercase">Est. Wait</p>
                          <p className="font-headline-md text-headline-md">~{queueInfo.waitingCount * 10}m</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Appointment Details */}
            <div className="md:col-span-4 space-y-md">
              <div className="bg-surface-container-lowest rounded-2xl p-md card-shadow">
                <h4 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-sm">Doctor Info</h4>
                <div className="flex items-center gap-sm mb-sm">
                  <div className="w-12 h-12 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold text-xl">
                    {appointment.doctor.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-headline-md text-headline-md text-on-surface" style={{ fontSize: '18px' }}>Dr. {appointment.doctor.name}</p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">{appointment.doctor.department}</p>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-2xl p-md card-shadow space-y-sm">
                <h4 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-sm">Session Details</h4>
                <div className="flex justify-between items-center py-2 border-b border-outline-variant">
                  <span className="font-label-md text-label-md text-on-surface-variant">Date</span>
                  <span className="font-label-md text-label-md text-on-surface font-bold">{format(new Date(appointment.date), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-outline-variant">
                  <span className="font-label-md text-label-md text-on-surface-variant">Time Slot</span>
                  <span className="font-label-md text-label-md text-on-surface font-bold">{appointment.timeSlot}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-label-md text-label-md text-on-surface-variant">Status</span>
                  <span className="badge badge-approved">In Progress</span>
                </div>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
};

export default QueueStatus;
