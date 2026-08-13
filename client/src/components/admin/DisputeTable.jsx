import { Link } from 'react-router-dom';
import { formatEventDate } from '../../utils/formatDate';

const STATUS_STYLES = {
  open: 'badge-warning',
  under_review: 'badge bg-secondary-50 text-secondary-700',
  resolved: 'badge-success',
  closed: 'badge bg-slate-100 text-slate-600',
};

const DisputeTable = ({ disputes, onSelect }) => {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
          <th className="pb-3 pr-4">Order</th>
          <th className="pb-3 pr-4">Buyer</th>
          <th className="pb-3 pr-4">Reason</th>
          <th className="pb-3 pr-4">Status</th>
          <th className="pb-3 pr-4">Deadline</th>
          <th className="pb-3"></th>
        </tr>
      </thead>
      <tbody>
        {disputes.map((dispute) => {
          const overdue = new Date(dispute.reviewDeadline) < new Date() && dispute.status !== 'resolved';
          return (
            <tr key={dispute._id} className="border-b border-slate-100 last:border-0">
              <td className="py-3.5 pr-4 font-medium text-ink">{dispute.order?.orderNumber}</td>
              <td className="py-3.5 pr-4 text-slate-600">{dispute.buyer?.name}</td>
              <td className="py-3.5 pr-4 capitalize text-slate-600">{dispute.reason.replace(/_/g, ' ')}</td>
              <td className="py-3.5 pr-4">
                <span className={STATUS_STYLES[dispute.status] || 'badge'}>{dispute.status.replace('_', ' ')}</span>
              </td>
              <td className="py-3.5 pr-4">
                <span className={overdue ? 'font-semibold text-danger' : 'text-slate-500'}>
                  {formatEventDate(dispute.reviewDeadline)}
                </span>
              </td>
              <td className="py-3.5 text-right">
                <button onClick={() => onSelect(dispute)} className="text-sm font-semibold text-primary-600 hover:text-primary-700">
                  Review
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default DisputeTable;