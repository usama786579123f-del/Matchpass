import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Ticket } from 'lucide-react';
import api from '../../services/api';
import OrderCard from '../../components/buyer/OrderCard';

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'paid_escrow_held', label: 'Awaiting delivery' },
  { value: 'proof_uploaded', label: 'Ready' },
  { value: 'completed', label: 'Completed' },
  { value: 'disputed', label: 'Disputed' },
];

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

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

  const filteredOrders = filter ? orders.filter((o) => o.status === filter) : orders;

  return (
    <div className="container-page py-10">
      <h1 className="font-display text-display-sm text-ink">My orders</h1>
      <p className="mt-1 text-slate-500">Track and manage all your ticket purchases.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              filter === f.value ? 'bg-ink text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[...Array(4)].map((_, i) => <div key={i} className="card h-24 animate-pulse bg-slate-50" />)}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="card flex flex-col items-center justify-center gap-3 py-16 text-center">
            <Ticket className="text-slate-300" size={32} />
            <p className="font-semibold text-ink">No orders here</p>
            <p className="text-sm text-slate-500">Try a different filter, or browse new events.</p>
            <Link to="/events" className="btn-primary mt-2 text-sm">Browse events</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredOrders.map((order) => <OrderCard key={order._id} order={order} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;