const StatCard = ({ icon: Icon, label, value, color = 'indigo', trend }) => {
  const colors = {
    indigo: { bg: '#e0e7ff', text: '#3730a3', icon: '#4f46e5' },
    cyan:   { bg: '#cffafe', text: '#164e63', icon: '#0891b2' },
    green:  { bg: '#d1fae5', text: '#065f46', icon: '#059669' },
    amber:  { bg: '#fef3c7', text: '#92400e', icon: '#d97706' },
    red:    { bg: '#fee2e2', text: '#991b1b', icon: '#dc2626' },
  };
  const c = colors[color] || colors.indigo;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 flex items-start justify-between">
      <div>
        <p className="text-slate-500 text-sm font-medium mb-1">{label}</p>
        <p className="text-3xl font-bold text-slate-900">{value}</p>
        {trend && <p className="text-xs font-medium mt-2" style={{ color: c.icon }}>{trend}</p>}
      </div>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: c.bg }}>
        <Icon size={22} style={{ color: c.icon }} />
      </div>
    </div>
  );
};

export default StatCard;
