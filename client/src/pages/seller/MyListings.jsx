import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Ticket } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import ListingCard from '../../components/seller/ListingCard';

const MyListings = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchListings = async () => {
    try {
      const params = filter ? `?status=${filter}` : '';
      const { data } = await api.get(`/listings/my-listings${params}`);
      setListings(data.data.listings || []);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [filter]);

  const handleWithdraw = async (listingId) => {
    if (!confirm('Withdraw this listing? It will no longer be visible to buyers.')) return;
    try {
      await api.patch(`/listings/${listingId}/withdraw`);
      toast.success('Listing withdrawn.');
      fetchListings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not withdraw listing.');
    }
  };

  const kycVerified = user?.kycStatus === 'verified';

  return (
    <div className="container-page py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-display-sm text-ink">My listings</h1>
          <p className="mt-1 text-slate-500">Manage your active and past ticket listings.</p>
        </div>
        {kycVerified ? (
          <Link to="/seller/listings/new" className="btn-primary">
            <Plus size={16} /> New listing
          </Link>
        ) : (
          <Link to="/seller/kyc" className="btn-secondary text-sm">
            Complete verification to list
          </Link>
        )}
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {['', 'active', 'sold', 'withdrawn', 'expired'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium capitalize transition-colors ${
              filter === s ? 'bg-ink text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(3)].map((_, i) => <div key={i} className="card h-24 animate-pulse bg-slate-50" />)}
        </div>
      ) : listings.length === 0 ? (
        <div className="card flex flex-col items-center justify-center gap-3 py-16 text-center">
          <Ticket className="text-slate-300" size={32} />
          <p className="font-semibold text-ink">No listings yet</p>
          <p className="text-sm text-slate-500">Create your first listing to start selling.</p>
          {kycVerified && (
            <Link to="/seller/listings/new" className="btn-primary mt-2 text-sm">Create listing</Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {listings.map((listing) => (
            <ListingCard key={listing._id} listing={listing} onWithdraw={handleWithdraw} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyListings;