import { useState } from 'react';
import { Star } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const ReviewForm = ({ orderId, onSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a star rating.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/reviews', { orderId, rating, comment });
      toast.success('Thanks for your review!');
      onSubmitted?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-sm font-medium text-ink">How was your experience?</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-0.5"
              aria-label={`${star} star${star !== 1 ? 's' : ''}`}
            >
              <Star
                size={28}
                className={
                  star <= (hoverRating || rating)
                    ? 'fill-gold-400 text-gold-400'
                    : 'text-slate-200'
                }
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="comment" className="mb-1.5 block text-sm font-medium text-ink">
          Comment <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <textarea
          id="comment"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share details about your experience..."
          className="input-field resize-none"
          maxLength={1000}
        />
      </div>

      <button type="submit" disabled={submitting} className="btn-primary justify-center">
        {submitting ? 'Submitting...' : 'Submit review'}
      </button>
    </form>
  );
};

export default ReviewForm;