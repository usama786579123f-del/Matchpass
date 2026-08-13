import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Ticket, Mail, Lock, User, Eye, EyeOff, ArrowRight, ShoppingBag, Store } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'buyer',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await signup(formData);
      toast.success(`Welcome to MatchPass, ${user.name.split(' ')[0]}!`);
      navigate(user.role === 'seller' ? '/seller/kyc' : '/buyer/dashboard', { replace: true });
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      setError(apiErrors?.[0]?.message || err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Left — visual */}
      <div className="relative hidden overflow-hidden bg-ink lg:block lg:w-1/2">
        <img
          src="https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?q=80&w=1600&auto=format&fit=crop"
          alt="Football fans celebrating"
          className="h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/10" />
        <div className="absolute bottom-16 left-16 right-16">
          <p className="font-display text-2xl font-semibold leading-snug text-white">
            Join thousands of fans buying and selling tickets safely across
            the UK.
          </p>
          <p className="mt-4 text-sm text-white/60">Escrow protected · KYC verified sellers</p>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex w-full flex-col justify-center px-6 py-16 sm:px-12 lg:w-1/2 lg:px-20">
        <div className="mx-auto w-full max-w-sm">
          <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-ink">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 text-white">
              <Ticket size={18} strokeWidth={2.5} />
            </span>
            MatchPass
          </Link>

          <h1 className="mt-8 font-display text-display-sm text-ink">Create your account</h1>
          <p className="mt-1.5 text-sm text-slate-500">Start buying or selling tickets in minutes.</p>

          {error && (
            <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            {/* Role selector */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">I want to</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'buyer' })}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border-2 px-4 py-3 transition-colors ${
                    formData.role === 'buyer'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <ShoppingBag size={20} className={formData.role === 'buyer' ? 'text-primary-600' : 'text-slate-400'} />
                  <span className={`text-sm font-semibold ${formData.role === 'buyer' ? 'text-primary-700' : 'text-ink'}`}>
                    Buy tickets
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'seller' })}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border-2 px-4 py-3 transition-colors ${
                    formData.role === 'seller'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Store size={20} className={formData.role === 'seller' ? 'text-primary-600' : 'text-slate-400'} />
                  <span className={`text-sm font-semibold ${formData.role === 'seller' ? 'text-primary-700' : 'text-ink'}`}>
                    Sell tickets
                  </span>
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-ink">
                Full name
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Smith"
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
                Email address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
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
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={handleChange}
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

            <button type="submit" disabled={loading} className="btn-primary mt-2 justify-center">
              {loading ? 'Creating account...' : 'Create account'}
              {!loading && <ArrowRight size={16} />}
            </button>

            <p className="text-center text-xs text-slate-400">
              By signing up, you agree to our{' '}
              <Link to="/terms" className="underline hover:text-slate-600">Terms</Link> and{' '}
              <Link to="/privacy" className="underline hover:text-slate-600">Privacy Policy</Link>.
            </p>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;