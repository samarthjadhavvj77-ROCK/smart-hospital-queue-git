import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-xl pb-24 hero-gradient">
        <div className="max-w-7xl mx-auto px-gutter grid grid-cols-1 lg:grid-cols-2 gap-lg items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="space-y-md">
            <div className="inline-flex items-center gap-xs px-xs py-1 rounded-full bg-secondary-container text-on-secondary-container">
              <span className="material-symbols-outlined text-sm">verified</span>
              <span className="text-label-sm font-label-sm uppercase tracking-wider">Trusted by 50+ Hospitals</span>
            </div>
            <h1 className="font-display-lg text-display-lg text-primary tracking-tight">
              Skip the Wait. Manage Your Hospital Visit Smarter.
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
              Experience a revolutionary way to handle medical queues. Real-time tracking, instant booking, and reduced wait times for a stress-free healthcare experience.
            </p>
            <div className="flex flex-wrap gap-sm pt-xs">
              <Link to="/register" className="btn-teal">Book Appointment</Link>
              <Link to="/login" className="btn-secondary-outline">Track Queue</Link>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.15 }} className="relative">
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-secondary-container/20 rounded-full blur-3xl" />
            <div className="rounded-2xl overflow-hidden border border-outline-variant shadow-xl bg-white aspect-video flex items-center justify-center">
              <img
                className="w-full h-full object-cover"
                src="https://images.unsplash.com/photo-1504439468489-c8920d796a29?auto=format&fit=crop&q=80&w=1200"
                alt="Modern hospital"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-xl bg-surface-container-lowest border-y border-outline-variant">
        <div className="max-w-7xl mx-auto px-gutter">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-lg text-center">
            {[
              { value: '500k+', label: 'Patients Served' },
              { value: '120+', label: 'Partner Hospitals' },
              { value: '45%', label: 'Wait Time Reduced' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className={`space-y-xs p-md ${i < 2 ? 'border-b md:border-b-0 md:border-r border-outline-variant' : ''}`}>
                <p className="font-display-lg text-display-lg text-secondary">{s.value}</p>
                <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="py-xl" id="features">
        <div className="max-w-7xl mx-auto px-gutter">
          <div className="text-center max-w-2xl mx-auto mb-xl space-y-sm">
            <h2 className="font-headline-lg text-headline-lg text-primary">Everything you need for a seamless visit</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Intelligent tools designed for both patients and healthcare providers to eliminate queue friction.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-md" style={{ gridAutoRows: '280px' }}>
            <div className="md:col-span-8 rounded-2xl border border-outline-variant p-lg bg-white relative overflow-hidden group">
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="space-y-xs max-w-md">
                  <span className="material-symbols-outlined text-secondary text-4xl">pending_actions</span>
                  <h3 className="font-headline-md text-headline-md">Real-Time Queue Tracking</h3>
                  <p className="font-body-md text-on-surface-variant">Live updates on your position in the queue. No more guessing when it's your turn. Spend your time where it matters.</p>
                </div>
                <button className="flex items-center gap-xs font-label-md text-secondary group-hover:gap-md transition-all">
                  Learn More <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
              <div className="absolute right-0 bottom-0 w-1/2 h-full hidden lg:block opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                <span className="material-symbols-outlined" style={{ fontSize: '200px' }}>format_list_numbered</span>
              </div>
            </div>
            <div className="md:col-span-4 rounded-2xl border border-outline-variant p-lg bg-secondary-container/10">
              <div className="h-full flex flex-col justify-between">
                <div className="space-y-xs">
                  <span className="material-symbols-outlined text-secondary text-4xl">event_available</span>
                  <h3 className="font-headline-md text-headline-md">Smart Booking</h3>
                  <p className="font-body-md text-on-surface-variant">Schedule visits across multiple departments with a single tap.</p>
                </div>
              </div>
            </div>
            <div className="md:col-span-4 rounded-2xl border border-outline-variant p-lg bg-white">
              <div className="h-full flex flex-col justify-between">
                <div className="space-y-xs">
                  <span className="material-symbols-outlined text-secondary text-4xl">notifications_active</span>
                  <h3 className="font-headline-md text-headline-md">Live Alerts</h3>
                  <p className="font-body-md text-on-surface-variant">Receive instant notifications when you are next in line.</p>
                </div>
              </div>
            </div>
            <div className="md:col-span-8 rounded-2xl border border-outline-variant p-lg bg-surface-container-high relative overflow-hidden">
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="space-y-xs max-w-md">
                  <span className="material-symbols-outlined text-secondary text-4xl">analytics</span>
                  <h3 className="font-headline-md text-headline-md">Hospital Insights</h3>
                  <p className="font-body-md text-on-surface-variant">Administrators get deep analytics on patient flow, helping to optimize staffing and resource allocation.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-xl bg-surface-container-low border-t border-outline-variant">
        <div className="max-w-7xl mx-auto px-gutter">
          <h2 className="font-headline-lg text-headline-lg text-center mb-xl">How MediQueue Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-md relative">
            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-outline-variant -z-10" />
            {[
              { n: 1, title: 'Find Provider', desc: 'Search for your hospital or specialist clinic on our platform.' },
              { n: 2, title: 'Digital Token', desc: 'Secure your spot and receive a digital token instantly.' },
              { n: 3, title: 'Track Live', desc: 'Monitor queue progress from anywhere via our portal.' },
              { n: 4, title: 'Seamless Visit', desc: 'Arrive just in time for your consultation. No wasted hours.' },
            ].map(step => (
              <div key={step.n} className="flex flex-col items-center text-center space-y-sm">
                <div className="w-24 h-24 rounded-full bg-white border-4 border-secondary flex items-center justify-center font-display-lg text-display-lg text-secondary shadow-sm">
                  {step.n}
                </div>
                <h4 className="font-headline-md text-headline-md">{step.title}</h4>
                <p className="font-body-md text-on-surface-variant">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-xl">
        <div className="max-w-7xl mx-auto px-gutter grid grid-cols-1 lg:grid-cols-2 gap-xl">
          <div className="p-lg rounded-2xl bg-white border border-outline-variant space-y-md card-shadow">
            <h3 className="font-headline-lg text-headline-lg text-secondary flex items-center gap-xs">
              <span className="material-symbols-outlined">person</span> For Patients
            </h3>
            <ul className="space-y-sm">
              {[
                'Reduce exposure to hospital-borne illnesses by minimizing waiting room time.',
                'Personalized notifications and estimated appointment times.',
                'Easy rescheduling and historical visit tracking.',
              ].map((item, i) => (
                <li key={i} className="flex gap-sm items-start">
                  <span className="material-symbols-outlined text-on-secondary-container bg-secondary-container p-1 rounded-lg flex-shrink-0">check</span>
                  <p className="font-body-md">{item}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="p-lg rounded-2xl bg-primary-container space-y-md">
            <h3 className="font-headline-lg text-headline-lg text-on-primary-container flex items-center gap-xs">
              <span className="material-symbols-outlined">local_hospital</span> For Hospitals
            </h3>
            <ul className="space-y-sm">
              {[
                'Optimize doctor schedules and patient flow across departments.',
                'Reduce lobby crowding and improve patient satisfaction scores.',
                'Data-driven insights to manage peak hospital hours effectively.',
              ].map((item, i) => (
                <li key={i} className="flex gap-sm items-start">
                  <span className="material-symbols-outlined text-primary-container bg-on-primary-container p-1 rounded-lg flex-shrink-0">check</span>
                  <p className="font-body-md text-on-primary-container">{item}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-xl bg-surface border-t border-outline-variant">
        <div className="max-w-7xl mx-auto px-gutter">
          <h2 className="font-headline-lg text-headline-lg text-center mb-xl">What People Are Saying</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            {[
              { quote: '"MediQueue saved me two hours of waiting in a crowded clinic. I tracked my number from home and arrived just in time!"', name: 'Sarah Jenkins', role: 'Patient', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face' },
              { quote: '"As a hospital administrator, implementing this system has reduced patient complaints by 60%. Highly recommend!"', name: 'Dr. Michael Chen', role: 'Medical Director', img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=80&h=80&fit=crop&crop=face' },
              { quote: '"The SMS alerts are a game changer. I could run errands nearby while waiting for my turn at the pharmacy."', name: 'James Wilson', role: 'Software Engineer', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face' },
            ].map((t, i) => (
              <div key={i} className="glass-card p-md rounded-2xl space-y-sm">
                <div className="flex text-on-secondary-container">
                  {[...Array(5)].map((_, s) => <span key={s} className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>)}
                </div>
                <p className="font-body-md italic text-on-surface-variant">{t.quote}</p>
                <div className="flex items-center gap-sm">
                  <img src={t.img} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="font-label-md text-label-md">{t.name}</p>
                    <p className="text-xs text-on-surface-variant">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-xl">
        <div className="max-w-7xl mx-auto px-gutter">
          <div className="bg-primary-container rounded-2xl p-xl text-center space-y-md relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-transparent pointer-events-none" />
            <h2 className="font-headline-lg text-headline-lg text-on-primary relative z-10">Ready to transform your healthcare experience?</h2>
            <p className="font-body-lg text-on-primary-container max-w-2xl mx-auto relative z-10">Join thousands of patients and leading hospitals using MediQueue.</p>
            <div className="flex justify-center gap-md relative z-10">
              <Link to="/register" className="px-xl py-md bg-secondary-container text-on-secondary-container font-headline-md text-headline-md rounded-xl hover:scale-105 transition-transform">
                Get Started Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-xl px-margin-desktop grid grid-cols-1 md:grid-cols-2 gap-md bg-surface-container-highest border-t border-outline-variant">
        <div className="space-y-sm">
          <div className="font-headline-md text-headline-md font-bold text-primary">MediQueue</div>
          <p className="text-on-surface-variant font-label-sm text-label-sm max-w-xs">Smart queue management systems for modern healthcare facilities and patients globally.</p>
        </div>
        <div className="flex flex-col md:items-end justify-between space-y-md">
          <div className="flex flex-wrap gap-md">
            {['Privacy Policy', 'Terms of Service', 'Contact Us', 'Support'].map(l => (
              <a key={l} href="#" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors">{l}</a>
            ))}
          </div>
          <p className="font-label-sm text-label-sm text-on-surface">&copy; {new Date().getFullYear()} MediQueue Smart Systems. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
