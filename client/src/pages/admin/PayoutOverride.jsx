import { useEffect, useState } from 'react';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatCurrency';
import PayoutOverrideForm from '../../components/admin/PayoutOverrideForm';

const STATUS_STYLES = {
  pending: 'badge-warning',
  processing: 'badge-warning',
  paid: 'badge-success',
  failed: 'badge-danger',
  reversed: 'badge-danger',
  manual_override: 'badge bg-secondary-50 text-secondary-700',
};

const PayoutOverride = () => {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayouts = async () => {
    try {
      const { data } = await api.get('/payouts/admin/all');
      setPayouts(data.data.payouts || []);
    } catch {
      setPayouts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, []);

  return (
    <div className="p-6 sm:p-8">
      <h1 className="font-display text-display-sm text-ink">Payout override</h1>
      <p className="mt-1 text-slate-500">Manually process payouts for stuck or exceptional orders.</p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="card overflow-x-auto p-5">
            {loading ? (
              <div className="h-64 animate-pulse rounded-xl bg-slate-50" />
            ) : payouts.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-500">No payouts yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <th className="pb-3 pr-4">Seller</th>
                    <th className="pb-3 pr-4">Order</th>
                    <th className="pb-3 pr-4">Amount</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((payout) => (
                    <tr key={payout._id} className="border-b border-slate-100 last:border-0">
                      <td className="py-3.5 pr-4 font-medium text-ink">{payout.seller?.name}</td>
                      <td className="py-3.5 pr-4 text-slate-600">{payout.order?.orderNumber}</td>
                      <td className="py-3.5 pr-4 price-mono text-ink">{formatCurrency(payout.amount)}</td>
                      <td className="py-3.5">
                        <span className={STATUS_STYLES[payout.status] || 'badge'}>
                          {payout.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="card p-5">
            <h2 className="mb-4 font-display text-sm font-semibold text-ink">Manual override</h2>
            <PayoutOverrideForm onSuccess={fetchPayouts} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayoutOverride;