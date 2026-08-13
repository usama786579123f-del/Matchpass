import { CheckCircle2, Circle, Clock } from 'lucide-react';

const STEPS = [
  { key: 'paid_escrow_held', label: 'Payment held in escrow' },
  { key: 'proof_uploaded', label: 'Ticket uploaded by seller' },
  { key: 'delivered', label: 'Delivery confirmed' },
  { key: 'completed', label: 'Order complete' },
];

const STATUS_ORDER = [
  'pending_payment',
  'paid_escrow_held',
  'proof_uploaded',
  'delivered',
  'completed',
];

/**
 * Visual progress tracker for an order's escrow lifecycle. Disputed/
 * refunded/cancelled orders get their own distinct banner instead
 * (handled by the parent), since those are exceptions to the happy path.
 */
const OrderStatusTracker = ({ status }) => {
  const currentIndex = STATUS_ORDER.indexOf(status);

  return (
    <div className="flex flex-col gap-0">
      {STEPS.map((step, i) => {
        const stepIndex = STATUS_ORDER.indexOf(step.key);
        const isDone = currentIndex >= stepIndex;
        const isCurrent = currentIndex === stepIndex;
        const isLast = i === STEPS.length - 1;

        return (
          <div key={step.key} className="flex gap-3">
            <div className="flex flex-col items-center">
              {isDone ? (
                <CheckCircle2 size={20} className="text-primary-500" />
              ) : (
                <Circle size={20} className="text-slate-200" />
              )}
              {!isLast && (
                <div className={`my-1 h-8 w-0.5 ${isDone ? 'bg-primary-200' : 'bg-slate-200'}`} />
              )}
            </div>
            <div className="pb-6">
              <p className={`text-sm font-medium ${isDone ? 'text-ink' : 'text-slate-400'}`}>
                {step.label}
              </p>
              {isCurrent && (
                <p className="mt-0.5 flex items-center gap-1 text-xs text-primary-600">
                  <Clock size={11} /> In progress
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrderStatusTracker;