import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const PayoutOverrideForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({ orderId: '', amount: '', note: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/payouts/admin/manual-override', {
        ...formData,
        amount: parseFloat(formData.amount),
      });
      toast.success('Manual payout processed.');
      setFormData({ orderId: '', amount: '', note: '' });
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not process payout.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Order ID</label>
        <input
          value={formData.orderId}
          onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
          placeholder="MongoDB Order ID"
          className="input-field"
          required
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Amount (£)</label>
        <input
          type="number"
          step="0.01"
          min="0.01"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          className="input-field"
          required
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Reason (required for audit)</label>
        <textarea
          value={formData.note}
          onChange={(e) => setFormData({ ...formData, note: e.target.value })}
          rows={3}
          className="input-field resize-none"
          required
        />
      </div>
      <button type="submit" disabled={submitting} className="btn-primary justify-center">
        {submitting ? 'Processing...' : 'Process manual payout'}
      </button>
    </form>
  );
};

export default PayoutOverrideForm;