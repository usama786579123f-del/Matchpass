import { Check, X } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatEventDate } from '../../utils/formatDate';

const ListingModerationRow = ({ listing, onApprove, onReject }) => {
  return (
    <div className="card flex items-center justify-between gap-4 p-4">
      <div className="flex-1">
        <p className="font-semibold text-ink">
          {listing.event?.homeTeam} <span className="text-slate-400">vs</span> {listing.event?.awayTeam}
        </p>
        <p className="text-sm text-slate-500">
          {listing.section} · {listing.quantity} ticket{listing.quantity !== 1 && 's'} ·{' '}
          {listing.event?.eventDate && formatEventDate(listing.event.eventDate)}
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Seller: {listing.seller?.name} ({listing.seller?.sellerTier})
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <span className="price-mono font-semibold text-ink">{formatCurrency(listing.pricePerTicket)}</span>
        <div className="flex gap-1.5">
          <button
            onClick={() => onApprove(listing._id)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100"
            aria-label="Approve"
          >
            <Check size={16} />
          </button>
          <button
            onClick={() => onReject(listing._id)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-danger hover:bg-red-100"
            aria-label="Reject"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListingModerationRow;