import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Sidebar from '../../components/Sidebar';
import NotificationBell from '../../components/NotificationBell';
import API from '../../utils/api';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = () => {
    API.get('/appointments/myappointments')
      .then(res => setAppointments(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await API.delete(`/appointments/${id}`);
        setAppointments(appointments.filter(appt => appt._id !== id));
      } catch (err) {
        alert('Failed to delete appointment');
      }
    }
  };

  return (
    <div className="flex bg-surface min-h-screen">
      <Sidebar />
      <main className="ml-64 flex-1 p-lg min-h-screen">
        <header className="flex justify-between items-center mb-lg">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">My Appointments</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">View your booking history and upcoming visits.</p>
          </div>
          <NotificationBell />
        </header>

        <div className="bg-surface-container-lowest rounded-2xl card-shadow overflow-hidden">
          {loading ? (
            <div className="p-lg space-y-sm">
              {[1,2,3,4].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
            </div>
          ) : appointments.length === 0 ? (
            <div className="p-xl text-center">
              <span className="material-symbols-outlined text-outline" style={{ fontSize: '64px' }}>calendar_today</span>
              <p className="font-headline-md text-headline-md text-on-surface mt-md">No appointments found</p>
              <p className="font-body-md text-on-surface-variant mt-xs mb-lg">You haven't booked any appointments yet.</p>
              <a href="/patient/book" className="btn-primary inline-flex">Book Now</a>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    <th className="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Appointment</th>
                    <th className="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Booked On</th>
                    <th className="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Doctor</th>
                    <th className="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Token</th>
                    <th className="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Status</th>
                    <th className="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {appointments.map(appt => (
                    <tr key={appt._id} className="hover:bg-surface-container-low transition-colors group">
                      <td className="px-lg py-md">
                        <p className="font-label-md text-label-md text-on-surface">{format(new Date(appt.date), 'MMM d, yyyy')}</p>
                        <p className="text-sm text-on-surface-variant">{appt.timeSlot}</p>
                      </td>
                      <td className="px-lg py-md">
                        <p className="font-label-md text-label-md text-on-surface">{format(new Date(appt.createdAt), 'MMM d, yyyy')}</p>
                        <p className="text-sm text-on-surface-variant">{format(new Date(appt.createdAt), 'hh:mm a')}</p>
                      </td>
                      <td className="px-lg py-md">
                        <p className="font-label-md text-label-md text-on-surface">Dr. {appt.doctor?.name}</p>
                        <p className="text-sm text-on-surface-variant">{appt.doctor?.department}</p>
                      </td>
                      <td className="px-lg py-md font-label-md text-label-md text-on-surface">
                        {appt.tokenNumber > 0 ? `#${appt.tokenNumber}` : '-'}
                      </td>
                      <td className="px-lg py-md">
                        <span className={`badge badge-${appt.status}`}>{appt.status}</span>
                      </td>
                      <td className="px-lg py-md text-right">
                        <button onClick={() => handleDelete(appt._id)}
                          className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title="Delete Appointment">
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
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

export default MyAppointments;
