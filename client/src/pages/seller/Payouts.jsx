import { useEffect, useState } from 'react';
import { Wallet, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency } from '../../utils/formatCurrency';
import PayoutCard from '../../components/seller/PayoutCard';

const Payouts = () => {
  const { user } = useAuth();
  const [payouts, setPayouts] = useState([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [loading, setLoading] = useState(true);
  const [onboarding, setOnboarding] = useState(false);

  useEffect(() => {
    const fetchPayouts = async () => {
      try {
        const response = await api.get('/payouts/my-payouts');
        setPayouts(response.data.data.payouts || []);
        setTotalEarned(response.data.meta?.totalEarned || 0);
      } catch (err) {
        setPayouts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPayouts();
  }, []);

  const handleSetupPayouts = async () => {
    setOnboarding(true);
    try {
      const response = await api.post('/users/connect/onboard');
      window.location.href = response.data.data.onboardingUrl;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not start payout setup.');
      setOnboarding(false);
    }
  };

  const payoutsReady = user?.stripeConnectComplete;

  return (
    <div className="container-page py-10">
      <h1 className="font-display text-display-sm text-ink">Payouts</h1>
      <p className="mt-1 text-slate-500">Track your earnings from ticket sales.</p>

      {!payoutsReady ? (
        <div className="card mt-6 flex flex-col items-start gap-4 border border-gold-200 bg-gold-50 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-ink">Set up your payout account</p>
            <p className="mt-1 text-sm text-slate-600">
              Connect a bank account via Stripe to receive payments from your sales.
            </p>
          </div>
          <button
            onClick={handleSetupPayouts}
            disabled={onboarding}
            className="btn-primary shrink-0 !bg-gold-500 hover:!bg-gold-600"
          >
            {onboarding ? 'Redirecting...' : 'Set up payouts'}
            {!onboarding && <ExternalLink size={15} />}
          </button>
        </div>
      ) : null}

      <div className="card mt-6 flex items-center gap-4 bg-gradient-to-br from-ink to-secondary-800 p-6">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-primary-400">
          <Wallet size={22} />
        </span>
        <div>
          <p className="price-mono text-3xl font-bold text-white">{formatCurrency(totalEarned)}</p>
          <p className="text-sm text-white/60">Total earned to date</p>
        </div>
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="card h-20 animate-pulse bg-slate-50" />
            ))}
          </div>
        ) : payouts.length === 0 ? (
          <div className="card flex flex-col items-center justify-center gap-2 py-14 text-center">
            <Wallet className="text-slate-300" size={32} />
            <p className="font-semibold text-ink">No payouts yet</p>
            <p className="text-sm text-slate-500">Payouts appear here once your sales are completed.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {payouts.map((payout) => (
              <PayoutCard key={payout._id} payout={payout} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Payouts;