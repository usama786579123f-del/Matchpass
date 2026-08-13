import { ShieldCheck, ShieldOff, MoreVertical } from 'lucide-react';
import { useState } from 'react';

const TIER_STYLES = {
  new: 'badge bg-slate-100 text-slate-600',
  standard: 'badge bg-secondary-50 text-secondary-700',
  trusted: 'badge-success',
  restricted: 'badge-warning',
  banned: 'badge-danger',
};

const UserModerationRow = ({ user, onSuspend, onTierChange }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="py-3.5 pr-4">
        <p className="font-medium text-ink">{user.name}</p>
        <p className="text-xs text-slate-400">{user.email}</p>
      </td>
      <td className="py-3.5 pr-4">
        <span className="badge bg-slate-100 text-slate-600 capitalize">{user.role}</span>
      </td>
      <td className="py-3.5 pr-4">
        {user.role === 'seller' ? (
          <span className={TIER_STYLES[user.sellerTier] || 'badge'}>{user.sellerTier}</span>
        ) : (
          <span className="text-slate-300">—</span>
        )}
      </td>
      <td className="py-3.5 pr-4">
        <span className={`badge ${user.kyc?.status === 'verified' ? 'badge-success' : 'bg-slate-100 text-slate-600'}`}>
          {user.kyc?.status || 'n/a'}
        </span>
      </td>
      <td className="py-3.5 pr-4">
        {user.isSuspended ? (
          <span className="badge-danger">Suspended</span>
        ) : (
          <span className="badge-success">Active</span>
        )}
      </td>
      <td className="relative py-3.5 text-right">
        <button onClick={() => setMenuOpen((v) => !v)} className="rounded-lg p-1.5 hover:bg-slate-100">
          <MoreVertical size={16} className="text-slate-400" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 z-10 mt-1 w-44 rounded-xl border border-slate-100 bg-white p-1.5 shadow-elevated">
            <button
              onClick={() => { onSuspend(user._id, !user.isSuspended); setMenuOpen(false); }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50"
            >
              {user.isSuspended ? <ShieldCheck size={14} /> : <ShieldOff size={14} />}
              {user.isSuspended ? 'Unsuspend' : 'Suspend'}
            </button>
            {user.role === 'seller' && (
              <button
                onClick={() => { onTierChange(user._id); setMenuOpen(false); }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50"
              >
                Change tier
              </button>
            )}
          </div>
        )}
      </td>
    </tr>
  );
};

export default UserModerationRow;