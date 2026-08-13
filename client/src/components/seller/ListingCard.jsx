import { Link } from 'react-router-dom';
import { Eye, XCircle, Pencil } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatEventDate } from '../../utils/formatDate';

const STATUS_STYLES = {
  active: 'badge-success',
  sold: 'badge bg-secondary-50 text-secondary-700',
  withdrawn: 'badge bg-slate-100 text-slate-600',
  expired: 'badge-danger',
  flagged: 'badge-danger',
  removed: 'badge-danger',
};

const MODERATION_LABELS = {
  pending: { text: 'Pending review', className: 'badge-warning' },
  approved: null,
  rejected: { text: 'Rejected', className: 'badge-danger' },
};

const ListingCard = ({ listing, onWithdraw }) => {
  const moderationBadge = MODERATION_LABELS[listing.moderationStatus];

  return (
    <div className="card flex items-center justify-between gap-4 p-4">
      <div className="flex-1">
        <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
          <span className={STATUS_STYLES[listing.status] || 'badge'}>{listing.status}</span>
          {moderationBadge && <span className={moderationBadge.className}>{moderationBadge.text}</span>}
        </div>
        <p className="font-semibold text-ink">
          {listing.event?.homeTeam} <span className="text-slate-400">vs</span> {listing.event?.awayTeam}
        </p>
        <p className="text-sm text-slate-500">
          {listing.section} · {listing.quantity} ticket{listing.quantity !== 1 && 's'} ·{' '}
          {listing.event?.eventDate && formatEventDate(listing.event.eventDate)}
        </p>
        <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
          <Eye size={12} /> {listing.viewCount || 0} view{listing.viewCount !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <span className="price-mono font-semibold text-ink">{formatCurrency(listing.pricePerTicket)}</span>
        <div className="flex gap-1">
          <Link to={`/listings/${listing._id}`} className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-ink" aria-label="View">
            <Eye size={16} />
          </Link>
          {listing.status === 'active' && (
            <>
              <Link
                to={`/seller/listings/${listing._id}/edit`}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-ink"
                aria-label="Edit"
              >
                <Pencil size={16} />
              </Link>
              <button onClick={() => onWithdraw(listing._id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-danger" aria-label="Withdraw">
                <XCircle size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingCard;