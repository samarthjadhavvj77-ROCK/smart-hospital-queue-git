const ToggleSwitch = ({ checked, onChange, label }) => (
  <label className="flex items-center gap-sm cursor-pointer select-none">
    <div onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        checked ? 'bg-secondary' : 'bg-outline-variant'
      }`}>
      <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
        checked ? 'translate-x-5' : 'translate-x-0'
      }`} />
    </div>
    <span className="font-label-md text-label-md text-on-surface">{label}</span>
  </label>
);

export default ToggleSwitch;
