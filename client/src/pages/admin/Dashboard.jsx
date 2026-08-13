import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, ListChecks, AlertCircle, TrendingUp } from 'lucide-react';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatCurrency';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [revenue, disputes, listings] = await Promise.all([
          api.get('/admin/reports/revenue'),
          api.get('/admin/reports/disputes'),
          api.get('/admin/listings?status=pending'),
        ]);
        setStats({
          revenue: revenue.data.data.summary,
          disputes: disputes.data.data,
          pendingListings: listings.data.data.listings?.length || 0,
        });
      } catch {
        setStats(null);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-6 sm:p-8">
        <div className="h-64 animate-pulse rounded-2xl bg-slate-50" />
      </div>
    );
  }

  const cards = [
    {
      icon: TrendingUp,
      label: 'Total revenue',
      value: formatCurrency(stats?.revenue?.totalRevenue || 0),
      tone: 'primary',
      link: '/admin/reports',
    },
    {
      icon: ListChecks,
      label: 'Pending listings',
      value: stats?.pendingListings || 0,
      tone: 'gold',
      link: '/admin/listings',
    },
    {
      icon: AlertCircle,
      label: 'Open disputes',
      value: stats?.disputes?.openDisputes || 0,
      tone: 'danger',
      link: '/admin/disputes',
    },
    {
      icon: Users,
      label: 'Total orders',
      value: stats?.disputes?.totalOrders || 0,
      tone: 'secondary',
      link: '/admin/users',
    },
  ];

  const toneClasses = {
    primary: 'bg-primary-50 text-primary-600',
    gold: 'bg-gold-50 text-gold-600',
    danger: 'bg-red-50 text-danger',
    secondary: 'bg-secondary-50 text-secondary-600',
  };

  return (
    <div className="p-6 sm:p-8">
      <h1 className="font-display text-display-sm text-ink">Admin overview</h1>
      <p className="mt-1 text-slate-500">Platform health at a glance.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ icon: Icon, label, value, tone, link }) => (
          <Link key={label} to={link} className="card card-hover flex items-center gap-3 p-5">
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${toneClasses[tone]}`}>
              <Icon size={20} />
            </span>
            <div>
              <p className="text-2xl font-bold text-ink">{value}</p>
              <p className="text-sm text-slate-500">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link to="/admin/listings" className="card card-hover p-5 text-center">
          <p className="font-semibold text-ink">Review listings</p>
          <p className="mt-1 text-sm text-slate-500">Approve or reject pending tickets</p>
        </Link>
        <Link to="/admin/disputes" className="card card-hover p-5 text-center">
          <p className="font-semibold text-ink">Resolve disputes</p>
          <p className="mt-1 text-sm text-slate-500">Review buyer complaints</p>
        </Link>
        <Link to="/admin/events" className="card card-hover p-5 text-center">
          <p className="font-semibold text-ink">Manage events</p>
          <p className="mt-1 text-sm text-slate-500">Add new fixtures</p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;