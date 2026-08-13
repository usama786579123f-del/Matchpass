import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  ChevronLeft,
  AlertTriangle,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatEventDate } from '../../utils/formatDate';
import OrderStatusTracker from '../../components/buyer/OrderStatusTracker';
import ReviewForm from '../../components/buyer/ReviewForm';

const EXCEPTION_STATUSES = {
  disputed: {
    label: 'This order is under dispute review',
    tone: 'warning',
  },
  refunded: {
    label: 'This order was fully refunded',
    tone: 'danger',
  },
  partially_refunded: {
    label: 'This order was partially refunded',
    tone: 'warning',
  },
  cancelled: {
    label: 'This order was cancelled - the seller missed the delivery deadline',
    tone: 'danger',
  },
};

const REVIEWABLE_STATUSES = ['delivered', 'completed', 'partially_refunded'];

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const fetchOrder = async () => {
    try {
      const response = await api.get('/orders/' + id);
      setOrder(response.data.data.order);
    } catch (err) {
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleConfirmDelivery = async () => {
    setConfirming(true);
    try {
      await api.post('/orders/' + id + '/confirm-delivery');
      toast.success('Delivery confirmed! Funds released to the seller.');
      fetchOrder();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not confirm delivery.');
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="container-page py-16">
        <div className="h-80 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-page flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
        <h1 className="font-display text-display-sm text-ink">Order not found</h1>
        <Link to="/buyer/orders" className="btn-primary mt-2">
          Back to orders
        </Link>
      </div>
    );
  }

  const exception = EXCEPTION_STATUSES[order.status];
  const canReview = REVIEWABLE_STATUSES.indexOf(order.status) !== -1;

  return (
    <div className="container-page py-10">
      <Link
        to="/buyer/orders"
        className="mb-6 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-ink"
      >
        <ChevronLeft size={15} />
        <span>Back to orders</span>
      </Link>

      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-display text-display-sm text-ink">
          {order.event ? order.event.homeTeam : ''}
          <span className="text-slate-400"> vs </span>
          {order.event ? order.event.awayTeam : ''}
        </h1>
        <span className="text-sm text-slate-400">{order.orderNumber}</span>
      </div>

      <div className="mb-8 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-500">
        <span className="flex items-center gap-1.5">
          <Calendar size={14} />
          <span>
            {order.event && order.event.eventDate
              ? formatEventDate(order.event.eventDate)
              : ''}
          </span>
        </span>
        <span className="flex items-center gap-1.5">
          <MapPin size={14} />
          <span>{order.event && order.event.venue ? order.event.venue.name : ''}</span>
        </span>
      </div>

      {exception ? (
        <div
          className={
            'mb-6 flex items-start gap-3 rounded-xl border px-4 py-3.5 text-sm ' +
            (exception.tone === 'danger'
              ? 'border-red-100 bg-red-50 text-danger'
              : 'border-gold-200 bg-gold-50 text-gold-600')
          }
        >
          <AlertTriangle size={17} className="mt-0.5 shrink-0" />
          <span>{exception.label}</span>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="card p-6">
            <h2 className="mb-4 font-display text-sm font-semibold text-ink">
              Order progress
            </h2>
            <OrderStatusTracker status={order.status} />

            {order.status === 'proof_uploaded' ? (
              <div className="mt-2 rounded-xl border border-primary-100 bg-primary-50 p-4">
                <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary-700">
                  <FileText size={16} />
                  <span>Your ticket is ready</span>
                </p>

                {order.proofFileUrl ? (
                  <a
                    href={order.proofFileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary mb-3 w-full justify-center !bg-white text-sm"
                  >
                    View ticket file
                  </a>
                ) : null}

                <button
                  onClick={handleConfirmDelivery}
                  disabled={confirming}
                  className="btn-primary w-full justify-center"
                >
                  {confirming ? 'Confirming...' : 'Confirm I received my ticket'}
                </button>

                <p className="mt-3 text-center text-xs text-slate-500">
                  Not what you expected?{' '}
                  <Link
                    to={'/buyer/orders/' + order._id + '/dispute'}
                    className="font-semibold text-danger underline"
                  >
                    Raise a dispute
                  </Link>
                </p>
              </div>
            ) : null}
          </div>

          {canReview ? (
            <div className="card mt-6 p-6">
              <h2 className="mb-4 font-display text-sm font-semibold text-ink">
                Rate your seller
              </h2>
              {reviewSubmitted ? (
                <div className="flex items-center gap-2 text-sm text-primary-700">
                  <CheckCircle2 size={18} />
                  <span>Thanks for your feedback!</span>
                </div>
              ) : (
                <ReviewForm
                  orderId={order._id}
                  onSubmitted={function () {
                    setReviewSubmitted(true);
                  }}
                />
              )}
            </div>
          ) : null}
        </div>

        <div className="lg:col-span-1">
          <div className="card p-5">
            <h3 className="mb-4 font-display text-sm font-semibold text-ink">
              Payment summary
            </h3>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>
                  {order.quantity} x {formatCurrency(order.pricePerTicket)}
                </span>
                <span className="price-mono">{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Service fee</span>
                <span className="price-mono">{formatCurrency(order.platformFee)}</span>
              </div>
              <div className="mt-1 flex justify-between border-t border-slate-100 pt-3 font-semibold text-ink">
                <span>Total paid</span>
                <span className="price-mono text-lg">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;