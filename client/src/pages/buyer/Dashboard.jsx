import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import OrderCard from '../../components/buyer/OrderCard';

const Dashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/my-orders');
        setOrders(data.data.orders || []);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const activeOrders = orders.filter((o) =>
    ['paid_escrow_held', 'proof_uploaded', 'disputed'].includes(o.status)
  );
  const totalSpent = orders
    .filter((o) => !['cancelled', 'refunded'].includes(o.status))
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="container-page py-10">
      <h1 className="font-display text-display-sm text-ink">
        Welcome back, {user?.name?.split(' ')[0]}
      </h1>
      <p className="mt-1 text-slate-500">Here's what's happening with your tickets.</p>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card flex items-center gap-3 p-5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
            <Ticket size={20} />
          </span>
          <div>
            <p className="text-2xl font-bold text-ink">{orders.length}</p>
            <p className="text-sm text-slate-500">Total orders</p>
          </div>
        </div>
        <div className="card flex items-center gap-3 p-5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold-50 text-gold-600">
            <Clock size={20} />
          </span>
          <div>
            <p className="text-2xl font-bold text-ink">{activeOrders.length}</p>
            <p className="text-sm text-slate-500">Awaiting delivery</p>
          </div>
        </div>
        <div className="card flex items-center gap-3 p-5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary-50 text-secondary-600">
            <ShieldCheck size={20} />
          </span>
          <div>
            <p className="price-mono text-2xl font-bold text-ink">£{totalSpent.toFixed(0)}</p>
            <p className="text-sm text-slate-500">Total spent</p>
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">Recent orders</h2>
          <Link to="/buyer/orders" className="flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[...Array(3)].map((_, i) => <div key={i} className="card h-24 animate-pulse bg-slate-50" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="card flex flex-col items-center justify-center gap-3 py-14 text-center">
            <Ticket className="text-slate-300" size={32} />
            <p className="font-semibold text-ink">No orders yet</p>
            <p className="text-sm text-slate-500">Browse events to find your next match.</p>
            <Link to="/events" className="btn-primary mt-2 text-sm">Browse events</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {orders.slice(0, 5).map((order) => <OrderCard key={order._id} order={order} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;