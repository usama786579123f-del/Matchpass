const SellerStatsWidget = ({ icon: Icon, label, value, tone = 'primary' }) => {
  const toneClasses = {
    primary: 'bg-primary-50 text-primary-600',
    gold: 'bg-gold-50 text-gold-600',
    secondary: 'bg-secondary-50 text-secondary-600',
  };

  return (
    <div className="card flex items-center gap-3 p-5">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${toneClasses[tone]}`}>
        <Icon size={20} />
      </span>
      <div>
        <p className="text-2xl font-bold text-ink">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
};

export default SellerStatsWidget;