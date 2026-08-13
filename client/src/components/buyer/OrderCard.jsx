import { Link } from 'react-router-dom';
import { Calendar, MapPin, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatEventDate } from '../../utils/formatDate';

const STATUS_STYLES = {
  pending_payment: { label: 'Payment pending', className: 'badge-warning' },
  paid_escrow_held: { label: 'Awaiting delivery', className: 'badge-warning' },
  proof_uploaded: { label: 'Ticket ready', className: 'badge-success' },
  delivered: { label: 'Delivered', className: 'badge-success' },
  completed: { label: 'Completed', className: 'badge-success' },
  disputed: { label: 'Under dispute', className: 'badge-danger' },
  refunded: { label: 'Refunded', className: 'badge-danger' },
  partially_refunded: { label: 'Partially refunded', className: 'badge-warning' },
  cancelled: { label: 'Cancelled', className: 'badge-danger' },
};

const OrderCard = ({ order }) => {
  const statusInfo = STATUS_STYLES[order.status] || { label: order.status, className: 'badge' };

  return (
    <Link to={`/buyer/orders/${order._id}`} className="card card-hover flex items-center justify-between gap-4 p-4">
      <div className="flex-1">
        <div className="mb-1.5 flex items-center gap-2">
          <span className={statusInfo.className}>{statusInfo.label}</span>
          <span className="text-xs text-slate-400">{order.orderNumber}</span>
        </div>
        <p className="font-semibold text-ink">
          {order.event?.homeTeam} <span className="text-slate-400">vs</span> {order.event?.awayTeam}
        </p>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Calendar size={12} /> {order.event?.eventDate && formatEventDate(order.event.eventDate)}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <span className="price-mono font-semibold text-ink">{formatCurrency(order.totalAmount)}</span>
        <ChevronRight size={18} className="text-slate-300" />
      </div>
    </Link>
  );
};

export default OrderCard;