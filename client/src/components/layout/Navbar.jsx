import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, Ticket, User, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const ROLE_LABELS = {
  buyer: 'Buyer',
  seller: 'Seller',
  admin: 'Admin',
};

const ROLE_BADGE_STYLES = {
  buyer: 'bg-secondary-50 text-secondary-700',
  seller: 'bg-primary-50 text-primary-700',
  admin: 'bg-gold-50 text-gold-600',
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/search?q=' + encodeURIComponent(searchQuery.trim()));
      setMobileOpen(false);
    }
  };

  const dashboardLink =
    user?.role === 'admin'
      ? '/admin/dashboard'
      : user?.role === 'seller'
      ? '/seller/dashboard'
      : '/buyer/dashboard';

  const roleLinks =
    user?.role === 'seller'
      ? [
          { to: '/seller/dashboard', label: 'Dashboard' },
          { to: '/seller/listings', label: 'My Listings' },
          { to: '/seller/payouts', label: 'Payouts' },
          { to: '/seller/tax-summary', label: 'Tax Summary' },
          { to: '/seller/kyc', label: 'Verification' },
          { to: '/seller/account', label: 'Account' },
        ]
      : user?.role === 'buyer'
      ? [
          { to: '/buyer/dashboard', label: 'Dashboard' },
          { to: '/buyer/orders', label: 'My Orders' },
          { to: '/buyer/account', label: 'Account' },
        ]
      : user?.role === 'admin'
      ? [{ to: '/admin/dashboard', label: 'Admin Dashboard' }]
      : [];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-4">

        <div className="flex shrink-0 items-center gap-2.5">
          <Link
            to="/"
            className="flex items-center gap-2 font-display text-xl font-bold text-ink"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 text-white">
              <Ticket size={18} strokeWidth={2.5} />
            </span>
            MatchPass
          </Link>
          {user ? (
            <span
              className={
                'hidden rounded-full px-2.5 py-1 text-xs font-semibold sm:inline-block ' +
                (ROLE_BADGE_STYLES[user.role] || 'bg-slate-100 text-slate-600')
              }
            >
              {ROLE_LABELS[user.role] || user.role}
            </span>
          ) : null}
        </div>

        <form onSubmit={handleSearch} className="hidden flex-1 max-w-md md:block">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search teams, events, venues..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm placeholder:text-slate-400 transition-colors focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10"
            />
          </div>
        </form>

        <nav className="hidden items-center gap-1 md:flex">
          <Link
            to="/events"
            className="rounded-lg px-3 py-2 text-sm font-medium text-ink hover:bg-slate-50"
          >
            Browse Events
          </Link>

          {user ? (
            <>
              {roleLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-ink hover:bg-slate-50"
                >
                  {link.label}
                </Link>
              ))}
              <button
                onClick={logout}
                className="ml-1 flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-ink"
              >
                <LogOut size={15} /> Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-ink hover:bg-slate-50"
              >
                Log in
              </Link>
              <Link to="/signup" className="btn-primary ml-1 !px-4 !py-2 text-sm">
                Sign up
              </Link>
            </>
          )}
        </nav>

        <button
          className="rounded-lg p-2 text-ink hover:bg-slate-50 md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white px-4 pb-4 pt-3 md:hidden animate-slide-up">
          {user ? (
            <div className="mb-3 flex items-center gap-2">
              <span
                className={
                  'rounded-full px-2.5 py-1 text-xs font-semibold ' +
                  (ROLE_BADGE_STYLES[user.role] || 'bg-slate-100 text-slate-600')
                }
              >
                {ROLE_LABELS[user.role] || user.role}
              </span>
              <span className="text-sm text-slate-500">{user.name}</span>
            </div>
          ) : null}

          <form onSubmit={handleSearch} className="mb-3">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search teams, events..."
                className="input-field pl-10"
              />
            </div>
          </form>

          <div className="flex flex-col gap-1">
            <Link
              to="/events"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-slate-50"
            >
              Browse Events
            </Link>
            {user ? (
              <>
                {roleLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-slate-50"
                  >
                    <User size={16} /> {link.label}
                  </Link>
                ))}
                <button
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                  }}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-500 hover:bg-slate-50"
                >
                  <LogOut size={16} /> Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-slate-50"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary mt-1 justify-center text-sm"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;