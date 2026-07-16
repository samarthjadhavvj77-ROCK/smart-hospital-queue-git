import { useState, useEffect, useMemo } from 'react';
import Sidebar from '../../components/Sidebar';
import NotificationBell from '../../components/NotificationBell';
import API from '../../utils/api';
import socket from '../../utils/socket';

const QueueManagement = () => {
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQueues = async () => {
    try {
      const { data } = await API.get('/appointments/all');
      // Group approved appointments by doctor
      const approved = data.filter(a => a.status === 'approved');
      const grouped = {};
      approved.forEach(appt => {
        const docId = appt.doctor?._id;
        if (!docId) return;
        if (!grouped[docId]) grouped[docId] = { doctor: appt.doctor, appointments: [] };
        grouped[docId].appointments.push(appt);
      });
      // Sort each doctor's queue by tokenNumber
      Object.values(grouped).forEach(g => g.appointments.sort((a, b) => a.tokenNumber - b.tokenNumber));
      setQueues(Object.values(grouped));
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchQueues();
    socket.on('queueUpdated', fetchQueues);
    return () => socket.off('queueUpdated');
  }, []);

  const completeAppointment = async (apptId) => {
    try {
      await API.put(`/appointments/${apptId}/status`, { status: 'completed' });
      fetchQueues();
    } catch (err) {
      alert('Failed to complete appointment');
    }
  };

  const notifyNext = async () => {
    alert('Notification sent to next patient.');
  };

  return (
    <div className="flex bg-surface min-h-screen">
      <Sidebar />
      <main className="ml-64 flex-1 p-lg min-h-screen">
        <header className="flex justify-between items-center mb-lg">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Queue Management</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Live view of all active doctor queues.</p>
          </div>
          <NotificationBell />
        </header>

        {loading ? (
          <div className="space-y-md">
            {[1,2,3].map(i => <div key={i} className="skeleton h-40 rounded-2xl" />)}
          </div>
        ) : queues.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-2xl p-xl text-center card-shadow">
            <span className="material-symbols-outlined text-outline" style={{ fontSize: '64px' }}>location_off</span>
            <p className="font-headline-md text-headline-md text-on-surface mt-md">No Active Queues</p>
            <p className="font-body-md text-on-surface-variant">There are no approved appointments for today.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-lg">
            {queues.map((queue) => (
              <div key={queue.doctor._id} className="bg-surface-container-lowest rounded-2xl card-shadow overflow-hidden flex flex-col">
                <div className="p-md bg-surface-container-low border-b border-outline-variant flex justify-between items-center">
                  <div className="flex items-center gap-sm">
                    <div className="w-10 h-10 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold">
                      {queue.doctor.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-headline-md text-headline-md" style={{ fontSize: '18px' }}>Dr. {queue.doctor.name}</h4>
                      <p className="text-xs text-on-surface-variant">{queue.doctor.department}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">Total Waiting</p>
                    <p className="font-headline-md text-headline-md text-secondary">{queue.appointments.length}</p>
                  </div>
                </div>

                <div className="p-md flex-1 bg-surface-container-lowest">
                  {queue.appointments.length === 0 ? (
                    <p className="text-center text-on-surface-variant py-md">Queue is empty.</p>
                  ) : (
                    <div className="space-y-sm">
                      {queue.appointments.map((appt, idx) => {
                        const isCurrent = idx === 0;
                        return (
                          <div key={appt._id} className={`p-md rounded-xl border flex justify-between items-center transition-colors ${
                            isCurrent ? 'border-primary bg-primary-container/10 ring-1 ring-primary' : 'border-outline-variant'
                          }`}>
                            <div className="flex items-center gap-md">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                                isCurrent ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface'
                              }`}>
                                #{appt.tokenNumber}
                              </div>
                              <div>
                                <p className="font-label-md text-label-md text-on-surface font-bold">{appt.patient?.name}</p>
                                <p className="text-xs text-on-surface-variant">{appt.timeSlot}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-xs">
                              {isCurrent ? (
                                <button onClick={() => completeAppointment(appt._id)} className="btn-primary py-1 px-4 text-sm bg-secondary hover:bg-secondary-fixed hover:text-on-secondary-fixed transition-colors">
                                  Complete
                                </button>
                              ) : idx === 1 ? (
                                <button onClick={() => notifyNext(appt._id)} className="btn-secondary-outline py-1 px-4 text-sm flex items-center gap-1">
                                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>notifications</span> Alert Next
                                </button>
                              ) : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default QueueManagement;
