import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const LEAGUES = ['Premier League', 'Champions League', 'FA Cup', 'Championship', 'League Cup'];

const EventForm = ({ onSuccess }) => {
  const [venues, setVenues] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    league: 'Premier League',
    homeTeam: '',
    awayTeam: '',
    venue: '',
    eventDate: '',
    imageUrl: '',
    isFeatured: false,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/venues').then(({ data }) => setVenues(data.data.venues || [])).catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const title = formData.title || `${formData.homeTeam} vs ${formData.awayTeam}`;
      await api.post('/events', { ...formData, title });
      toast.success('Event created.');
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create event.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Home team</label>
          <input name="homeTeam" value={formData.homeTeam} onChange={handleChange} className="input-field" required />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Away team</label>
          <input name="awayTeam" value={formData.awayTeam} onChange={handleChange} className="input-field" required />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">League</label>
        <select name="league" value={formData.league} onChange={handleChange} className="input-field">
          {LEAGUES.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Venue</label>
        <select name="venue" value={formData.venue} onChange={handleChange} className="input-field" required>
          <option value="">Select a venue</option>
          {venues.map((v) => <option key={v._id} value={v._id}>{v.name}, {v.city}</option>)}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Date &amp; time</label>
        <input type="datetime-local" name="eventDate" value={formData.eventDate} onChange={handleChange} className="input-field" required />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Image URL <span className="font-normal text-slate-400">(optional)</span></label>
        <input name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="https://..." className="input-field" />
      </div>

      <label className="flex items-center gap-2 text-sm text-ink">
        <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} className="rounded border-slate-300" />
        Feature on homepage
      </label>

      <button type="submit" disabled={submitting} className="btn-primary justify-center">
        {submitting ? 'Creating...' : 'Create event'}
      </button>
    </form>
  );
};

export default EventForm;