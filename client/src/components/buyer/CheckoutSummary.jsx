import { ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';

/**
 * Price breakdown shown before and during checkout — transparency
 * on the platform fee builds trust (buyers should never be surprised
 * by the final charge).
 */
const CheckoutSummary = ({ listing, quantity }) => {
  const subtotal = listing.pricePerTicket * quantity;
  const platformFeePercent = 10; // mirrors PLATFORM_FEE_PERCENT default; actual fee is computed server-side
  const platformFee = Math.round(subtotal * (platformFeePercent / 100) * 100) / 100;
  const total = subtotal + platformFee;

  return (
    <div className="card p-5">
      <h3 className="font-display text-sm font-semibold text-ink">Order summary</h3>

      <div className="ticket-stub-divider my-4" />

      <div className="flex flex-col gap-2.5 text-sm">
        <div className="flex justify-between text-slate-600">
          <span>{quantity} × {formatCurrency(listing.pricePerTicket)}</span>
          <span className="price-mono">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Service fee</span>
          <span className="price-mono">{formatCurrency(platformFee)}</span>
        </div>
        <div className="mt-1 flex justify-between border-t border-slate-100 pt-3 font-semibold text-ink">
          <span>Total</span>
          <span className="price-mono text-lg">{formatCurrency(total)}</span>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-xl bg-primary-50 px-3.5 py-3 text-xs text-primary-700">
        <ShieldCheck size={16} className="mt-0.5 shrink-0" />
        <span>
          Your payment is held securely and only released to the seller once
          your ticket delivery is confirmed.
        </span>
      </div>
    </div>
  );
};

export default CheckoutSummary;