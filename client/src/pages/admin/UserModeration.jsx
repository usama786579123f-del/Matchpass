import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import UserModerationRow from '../../components/admin/UserModerationRow';

const TIERS = ['new', 'standard', 'trusted', 'restricted', 'banned'];

const UserModeration = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('q', search);
      if (roleFilter) params.set('role', roleFilter);
      const { data } = await api.get(`/admin/users?${params.toString()}`);
      setUsers(data.data.users || []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(fetchUsers, 300);
    return () => clearTimeout(debounce);
  }, [search, roleFilter]);

  const handleSuspend = async (userId, suspend) => {
    const reason = suspend ? prompt('Reason for suspension:') : null;
    if (suspend && !reason) return;
    try {
      await api.patch(`/admin/users/${userId}/suspend`, { suspend, reason });
      toast.success(suspend ? 'User suspended.' : 'User unsuspended.');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.');
    }
  };

  const handleTierChange = async (userId) => {
    const tier = prompt(`New tier (${TIERS.join(', ')}):`);
    if (!tier || !TIERS.includes(tier)) return;
    try {
      await api.patch(`/admin/users/${userId}/tier`, { sellerTier: tier });
      toast.success('Seller tier updated.');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.');
    }
  };

  return (
    <div className="p-6 sm:p-8">
      <h1 className="font-display text-display-sm text-ink">User moderation</h1>
      <p className="mt-1 text-slate-500">Search, review, and manage platform users.</p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="input-field pl-10"
          />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="input-field w-auto">
          <option value="">All roles</option>
          <option value="buyer">Buyer</option>
          <option value="seller">Seller</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="card mt-6 overflow-x-auto p-5">
        {loading ? (
          <div className="h-64 animate-pulse rounded-xl bg-slate-50" />
        ) : users.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-500">No users found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="pb-3 pr-4">User</th>
                <th className="pb-3 pr-4">Role</th>
                <th className="pb-3 pr-4">Tier</th>
                <th className="pb-3 pr-4">KYC</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <UserModerationRow
                  key={user._id}
                  user={user}
                  onSuspend={handleSuspend}
                  onTierChange={handleTierChange}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UserModeration;