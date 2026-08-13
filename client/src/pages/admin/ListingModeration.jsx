import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import ListingModerationRow from '../../components/admin/ListingModerationRow';

const ListingModeration = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = async () => {
    try {
      const { data } = await api.get('/admin/listings?status=pending');
      setListings(data.data.listings || []);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleApprove = async (id) => {
    try {
      await api.patch(`/admin/listings/${id}/moderate`, { decision: 'approved' });
      toast.success('Listing approved.');
      setListings((prev) => prev.filter((l) => l._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.');
    }
  };

  const handleReject = async (id) => {
    const note = prompt('Reason for rejection (shown to seller):');
    if (!note) return;
    try {
      await api.patch(`/admin/listings/${id}/moderate`, { decision: 'rejected', note });
      toast.success('Listing rejected.');
      setListings((prev) => prev.filter((l) => l._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.');
    }
  };

  return (
    <div className="p-6 sm:p-8">
      <h1 className="font-display text-display-sm text-ink">Listing moderation</h1>
      <p className="mt-1 text-slate-500">Review new listings before they go live.</p>

      <div className="mt-6">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[...Array(3)].map((_, i) => <div key={i} className="card h-24 animate-pulse bg-slate-50" />)}
          </div>
        ) : listings.length === 0 ? (
          <div className="card flex flex-col items-center justify-center gap-2 py-16 text-center">
            <CheckCircle2 className="text-primary-300" size={32} />
            <p className="font-semibold text-ink">All caught up</p>
            <p className="text-sm text-slate-500">No listings waiting for review.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {listings.map((listing) => (
              <ListingModerationRow
                key={listing._id}
                listing={listing}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingModeration;