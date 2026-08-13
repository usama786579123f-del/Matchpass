import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-ink">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 text-white">
            <Ticket size={18} strokeWidth={2.5} />
          </span>
          MatchPass
        </Link>

        {submitted ? (
          <div className="mt-8 flex flex-col items-center gap-3 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-600">
              <CheckCircle2 size={26} />
            </span>
            <h1 className="font-display text-display-sm text-ink">Check your email</h1>
            <p className="text-sm text-slate-500">
              If an account exists for <strong>{email}</strong>, we've sent a
              password reset link. It expires in 1 hour.
            </p>
            <Link to="/login" className="btn-secondary mt-3 text-sm">
              Back to log in
            </Link>
          </div>
        ) : (
          <>
            <h1 className="mt-8 font-display text-display-sm text-ink">Forgot password?</h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Enter your email and we'll send you a reset link.
            </p>

            {error && (
              <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-danger">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-field pl-10"
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary justify-center">
                {loading ? 'Sending...' : 'Send reset link'}
                {!loading && <ArrowRight size={16} />}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Remembered your password?{' '}
              <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">
                Log in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;