import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';

const RegisterPage = () => {
  const [form, setForm] = useState({ 
    name: '', email: '', phone: '', password: '', confirmPassword: '', role: 'patient',
    hospitalName: '', hospitalAddress: ''
  });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');
    
    if (form.role === 'admin' && !form.hospitalName) {
      return setError('Hospital Name is required for admins');
    }

    setError('');
    setLoading(true);
    try {
      const payload = {
        name: form.name, email: form.email, phone: form.phone, password: form.password, role: form.role,
      };
      
      if (form.role === 'admin') {
        payload.hospitalName = form.hospitalName;
        payload.hospitalAddress = form.hospitalAddress;
      }

      const { data } = await API.post('/auth/register', payload);
      login(data);
      navigate(data.role === 'admin' ? '/admin/dashboard' : '/patient/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-surface flex">
      <div className="hidden lg:flex lg:w-1/2 bg-primary-container relative overflow-hidden flex-col justify-between p-margin-desktop">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <Link to="/" className="font-headline-md text-headline-md font-bold text-on-primary">MediQueue</Link>
        </div>
        <div className="relative z-10 space-y-md">
          <h2 className="font-display-lg text-display-lg text-on-primary leading-tight">Start Your <br/>Health Journey.</h2>
          <p className="font-body-lg text-on-primary-container max-w-sm">Create an account in seconds and gain access to smarter healthcare management for patients and hospitals alike.</p>
        </div>
        <div className="relative z-10">
          <p className="font-label-sm text-label-sm text-on-primary-container">&copy; {new Date().getFullYear()} MediQueue. All rights reserved.</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-gutter overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="w-full max-w-md space-y-lg py-lg">

          <div className="lg:hidden">
            <Link to="/" className="font-headline-md text-headline-md font-bold text-primary">MediQueue</Link>
          </div>

          <div className="space-y-xs">
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Create an account</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">Join MediQueue and manage your healthcare smarter.</p>
          </div>

          {/* Role Toggle */}
          <div className="grid grid-cols-2 gap-xs p-xs bg-surface-container rounded-xl">
            {['patient', 'admin'].map(r => (
              <button key={r} type="button" onClick={() => set('role', r)}
                className={`py-sm rounded-lg font-label-md text-label-md capitalize transition-all ${
                  form.role === r ? 'bg-surface-container-lowest shadow-sm text-primary font-bold' : 'text-on-surface-variant'
                }`}>
                {r === 'admin' ? 'Hospital Admin' : 'Patient'}
              </button>
            ))}
          </div>

          {error && (
            <div className="p-sm rounded-xl bg-error-container border border-error/20 text-on-error-container font-label-md text-label-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-md">
            {form.role === 'admin' && (
              <div className="p-md rounded-xl bg-primary-container/20 border border-primary/20 space-y-md mb-sm">
                <h3 className="font-label-md text-label-md font-bold text-primary uppercase tracking-wider">Hospital Details</h3>
                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-on-surface block">Hospital Name</label>
                  <input type="text" value={form.hospitalName} onChange={e => set('hospitalName', e.target.value)}
                    className="input-field" placeholder="City General Hospital" required={form.role === 'admin'} />
                </div>
                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-on-surface block">Hospital Address</label>
                  <input type="text" value={form.hospitalAddress} onChange={e => set('hospitalAddress', e.target.value)}
                    className="input-field" placeholder="123 Health Ave, Medical District" required={form.role === 'admin'} />
                </div>
              </div>
            )}

            <div className="space-y-xs">
              <label className="font-label-md text-label-md text-on-surface block">
                {form.role === 'admin' ? 'Admin / Contact Name' : 'Full Name'}
              </label>
              <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                className="input-field" placeholder="John Doe" required />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-on-surface block">Email</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  className="input-field" placeholder="you@example.com" required />
              </div>
              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-on-surface block">Phone</label>
                <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                  className="input-field" placeholder="10-digit number" required />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-on-surface block">Password</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)}
                    className="input-field pr-12" placeholder="Create a password" required />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface">
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{showPw ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>
              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-on-surface block">Confirm Password</label>
                <input type={showPw ? 'text' : 'password'} value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)}
                  className="input-field" placeholder="Repeat password" required />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-xs py-sm">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center font-body-md text-on-surface-variant">
            Already have an account?{' '}
            <Link to="/login" className="text-secondary font-bold hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
