import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Ticket, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { refetchUser } = useAuth();

  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error');
        setErrorMessage('This verification link is missing a token.');
        return;
      }
      try {
        await api.post('/auth/verify-email', { token });
        setStatus('success');
        refetchUser();
      } catch (err) {
        setStatus('error');
        setErrorMessage(err.response?.data?.message || 'This link is invalid or has expired.');
      }
    };
    verify();
  }, [token, refetchUser]);

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-6 py-16">
      <div className="flex w-full max-w-sm flex-col items-center gap-3 text-center">
        <Link to="/" className="mb-4 flex items-center gap-2 font-display text-xl font-bold text-ink">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 text-white">
            <Ticket size={18} strokeWidth={2.5} />
          </span>
          MatchPass
        </Link>

        {status === 'verifying' && (
          <>
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Loader2 size={26} className="animate-spin" />
            </span>
            <h1 className="font-display text-display-sm text-ink">Verifying your email...</h1>
            <p className="text-sm text-slate-500">This will just take a moment.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-600">
              <CheckCircle2 size={26} />
            </span>
            <h1 className="font-display text-display-sm text-ink">Email verified!</h1>
            <p className="text-sm text-slate-500">Your account is now fully active.</p>
            <Link to="/" className="btn-primary mt-3">
              Continue to MatchPass
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-danger">
              <XCircle size={26} />
            </span>
            <h1 className="font-display text-display-sm text-ink">Verification failed</h1>
            <p className="text-sm text-slate-500">{errorMessage}</p>
            <Link to="/" className="btn-secondary mt-3">
              Back to home
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;