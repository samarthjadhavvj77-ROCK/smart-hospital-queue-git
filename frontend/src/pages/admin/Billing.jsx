import { useState } from 'react';
import { format } from 'date-fns';
import Sidebar from '../../components/Sidebar';
import NotificationBell from '../../components/NotificationBell';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';

const Billing = () => {
  const { userInfo, login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const { data } = await API.post('/auth/subscribe');
      // Update local storage and context
      const newAuth = { ...userInfo, ...data };
      login(newAuth);
      alert('Payment successful! Subscription extended by 30 days.');
    } catch (err) {
      alert('Payment failed. Please try again.');
    }
    setLoading(false);
  };

  const getStatusBadge = () => {
    switch (userInfo?.subscriptionStatus) {
      case 'active': return <span className="badge badge-completed text-sm px-4 py-2">Active Subscription</span>;
      case 'trial': return <span className="badge badge-pending text-sm px-4 py-2">Free Trial</span>;
      case 'expired': return <span className="badge badge-cancelled text-sm px-4 py-2">Subscription Expired</span>;
      default: return null;
    }
  };

  const getExpiryDate = () => {
    if (userInfo?.subscriptionStatus === 'trial') return userInfo?.trialExpiresAt;
    return userInfo?.subscriptionExpiresAt;
  };

  const expiry = getExpiryDate();
  const isExpired = userInfo?.subscriptionStatus === 'expired';

  return (
    <div className="flex bg-surface min-h-screen">
      <Sidebar />
      <main className="ml-64 flex-1 p-lg min-h-screen">
        <header className="flex justify-between items-center mb-lg">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Billing & Subscription</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Manage your hospital platform access.</p>
          </div>
          <NotificationBell />
        </header>

        {isExpired && (
          <div className="mb-lg p-md rounded-xl bg-error-container border border-error/20 text-on-error-container font-label-md text-label-md flex items-center gap-xs">
            <span className="material-symbols-outlined">warning</span>
            Your subscription has expired. Please renew to regain access to the admin dashboard and queue management.
          </div>
        )}

        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-lg">
          
          <div className="bg-surface-container-lowest rounded-2xl p-xl card-shadow border border-outline-variant space-y-md">
            <h3 className="font-headline-md text-headline-md text-on-surface">Current Status</h3>
            <div className="py-xs">
              {getStatusBadge()}
            </div>
            
            {expiry && (
              <div className="pt-sm space-y-1">
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">Valid Until</p>
                <p className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  {format(new Date(expiry), 'MMMM d, yyyy')}
                </p>
              </div>
            )}
            
            <div className="pt-md border-t border-outline-variant text-sm text-on-surface-variant">
              Hospital Admin Plan includes:
              <ul className="list-disc pl-4 mt-2 space-y-1">
                <li>Unlimited doctors & departments</li>
                <li>Live Queue Tracking & Patient SMS Alerts</li>
                <li>Advanced wait-time analytics</li>
              </ul>
            </div>
          </div>

          <div className="bg-primary-container rounded-2xl p-xl card-shadow border border-primary/20 space-y-lg flex flex-col justify-between relative overflow-hidden">
             <div className="absolute top-0 right-0 p-lg opacity-10 pointer-events-none">
              <span className="material-symbols-outlined" style={{ fontSize: '120px' }}>payments</span>
            </div>
            
            <div className="relative z-10 space-y-xs">
              <h3 className="font-headline-lg text-headline-lg text-on-primary-container">Renew Access</h3>
              <p className="font-body-md text-on-primary-container max-w-[200px]">Pay your monthly hospital subscription fee to continue using MediQueue.</p>
            </div>
            
            <div className="relative z-10">
              <p className="font-display-lg text-display-lg text-primary">₹5000<span className="text-xl text-on-primary-container/70">/mo</span></p>
            </div>
            
            <button 
              onClick={handlePayment} 
              disabled={loading}
              className="relative z-10 btn-primary w-full py-md font-headline-md text-headline-md shadow-md hover:scale-[1.02] transition-transform">
              {loading ? 'Processing...' : 'Pay ₹5000 Now'}
            </button>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Billing;
