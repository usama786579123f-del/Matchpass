import { useEffect, useState } from 'react';
import { TrendingUp, AlertCircle, Users } from 'lucide-react';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatCurrency';
import ReportChart from '../../components/admin/ReportChart';

const Reports = () => {
  const [revenue, setRevenue] = useState(null);
  const [disputes, setDisputes] = useState(null);
  const [sellers, setSellers] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [r, d, s] = await Promise.all([
          api.get('/admin/reports/revenue'),
          api.get('/admin/reports/disputes'),
          api.get('/admin/reports/sellers'),
        ]);
        setRevenue(r.data.data);
        setDisputes(d.data.data);
        setSellers(s.data.data);
      } catch {
        // leave as null, sections render empty state
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="p-6 sm:p-8">
        <div className="h-96 animate-pulse rounded-2xl bg-slate-50" />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8">
      <h1 className="font-display text-display-sm text-ink">Reports</h1>
      <p className="mt-1 text-slate-500">Platform performance across revenue, disputes, and sellers.</p>

      {/* Summary cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card flex items-center gap-3 p-5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
            <TrendingUp size={20} />
          </span>
          <div>
            <p className="price-mono text-2xl font-bold text-ink">
              {formatCurrency(revenue?.summary?.totalRevenue || 0)}
            </p>
            <p className="text-sm text-slate-500">Platform revenue</p>
          </div>
        </div>
        <div className="card flex items-center gap-3 p-5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold-50 text-gold-600">
            <AlertCircle size={20} />
          </span>
          <div>
            <p className="text-2xl font-bold text-ink">{disputes?.disputeRate || 0}%</p>
            <p className="text-sm text-slate-500">Dispute rate</p>
          </div>
        </div>
        <div className="card flex items-center gap-3 p-5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary-50 text-secondary-600">
            <Users size={20} />
          </span>
          <div>
            <p className="text-2xl font-bold text-ink">{sellers?.avgPayoutSpeedHours || 0}h</p>
            <p className="text-sm text-slate-500">Avg payout speed</p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Dispute resolution breakdown */}
        <div className="card p-6">
          <h2 className="mb-4 font-display text-sm font-semibold text-ink">Dispute resolutions</h2>
          {disputes?.resolutionBreakdown?.length > 0 ? (
            <ReportChart
              data={disputes.resolutionBreakdown.map((r) => ({ label: r._id?.replace(/_/g, ' ') || 'Unknown', count: r.count }))}
              labelKey="label"
              valueKey="count"
            />
          ) : (
            <p className="text-sm text-slate-400">No resolved disputes yet.</p>
          )}
          <div className="mt-4 flex justify-between border-t border-slate-100 pt-4 text-sm">
            <span className="text-slate-500">Avg. resolution time</span>
            <span className="font-semibold text-ink">{disputes?.avgResolutionTimeHours || 0}h</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Overdue disputes</span>
            <span className={`font-semibold ${disputes?.overdueDisputes > 0 ? 'text-danger' : 'text-ink'}`}>
              {disputes?.overdueDisputes || 0}
            </span>
          </div>
        </div>

        {/* Top sellers */}
        <div className="card p-6">
          <h2 className="mb-4 font-display text-sm font-semibold text-ink">Top sellers</h2>
          {sellers?.topSellers?.length > 0 ? (
            <div className="flex flex-col gap-3">
              {sellers.topSellers.slice(0, 6).map((s, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-ink">{s.sellerName}</p>
                    <p className="text-xs text-slate-400">{s.totalSales} sales</p>
                  </div>
                  <span className="price-mono font-semibold text-ink">{formatCurrency(s.totalRevenue)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No completed sales yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;