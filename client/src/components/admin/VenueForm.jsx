import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const VenueForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    country: 'United Kingdom',
    address: '',
    capacity: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/venues', {
        ...formData,
        capacity: formData.capacity ? parseInt(formData.capacity, 10) : undefined,
      });
      toast.success('Venue created.');
      setFormData({ name: '', city: '', country: 'United Kingdom', address: '', capacity: '' });
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create venue.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Venue name</label>
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g. Emirates Stadium"
          className="input-field"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">City</label>
          <input
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="e.g. London"
            className="input-field"
            required
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Country</label>
          <input
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">
          Address <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <input
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Street address"
          className="input-field"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">
          Capacity <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <input
          type="number"
          min="0"
          name="capacity"
          value={formData.capacity}
          onChange={handleChange}
          placeholder="e.g. 60000"
          className="input-field"
        />
      </div>

      <button type="submit" disabled={submitting} className="btn-primary justify-center">
        {submitting ? 'Creating...' : 'Create venue'}
      </button>
    </form>
  );
};

export default VenueForm;