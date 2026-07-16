import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', { email, password });
      login(data);
      navigate(data.role === 'admin' ? '/admin/dashboard' : '/patient/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-container relative overflow-hidden flex-col justify-between p-margin-desktop">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <Link to="/" className="font-headline-md text-headline-md font-bold text-on-primary">MediQueue</Link>
        </div>
        <div className="relative z-10 space-y-md">
          <h2 className="font-display-lg text-display-lg text-on-primary leading-tight">Healthcare, <br/>Simplified.</h2>
          <p className="font-body-lg text-on-primary-container max-w-sm">Join thousands of patients managing their visits smarter with real-time queue tracking and instant booking.</p>
          <div className="flex gap-md pt-sm">
            {[{ n: '50+', l: 'Hospitals' }, { n: '500k+', l: 'Patients' }, { n: '45%', l: 'Less Wait' }].map(s => (
              <div key={s.l}>
                <p className="font-headline-md text-headline-md text-secondary-fixed font-bold">{s.n}</p>
                <p className="font-label-sm text-label-sm text-on-primary-container uppercase tracking-wider">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10">
          <p className="font-label-sm text-label-sm text-on-primary-container">&copy; {new Date().getFullYear()} MediQueue. All rights reserved.</p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-gutter">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="w-full max-w-md space-y-lg">

          <div className="lg:hidden mb-lg">
            <Link to="/" className="font-headline-md text-headline-md font-bold text-primary">MediQueue</Link>
          </div>

          <div className="space-y-xs">
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Welcome back</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">Sign in to your account to continue.</p>
          </div>

          {error && (
            <div className="p-sm rounded-xl bg-error-container border border-error/20 text-on-error-container font-label-md text-label-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-md">
            <div className="space-y-xs">
              <label className="font-label-md text-label-md text-on-surface block">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="input-field" placeholder="you@example.com" required />
            </div>

            <div className="space-y-xs">
              <label className="font-label-md text-label-md text-on-surface block">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  className="input-field pr-12" placeholder="Enter your password" required />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors">
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{showPw ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-xs py-sm">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center font-body-md text-on-surface-variant">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-secondary font-bold hover:underline">Register here</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
