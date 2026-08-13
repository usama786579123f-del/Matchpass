import { formatCurrency } from '../../utils/formatCurrency';
import { formatEventDate } from '../../utils/formatDate';

const STATUS_STYLES = {
  pending: 'badge-warning',
  processing: 'badge-warning',
  paid: 'badge-success',
  failed: 'badge-danger',
  reversed: 'badge-danger',
  manual_override: 'badge bg-secondary-50 text-secondary-700',
};

const PayoutCard = ({ payout }) => {
  return (
    <div className="card flex items-center justify-between gap-4 p-4">
      <div>
        <div className="mb-1.5">
          <span className={STATUS_STYLES[payout.status] || 'badge'}>{payout.status.replace('_', ' ')}</span>
        </div>
        <p className="font-semibold text-ink">
          {payout.order?.event?.title || `${payout.order?.event?.homeTeam} vs ${payout.order?.event?.awayTeam}`}
        </p>
        <p className="text-xs text-slate-400">
          {payout.releasedAt ? formatEventDate(payout.releasedAt) : 'Pending release'}
        </p>
      </div>
      <span className="price-mono text-lg font-semibold text-ink">{formatCurrency(payout.amount)}</span>
    </div>
  );
};

export default PayoutCard;