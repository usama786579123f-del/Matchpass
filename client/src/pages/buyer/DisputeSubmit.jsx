import { useNavigate, useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import DisputeForm from '../../components/buyer/DisputeForm';

const DisputeSubmit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async ({ reason, description, files }) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('orderId', id);
      formData.append('reason', reason);
      formData.append('description', description);
      files.forEach((file) => formData.append('evidence', file));

      await api.post('/disputes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Dispute submitted. We\'ll review it within 48 hours.');
      navigate(`/buyer/orders/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit dispute.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-page max-w-2xl py-10">
      <Link to={`/buyer/orders/${id}`} className="mb-6 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-ink">
        <ChevronLeft size={15} /> Back to order
      </Link>

      <h1 className="font-display text-display-sm text-ink">Raise a dispute</h1>
      <p className="mt-1 mb-8 text-slate-500">
        Let us know what happened and we'll investigate on your behalf.
      </p>

      <div className="card p-6">
        <DisputeForm onSubmit={handleSubmit} submitting={submitting} />
      </div>
    </div>
  );
};

export default DisputeSubmit;