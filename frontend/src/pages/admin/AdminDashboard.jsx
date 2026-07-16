import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import NotificationBell from '../../components/NotificationBell';
import API from '../../utils/api';
import socket from '../../utils/socket';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    todayAppointments: 0,
    waitingPatients: 0,
    totalDoctors: 0,
    activeQueues: 0
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data for the chart since the backend doesn't aggregate this yet
  const chartData = [
    { name: 'Mon', wait: 24 },
    { name: 'Tue', wait: 18 },
    { name: 'Wed', wait: 28 },
    { name: 'Thu', wait: 15 },
    { name: 'Fri', wait: 22 },
    { name: 'Sat', wait: 35 },
    { name: 'Sun', wait: 40 },
  ];

  const fetchDashboardData = async () => {
    try {
      const [apptRes, docsRes] = await Promise.all([
        API.get('/appointments/all'),
        API.get('/doctors')
      ]);

      const todayStr = new Date().toISOString().split('T')[0];
      const allAppts = apptRes.data;
      const todayAppts = allAppts.filter(a => new Date(a.date).toISOString().split('T')[0] === todayStr);
      
      setStats({
        todayAppointments: todayAppts.length,
        waitingPatients: todayAppts.filter(a => a.status === 'approved').length,
        totalDoctors: docsRes.data.length,
        activeQueues: new Set(todayAppts.filter(a => a.status === 'approved').map(a => a.doctor._id)).size
      });

      setRecentAppointments(allAppts.slice(0, 5));
    } catch (err) {}
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
    socket.on('queueUpdated', fetchDashboardData);
    socket.on('appointmentApproved', fetchDashboardData);
    return () => { socket.off('queueUpdated'); socket.off('appointmentApproved'); };
  }, []);

  return (
    <div className="flex bg-surface min-h-screen">
      <Sidebar />
      <main className="ml-64 flex-1 p-lg min-h-screen">
        <header className="flex justify-between items-center mb-lg">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Hospital Admin Console</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Overview of today's operations.</p>
          </div>
          <NotificationBell />
        </header>

        {loading ? (
          <div className="grid grid-cols-4 gap-md mb-lg">
            {[1,2,3,4].map(i => <div key={i} className="skeleton h-28 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md mb-lg">
            <div className="bg-surface-container-lowest rounded-2xl p-md card-shadow flex items-center gap-md">
              <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed">
                <span className="material-symbols-outlined">calendar_today</span>
              </div>
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">Today's Visits</p>
                <p className="font-headline-lg text-headline-lg text-on-surface">{stats.todayAppointments}</p>
              </div>
            </div>
            
            <div className="bg-surface-container-lowest rounded-2xl p-md card-shadow flex items-center gap-md">
              <div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center text-on-error-container">
                <span className="material-symbols-outlined">groups</span>
              </div>
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">Waiting</p>
                <p className="font-headline-lg text-headline-lg text-on-surface">{stats.waitingPatients}</p>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl p-md card-shadow flex items-center gap-md">
              <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                <span className="material-symbols-outlined">stethoscope</span>
              </div>
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">Total Doctors</p>
                <p className="font-headline-lg text-headline-lg text-on-surface">{stats.totalDoctors}</p>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl p-md card-shadow flex items-center gap-md">
              <div className="w-12 h-12 rounded-full bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed">
                <span className="material-symbols-outlined">pending_actions</span>
              </div>
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">Active Queues</p>
                <p className="font-headline-lg text-headline-lg text-on-surface">{stats.activeQueues}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-md">
          {/* Chart */}
          <div className="col-span-2 bg-surface-container-lowest rounded-2xl p-lg card-shadow">
            <div className="flex justify-between items-center mb-md">
              <h4 className="font-headline-md text-headline-md text-on-surface">Wait Time Trends</h4>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Avg Minutes</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#76777d', fontSize: 12}} />
                  <Tooltip cursor={{fill: '#f2f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                  <Bar dataKey="wait" fill="#006a61" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent List */}
          <div className="col-span-1 bg-surface-container-lowest rounded-2xl p-lg card-shadow flex flex-col">
            <div className="flex justify-between items-center mb-md">
              <h4 className="font-headline-md text-headline-md text-on-surface">Recent Requests</h4>
              <Link to="/admin/appointments" className="text-secondary font-label-md hover:underline">View All</Link>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-sm pr-1 custom-scrollbar">
              {recentAppointments.length === 0 ? (
                <p className="text-center text-on-surface-variant font-body-md py-lg">No recent appointments</p>
              ) : recentAppointments.map(appt => (
                <div key={appt._id} className="p-md rounded-xl border border-outline-variant hover:bg-surface-container-low transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-label-md text-label-md text-on-surface font-bold">{appt.patient?.name}</p>
                    <span className={`badge badge-${appt.status}`}>{appt.status}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant mb-2">For Dr. {appt.doctor?.name}</p>
                  <p className="text-xs text-outline">{format(new Date(appt.date), 'MMM d')} • {appt.timeSlot}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
