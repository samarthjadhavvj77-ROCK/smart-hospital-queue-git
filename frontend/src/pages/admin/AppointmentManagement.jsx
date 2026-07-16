import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Sidebar from '../../components/Sidebar';
import NotificationBell from '../../components/NotificationBell';
import API from '../../utils/api';
import socket from '../../utils/socket';

const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchAppointments = async () => {
    try {
      const { data } = await API.get('/appointments/all');
      setAppointments(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchAppointments();
    socket.on('queueUpdated', fetchAppointments);
    socket.on('appointmentApproved', fetchAppointments);
    return () => { socket.off('queueUpdated'); socket.off('appointmentApproved'); };
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await API.put(`/appointments/${id}/status`, { status });
      fetchAppointments();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const filtered = appointments.filter(a => filter === 'all' ? true : a.status === filter);

  return (
    <div className="flex bg-surface min-h-screen">
      <Sidebar />
      <main className="ml-64 flex-1 p-lg min-h-screen">
        <header className="flex justify-between items-center mb-lg">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Appointments</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Review and manage all patient bookings.</p>
          </div>
          <NotificationBell />
        </header>

        <div className="bg-surface-container-lowest rounded-2xl card-shadow overflow-hidden">
          <div className="p-md border-b border-outline-variant flex gap-sm overflow-x-auto custom-scrollbar">
            {['all', 'pending', 'approved', 'completed', 'cancelled', 'skipped'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-lg py-1.5 rounded-full font-label-sm text-label-sm uppercase tracking-wider transition-colors ${
                  filter === f ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}>
                {f}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="p-lg space-y-sm">
              {[1,2,3,4,5].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-xl text-center">
              <span className="material-symbols-outlined text-outline" style={{ fontSize: '64px' }}>search_off</span>
              <p className="font-headline-md text-headline-md text-on-surface mt-md mb-xs">No appointments</p>
              <p className="font-body-md text-on-surface-variant">No appointments found matching this filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    <th className="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Patient</th>
                    <th className="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Doctor & Dept</th>
                    <th className="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Date & Time</th>
                    <th className="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Status</th>
                    <th className="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {filtered.map(appt => (
                    <tr key={appt._id} className="hover:bg-surface-container-low transition-colors group">
                      <td className="px-lg py-md">
                        <p className="font-label-md text-label-md text-on-surface font-bold">{appt.patient?.name}</p>
                        <p className="text-xs text-on-surface-variant">{appt.patient?.phone}</p>
                      </td>
                      <td className="px-lg py-md">
                        <p className="font-label-md text-label-md text-on-surface">Dr. {appt.doctor?.name}</p>
                        <p className="text-xs text-on-surface-variant">{appt.doctor?.department}</p>
                      </td>
                      <td className="px-lg py-md">
                        <p className="font-label-md text-label-md text-on-surface">{format(new Date(appt.date), 'MMM d, yyyy')}</p>
                        <p className="text-xs text-on-surface-variant">{appt.timeSlot}</p>
                      </td>
                      <td className="px-lg py-md">
                        <span className={`badge badge-${appt.status}`}>{appt.status}</span>
                      </td>
                      <td className="px-lg py-md text-right space-x-xs">
                        {appt.status === 'pending' && (
                          <>
                            <button onClick={() => handleStatusChange(appt._id, 'approved')} className="p-1.5 text-on-surface-variant hover:text-secondary hover:bg-secondary-container rounded-lg transition-colors" title="Approve">
                              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>check_circle</span>
                            </button>
                            <button onClick={() => handleStatusChange(appt._id, 'cancelled')} className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container rounded-lg transition-colors" title="Cancel">
                              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>cancel</span>
                            </button>
                          </>
                        )}
                        {appt.status === 'approved' && (
                          <button onClick={() => handleStatusChange(appt._id, 'skipped')} className="p-1.5 text-on-surface-variant hover:text-amber-600 hover:bg-amber-100 rounded-lg transition-colors" title="Mark No-Show">
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>person_cancel</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AppointmentManagement;
