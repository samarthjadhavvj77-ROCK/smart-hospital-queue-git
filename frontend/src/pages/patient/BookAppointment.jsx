import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import NotificationBell from '../../components/NotificationBell';
import API from '../../utils/api';
import { format, addDays } from 'date-fns';

const BookAppointment = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [hospitals, setHospitals] = useState([]);
  const [departments] = useState(['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'General Medicine']);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({
    hospitalId: '',
    department: '',
    doctorId: '',
    date: '',
    timeSlot: '',
    reason: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.get('/hospitals').then(res => setHospitals(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (form.department && form.hospitalId) {
      API.get(`/doctors?hospital=${form.hospitalId}&department=${form.department}`).then(res => setDoctors(res.data)).catch(() => {});
    }
  }, [form.department, form.hospitalId]);

  const dates = Array.from({length: 14}, (_, i) => addDays(new Date(), i+1));
  const timeSlots = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM'];

  const selectedHospital = hospitals.find(h => h._id === form.hospitalId);
  const selectedDoctor = doctors.find(d => d._id === form.doctorId);

  const handleBook = async () => {
    setLoading(true);
    try {
      await API.post('/appointments', {
        hospital: form.hospitalId,
        doctor: form.doctorId,
        date: form.date,
        timeSlot: form.timeSlot,
        reason: form.reason,
      });
      navigate('/patient/dashboard');
    } catch (err) {
      alert('Failed to book appointment');
    }
    setLoading(false);
  };

  return (
    <div className="flex bg-surface min-h-screen">
      <Sidebar />
      <main className="ml-64 flex-1 p-lg min-h-screen">
        <header className="flex justify-between items-center mb-lg">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Book Appointment</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Schedule a new visit with our specialists.</p>
          </div>
          <NotificationBell />
        </header>

        <div className="max-w-4xl mx-auto bg-surface-container-lowest rounded-2xl card-shadow overflow-hidden">
          {/* Progress Bar */}
          <div className="flex bg-surface-container-low border-b border-outline-variant">
            {['Select Hospital', 'Department', 'Choose Doctor', 'Date & Time', 'Confirm'].map((label, i) => (
              <div key={label} className={`flex-1 p-sm text-center border-r border-outline-variant last:border-0 ${step === i+1 ? 'bg-secondary-container/30' : ''}`}>
                <p className={`font-label-sm text-label-sm uppercase tracking-wider ${step >= i+1 ? 'text-secondary font-bold' : 'text-on-surface-variant'}`}>
                  Step {i+1}
                </p>
                <p className={`font-label-md text-label-md mt-1 ${step >= i+1 ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                  {label}
                </p>
              </div>
            ))}
          </div>

          <div className="p-xl min-h-[400px]">
            {/* Step 1: Hospital */}
            {step === 1 && (
              <div className="space-y-md">
                <h3 className="font-headline-md text-headline-md text-on-surface mb-md">Choose a Hospital</h3>
                {hospitals.length === 0 ? (
                  <p className="text-on-surface-variant font-body-md">No hospitals available.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                    {hospitals.map(hospital => (
                      <button key={hospital._id} onClick={() => setForm({...form, hospitalId: hospital._id, department: '', doctorId: ''})}
                        className={`p-md rounded-xl border flex gap-md items-start text-left transition-all ${
                          form.hospitalId === hospital._id ? 'border-secondary bg-secondary-container/20 ring-1 ring-secondary' : 'border-outline-variant hover:border-outline bg-surface-container-lowest'
                        }`}>
                        <div className="w-12 h-12 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold text-xl flex-shrink-0">
                          <span className="material-symbols-outlined">local_hospital</span>
                        </div>
                        <div>
                          <p className="font-label-md text-label-md text-on-surface font-bold">{hospital.name}</p>
                          <p className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">{hospital.address}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Department */}
            {step === 2 && (
              <div className="space-y-md">
                <h3 className="font-headline-md text-headline-md text-on-surface mb-md">Which department do you need?</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-md">
                  {departments.map(dept => (
                    <button key={dept} onClick={() => setForm({...form, department: dept, doctorId: ''})}
                      className={`p-md rounded-xl border text-left transition-all ${
                        form.department === dept ? 'border-secondary bg-secondary-container/20 ring-1 ring-secondary' : 'border-outline-variant hover:border-outline bg-surface-container-lowest'
                      }`}>
                      <span className="material-symbols-outlined text-secondary mb-sm text-3xl">medical_services</span>
                      <p className="font-label-md text-label-md text-on-surface">{dept}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Doctor */}
            {step === 3 && (
              <div className="space-y-md">
                <h3 className="font-headline-md text-headline-md text-on-surface mb-md">Select a Specialist</h3>
                {doctors.length === 0 ? (
                  <p className="text-on-surface-variant font-body-md">No doctors available in this department at the selected hospital.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                    {doctors.map(doc => (
                      <button key={doc._id} onClick={() => setForm({...form, doctorId: doc._id})}
                        className={`p-md rounded-xl border flex gap-md items-start text-left transition-all ${
                          form.doctorId === doc._id ? 'border-secondary bg-secondary-container/20 ring-1 ring-secondary' : 'border-outline-variant hover:border-outline bg-surface-container-lowest'
                        }`}>
                        <div className="w-12 h-12 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold text-xl flex-shrink-0">
                          {doc.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-label-md text-label-md text-on-surface font-bold">Dr. {doc.name}</p>
                          <p className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">{doc.department}</p>
                          <p className="font-body-md text-sm text-on-surface-variant mt-2 line-clamp-2">Experienced specialist in {doc.department}.</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Date & Time */}
            {step === 4 && (
              <div className="space-y-xl">
                <div>
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-sm">Select Date</h3>
                  <div className="flex gap-sm overflow-x-auto pb-sm custom-scrollbar">
                    {dates.map(date => {
                      const dateStr = date.toISOString().split('T')[0];
                      return (
                        <button key={dateStr} onClick={() => setForm({...form, date: dateStr})}
                          className={`flex-shrink-0 w-20 py-sm rounded-xl border text-center transition-all ${
                            form.date === dateStr ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container-lowest border-outline-variant hover:border-outline text-on-surface'
                          }`}>
                          <p className="font-label-sm text-label-sm uppercase opacity-80">{format(date, 'EEE')}</p>
                          <p className="font-headline-md text-headline-md font-bold mt-1">{format(date, 'd')}</p>
                          <p className="font-label-sm text-label-sm opacity-80">{format(date, 'MMM')}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {form.date && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <h3 className="font-headline-md text-headline-md text-on-surface mb-sm">Select Time Slot</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-sm">
                      {timeSlots.map(time => (
                        <button key={time} onClick={() => setForm({...form, timeSlot: time})}
                          className={`py-2 rounded-lg border font-label-sm text-label-sm transition-all ${
                            form.timeSlot === time ? 'bg-secondary-container text-on-secondary-container border-secondary font-bold' : 'bg-surface-container-lowest border-outline-variant hover:border-outline text-on-surface'
                          }`}>
                          {time}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* Step 5: Confirm */}
            {step === 5 && (
              <div className="space-y-lg max-w-2xl mx-auto">
                <div className="text-center mb-lg">
                  <span className="material-symbols-outlined text-secondary text-5xl mb-sm">event_available</span>
                  <h3 className="font-headline-md text-headline-md text-on-surface">Confirm Appointment Details</h3>
                </div>
                
                <div className="bg-surface-container rounded-2xl p-lg space-y-md">
                  <div className="flex justify-between items-center border-b border-outline-variant pb-sm">
                    <span className="font-label-md text-label-md text-on-surface-variant">Hospital</span>
                    <span className="font-label-md text-label-md text-on-surface font-bold">{selectedHospital?.name}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-outline-variant pb-sm">
                    <span className="font-label-md text-label-md text-on-surface-variant">Doctor</span>
                    <span className="font-label-md text-label-md text-on-surface font-bold">Dr. {selectedDoctor?.name}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-outline-variant pb-sm">
                    <span className="font-label-md text-label-md text-on-surface-variant">Department</span>
                    <span className="font-label-md text-label-md text-on-surface font-bold">{form.department}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-outline-variant pb-sm">
                    <span className="font-label-md text-label-md text-on-surface-variant">Date</span>
                    <span className="font-label-md text-label-md text-on-surface font-bold">{form.date ? format(new Date(form.date), 'MMMM d, yyyy') : ''}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-label-md text-label-md text-on-surface-variant">Time Slot</span>
                    <span className="font-label-md text-label-md text-on-surface font-bold">{form.timeSlot}</span>
                  </div>
                </div>

                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-on-surface block">Reason for visit (Optional)</label>
                  <textarea value={form.reason} onChange={e => setForm({...form, reason: e.target.value})}
                    className="input-field min-h-[100px]" placeholder="Briefly describe your symptoms..." />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-lg bg-surface border-t border-outline-variant flex justify-between items-center">
            {step > 1 ? (
              <button onClick={() => setStep(s => s - 1)} className="btn-secondary-outline">Back</button>
            ) : <div />}
            
            {step < 5 ? (
              <button onClick={() => setStep(s => s + 1)}
                disabled={
                  (step === 1 && !form.hospitalId) ||
                  (step === 2 && !form.department) ||
                  (step === 3 && !form.doctorId) ||
                  (step === 4 && (!form.date || !form.timeSlot))
                }
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
                Continue
              </button>
            ) : (
              <button onClick={handleBook} disabled={loading} className="btn-primary min-w-[150px]">
                {loading ? 'Confirming...' : 'Confirm Booking'}
              </button>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default BookAppointment;
