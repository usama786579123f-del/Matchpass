import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Ticket, Lock, Eye, EyeOff, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import api from '../../services/api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-6 py-16">
        <div className="flex w-full max-w-sm flex-col items-center gap-3 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-danger">
            <XCircle size={26} />
          </span>
          <h1 className="font-display text-display-sm text-ink">Invalid reset link</h1>
          <p className="text-sm text-slate-500">
            This password reset link is missing or invalid. Please request a new one.
          </p>
          <Link to="/forgot-password" className="btn-primary mt-3">
            Request new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-ink">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 text-white">
            <Ticket size={18} strokeWidth={2.5} />
          </span>
          MatchPass
        </Link>

        {success ? (
          <div className="mt-8 flex flex-col items-center gap-3 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-600">
              <CheckCircle2 size={26} />
            </span>
            <h1 className="font-display text-display-sm text-ink">Password reset!</h1>
            <p className="text-sm text-slate-500">
              Redirecting you to log in...
            </p>
          </div>
        ) : (
          <>
            <h1 className="mt-8 font-display text-display-sm text-ink">Set a new password</h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Choose a strong password you haven't used before.
            </p>

            {error && (
              <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-danger">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink">
                  New password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="input-field pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-ink">
                  Confirm new password
                </label>
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="input-field"
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary justify-center">
                {loading ? 'Resetting...' : 'Reset password'}
                {!loading && <ArrowRight size={16} />}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;