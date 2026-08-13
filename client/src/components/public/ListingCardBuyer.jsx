import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Armchair, Ticket as TicketIcon, Star } from 'lucide-react';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatCurrency';

const TICKET_TYPE_LABELS = {
  'e-ticket': 'E-ticket',
  'mobile-transfer': 'Mobile transfer',
  physical: 'Physical ticket',
  'season-card': 'Season card',
};

/**
 * A single listing row on the event detail page — one seller's offer
 * for this fixture. Deliberately compact/scannable since a popular
 * fixture can have dozens of these stacked in a list.
 */
const ListingCardBuyer = ({ listing }) => {
  const [rating, setRating] = useState(null);

  useEffect(() => {
    const fetchRating = async () => {
      if (!listing.seller?._id) return;
      try {
        const response = await api.get('/reviews/user/' + listing.seller._id);
        setRating(response.data.data.summary);
      } catch (err) {
        setRating(null);
      }
    };
    fetchRating();
  }, [listing.seller?._id]);

  return (
    <Link
      to={'/listings/' + listing._id}
      className="card card-hover flex items-center justify-between gap-4 p-4"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
          <Armchair size={18} />
        </span>
        <div>
          <p className="font-semibold text-ink">
            {listing.section}
            {listing.row ? <span className="text-slate-400"> · Row {listing.row}</span> : null}
          </p>
          <p className="text-sm text-slate-500">
            {listing.quantity} {listing.quantity === 1 ? 'ticket' : 'tickets'} ·{' '}
            {TICKET_TYPE_LABELS[listing.ticketType] || listing.ticketType}
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <TicketIcon size={11} />
              Sold by {listing.seller?.name || 'Verified seller'}
            </span>
            {listing.seller?.sellerTier === 'trusted' ? (
              <span className="badge-success !px-1.5 !py-0.5">Trusted</span>
            ) : null}
            {rating && rating.averageRating ? (
              <span className="flex items-center gap-0.5 font-medium text-gold-600">
                <Star size={11} className="fill-gold-400 text-gold-400" />
                {rating.averageRating} ({rating.totalReviews})
              </span>
            ) : null}
          </p>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-xs text-slate-400">per ticket</p>
        <p className="price-mono text-xl text-ink">{formatCurrency(listing.pricePerTicket)}</p>
      </div>
    </Link>
  );
};

export default ListingCardBuyer;