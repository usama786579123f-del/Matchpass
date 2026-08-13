import { Outlet } from 'react-router-dom';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ListChecks,
  AlertCircle,
  Calendar,
  Wallet,
  BarChart3,
  Ticket,
  ShieldCheck,
} from 'lucide-react';

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/listings', label: 'Listings', icon: ListChecks },
  { to: '/admin/disputes', label: 'Disputes', icon: AlertCircle },
  { to: '/admin/events', label: 'Events', icon: Calendar },
  { to: '/admin/payouts', label: 'Payouts', icon: Wallet },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { to: '/admin/2fa', label: 'Security (2FA)', icon: ShieldCheck },
];

const AdminLayout = () => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-bg-subtle">
      <aside className="hidden w-64 shrink-0 border-r border-slate-100 bg-white lg:block">
        <div className="flex h-16 items-center gap-2 border-b border-slate-100 px-6 font-display text-lg font-bold text-ink">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 text-white">
            <Ticket size={16} strokeWidth={2.5} />
          </span>
          MatchPass <span className="text-sm font-medium text-slate-400">Admin</span>
        </div>
        <nav className="flex flex-col gap-1 p-4">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon size={17} />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;