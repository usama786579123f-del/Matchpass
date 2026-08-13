import { useNavigate, useParams, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import ListingForm from '../../components/seller/ListingForm';

const ListingFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  return (
    <div className="container-page max-w-xl py-10">
      <Link to="/seller/listings" className="mb-6 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-ink">
        <ChevronLeft size={15} /> Back to listings
      </Link>

      <h1 className="font-display text-display-sm text-ink">
        {isEditMode ? 'Edit your listing' : 'List your tickets'}
      </h1>
      <p className="mt-1 mb-8 text-slate-500">
        {isEditMode
          ? 'Update the details below and save your changes.'
          : "Fill in the details below — we'll review and publish it shortly."}
      </p>

      <div className="card p-6">
        <ListingForm listingId={id} onSuccess={() => navigate('/seller/listings')} />
      </div>
    </div>
  );
};

export default ListingFormPage;