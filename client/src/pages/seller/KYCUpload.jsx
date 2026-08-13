import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShieldCheck, Clock, XCircle, ExternalLink, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

const STATUS_CONFIG = {
  not_started: {
    icon: ShieldCheck,
    tone: 'text-slate-400 bg-slate-100',
    title: 'Verify your identity',
    desc: "You'll need to verify your identity before you can list tickets for sale. It only takes a couple of minutes.",
  },
  pending: {
    icon: Clock,
    tone: 'text-gold-600 bg-gold-50',
    title: 'Verification in progress',
    desc: "We're reviewing your documents. This usually takes a few minutes but can take up to 24 hours.",
  },
  verified: {
    icon: ShieldCheck,
    tone: 'text-primary-600 bg-primary-50',
    title: "You're verified!",
    desc: 'Your identity has been confirmed. You can now list tickets and set up payouts.',
  },
  rejected: {
    icon: XCircle,
    tone: 'text-danger bg-red-50',
    title: 'Verification unsuccessful',
    desc: "We couldn't verify your identity with the documents provided. Please try again.",
  },
};

const KYCUpload = () => {
  const { user, refetchUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(user?.kycStatus || 'not_started');

  useEffect(() => {
    // Returning from Stripe's hosted verification flow
    if (searchParams.get('status') === 'complete') {
      refetchUser();
      toast.success('Verification submitted — we\'ll update your status shortly.');
    }
  }, [searchParams, refetchUser]);

  useEffect(() => {
    setStatus(user?.kycStatus || 'not_started');
  }, [user]);

  const handleStartVerification = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/users/kyc/start');
      window.location.href = data.data.verificationUrl;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not start verification.');
      setLoading(false);
    }
  };

  const config = STATUS_CONFIG[status] || STATUS_CONFIG.not_started;
  const Icon = config.icon;

  return (
    <div className="container-page max-w-xl py-10">
      <h1 className="font-display text-display-sm text-ink">Identity verification</h1>
      <p className="mt-1 mb-8 text-slate-500">
        Required before you can list tickets for sale.
      </p>

      <div className="card p-8 text-center">
        <span className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${config.tone}`}>
          <Icon size={28} />
        </span>
        <h2 className="mt-5 font-display text-lg font-semibold text-ink">{config.title}</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">{config.desc}</p>

        {(status === 'not_started' || status === 'rejected') && (
          <button onClick={handleStartVerification} disabled={loading} className="btn-primary mx-auto mt-6 justify-center">
            {loading ? 'Starting...' : 'Start verification'}
            {!loading && <ExternalLink size={15} />}
          </button>
        )}

        {status === 'pending' && (
          <button onClick={refetchUser} className="btn-secondary mx-auto mt-6 justify-center text-sm">
            <RefreshCw size={14} /> Check status
          </button>
        )}

        {status === 'verified' && (
          <a href="/seller/listings/new" className="btn-primary mx-auto mt-6 inline-flex justify-center">
            Create your first listing
          </a>
        )}
      </div>

      <div className="mt-6 rounded-xl border border-slate-100 bg-bg-subtle p-4 text-xs text-slate-500">
        We use Stripe Identity to verify sellers. Your documents are encrypted
        and never stored on MatchPass servers directly.
      </div>
    </div>
  );
};

export default KYCUpload;