import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import NotificationBell from '../../components/NotificationBell';
import Modal from '../../components/Modal';
import API from '../../utils/api';

const DoctorManagement = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', department: '' });

  const fetchDoctors = async () => {
    try {
      const { data } = await API.get('/doctors');
      setDoctors(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchDoctors(); }, []);

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    try {
      await API.post('/doctors', form);
      setIsModalOpen(false);
      setForm({ name: '', department: '' });
      fetchDoctors();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add doctor');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this doctor?')) return;
    try {
      await API.delete(`/doctors/${id}`);
      fetchDoctors();
    } catch {
      alert('Failed to delete doctor');
    }
  };

  return (
    <div className="flex bg-surface min-h-screen">
      <Sidebar />
      <main className="ml-64 flex-1 p-lg min-h-screen">
        <header className="flex justify-between items-center mb-lg">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Doctor Directory</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Manage hospital specialists and departments.</p>
          </div>
          <div className="flex items-center gap-sm">
            <NotificationBell />
            <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-xs">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add</span> Add Doctor
            </button>
          </div>
        </header>

        <div className="bg-surface-container-lowest rounded-2xl card-shadow overflow-hidden">
          {loading ? (
            <div className="p-lg space-y-sm">
              {[1,2,3,4].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
            </div>
          ) : doctors.length === 0 ? (
            <div className="p-xl text-center">
              <span className="material-symbols-outlined text-outline" style={{ fontSize: '64px' }}>medical_information</span>
              <p className="font-headline-md text-headline-md text-on-surface mt-md mb-xs">No Doctors Found</p>
              <button onClick={() => setIsModalOpen(true)} className="btn-teal inline-flex">Add First Doctor</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    <th className="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Name</th>
                    <th className="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Department</th>
                    <th className="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Status</th>
                    <th className="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {doctors.map(doc => (
                    <tr key={doc._id} className="hover:bg-surface-container-low transition-colors group">
                      <td className="px-lg py-md">
                        <div className="flex items-center gap-sm">
                          <div className="w-8 h-8 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold text-xs">
                            {doc.name.charAt(0)}
                          </div>
                          <span className="font-label-md text-label-md text-on-surface font-bold">Dr. {doc.name}</span>
                        </div>
                      </td>
                      <td className="px-lg py-md text-on-surface-variant text-sm">{doc.department}</td>
                      <td className="px-lg py-md">
                        <span className="badge badge-completed">Active</span>
                      </td>
                      <td className="px-lg py-md text-right space-x-xs">
                        <button onClick={() => handleDelete(doc._id)} className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container rounded-lg transition-colors">
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Doctor">
          <form onSubmit={handleAddDoctor} className="space-y-md">
            <div className="space-y-xs">
              <label className="font-label-md text-label-md text-on-surface block">Doctor Name</label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                className="input-field" placeholder="Jane Doe" required />
            </div>
            <div className="space-y-xs">
              <label className="font-label-md text-label-md text-on-surface block">Department</label>
              <select value={form.department} onChange={e => setForm({...form, department: e.target.value})}
                className="input-field" required>
                <option value="">Select Department</option>
                {['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'General Medicine'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="pt-sm flex justify-end gap-sm">
              <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary-outline">Cancel</button>
              <button type="submit" className="btn-primary">Save Doctor</button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
};

export default DoctorManagement;
