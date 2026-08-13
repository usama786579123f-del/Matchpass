import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Ticket, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [twoFactorStep, setTwoFactorStep] = useState(false);
  const [pendingUserId, setPendingUserId] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const redirectForRole = (role) => {
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'seller') return '/seller/dashboard';
    return '/buyer/dashboard';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', formData);

      if (response.data.data.requiresTwoFactor) {
        setPendingUserId(response.data.data.userId);
        setTwoFactorStep(true);
        setLoading(false);
        return;
      }

      localStorage.setItem('matchpass_token', response.data.data.token);
      const user = response.data.data.user;
      toast.success('Welcome back, ' + user.name.split(' ')[0] + '!');

      const redirectTo = location.state?.from?.pathname || redirectForRole(user.role);
      window.location.href = redirectTo;
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const handleTwoFactorSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/2fa/verify-login', {
        userId: pendingUserId,
        token: twoFactorCode,
      });

      localStorage.setItem('matchpass_token', response.data.data.token);
      toast.success('Welcome back!');
      window.location.href = '/admin/dashboard';
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid code.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Left - form */}
      <div className="flex w-full flex-col justify-center px-6 py-16 sm:px-12 lg:w-1/2 lg:px-20">
        <div className="mx-auto w-full max-w-sm">
          <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-ink">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 text-white">
              <Ticket size={18} strokeWidth={2.5} />
            </span>
            MatchPass
          </Link>

          {!twoFactorStep ? (
            <>
              <h1 className="mt-8 font-display text-display-sm text-ink">Welcome back</h1>
              <p className="mt-1.5 text-sm text-slate-500">
                Log in to manage your tickets and orders.
              </p>

              {error ? (
                <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-danger">
                  {error}
                </div>
              ) : null}

              <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      size={17}
                    />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label htmlFor="password" className="block text-sm font-medium text-ink">
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-xs font-medium text-primary-600 hover:text-primary-700"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      size={17}
                    />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="********"
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

                <button type="submit" disabled={loading} className="btn-primary mt-2 justify-center">
                  {loading ? 'Logging in...' : 'Log in'}
                  {!loading ? <ArrowRight size={16} /> : null}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-500">
                Don't have an account?{' '}
                <Link to="/signup" className="font-semibold text-primary-600 hover:text-primary-700">
                  Sign up
                </Link>
              </p>
            </>
          ) : (
            <>
              <div className="mt-8 flex items-center gap-2 text-ink">
                <ShieldCheck size={22} className="text-primary-600" />
                <h1 className="font-display text-display-sm">Two-factor authentication</h1>
              </div>
              <p className="mt-1.5 text-sm text-slate-500">
                Enter the 6-digit code from your authenticator app.
              </p>

              {error ? (
                <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-danger">
                  {error}
                </div>
              ) : null}

              <form onSubmit={handleTwoFactorSubmit} className="mt-6 flex flex-col gap-4">
                <input
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  autoFocus
                  className="input-field text-center font-mono text-2xl tracking-[0.5em]"
                  required
                />
                <button type="submit" disabled={loading} className="btn-primary justify-center">
                  {loading ? 'Verifying...' : 'Verify and log in'}
                  {!loading ? <ArrowRight size={16} /> : null}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTwoFactorStep(false);
                    setTwoFactorCode('');
                    setError('');
                  }}
                  className="text-center text-sm text-slate-500 hover:text-ink"
                >
                  Back to login
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Right - visual */}
      <div className="relative hidden overflow-hidden bg-ink lg:block lg:w-1/2">
        <img
          src="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1600&auto=format&fit=crop"
          alt="Football stadium at night"
          className="h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/10" />
        <div className="absolute bottom-16 left-16 right-16">
          <p className="font-display text-2xl font-semibold leading-snug text-white">
            "Escrow protection meant I never had to worry - funds were only
            released once my ticket was confirmed."
          </p>
          <p className="mt-4 text-sm text-white/60">- MatchPass buyer, Arsenal vs Chelsea</p>
        </div>
      </div>
    </div>
  );
};

export default Login;