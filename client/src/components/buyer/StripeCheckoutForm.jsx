import { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Loader2, Lock } from 'lucide-react';

/**
 * Wraps Stripe's PaymentElement. Rendered inside an <Elements> provider
 * that already has the clientSecret from POST /api/orders/checkout.
 */
const StripeCheckoutForm = ({ onSuccess, orderNumber }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setError('');

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (confirmError) {
      setError(confirmError.message || 'Payment failed. Please try again.');
      setSubmitting(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === 'succeeded') {
      onSuccess();
    } else {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <PaymentElement />

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      <button type="submit" disabled={!stripe || submitting} className="btn-primary justify-center">
        {submitting ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Processing payment...
          </>
        ) : (
          <>
            <Lock size={15} /> Pay securely
          </>
        )}
      </button>

      <p className="text-center text-xs text-slate-400">
        Order {orderNumber} · Payments processed securely by Stripe
      </p>
    </form>
  );
};

export default StripeCheckoutForm;