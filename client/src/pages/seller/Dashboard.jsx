import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Wallet, TrendingUp, Plus, ShieldAlert } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import SellerStatsWidget from '../../components/seller/SellerStatsWidget';
import { formatCurrency } from '../../utils/formatCurrency';

const Dashboard = () => {
  const { user } = useAuth();
  const [sales, setSales] = useState([]);
  const [payoutTotal, setPayoutTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [salesRes, payoutsRes] = await Promise.all([
          api.get('/orders/my-sales'),
          api.get('/payouts/my-payouts'),
        ]);
        setSales(salesRes.data.data.orders || []);
        setPayoutTotal(payoutsRes.data.meta?.totalEarned || 0);
      } catch {
        setSales([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const activeSales = sales.filter((o) => ['paid_escrow_held', 'proof_uploaded'].includes(o.status));
  const kycVerified = user?.kycStatus === 'verified';

  return (
    <div className="container-page py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-display-sm text-ink">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="mt-1 text-slate-500">Here's how your listings are performing.</p>
        </div>
        {kycVerified && (
          <Link to="/seller/listings/new" className="btn-primary">
            <Plus size={16} /> New listing
          </Link>
        )}
      </div>

      {!kycVerified && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-gold-200 bg-gold-50 px-4 py-3.5">
          <ShieldAlert size={20} className="shrink-0 text-gold-600" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-gold-700">Verification required</p>
            <p className="text-xs text-gold-600">Complete identity verification to start listing tickets.</p>
          </div>
          <Link to="/seller/kyc" className="btn-primary !bg-gold-500 hover:!bg-gold-600 text-sm">
            Verify now
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SellerStatsWidget icon={Ticket} label="Total sales" value={sales.length} tone="primary" />
        <SellerStatsWidget icon={TrendingUp} label="Awaiting delivery" value={activeSales.length} tone="gold" />
        <SellerStatsWidget icon={Wallet} label="Total earned" value={formatCurrency(payoutTotal)} tone="secondary" />
      </div>

      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">Recent sales</h2>
          <Link to="/seller/listings" className="text-sm font-semibold text-primary-600 hover:text-primary-700">
            View listings
          </Link>
        </div>

        {loading ? (
          <div className="card h-32 animate-pulse bg-slate-50" />
        ) : sales.length === 0 ? (
          <div className="card flex flex-col items-center justify-center gap-3 py-14 text-center">
            <Ticket className="text-slate-300" size={32} />
            <p className="font-semibold text-ink">No sales yet</p>
            <p className="text-sm text-slate-500">List your tickets to start selling.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sales.slice(0, 5).map((order) => (
              <div key={order._id} className="card flex items-center justify-between p-4">
                <div>
                  <p className="font-semibold text-ink">
                    {order.event?.homeTeam} vs {order.event?.awayTeam}
                  </p>
                  <p className="text-sm text-slate-500">Buyer: {order.buyer?.name}</p>
                </div>
                <span className="price-mono font-semibold text-ink">{formatCurrency(order.totalAmount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;