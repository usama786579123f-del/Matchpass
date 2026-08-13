import { useCurrencyRates } from '../../hooks/useCurrencyRates';

const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '\u20AC',
};

const DISPLAY_CURRENCIES = ['USD', 'EUR'];

/**
 * Shows a small "~$185 USD" style estimate next to a GBP price.
 * Display only - real charges always happen in GBP via Stripe.
 * Silently renders nothing if rates aren't available or are the
 * 1:1 fallback (no real conversion configured yet).
 */
const PriceEstimate = ({ amountGBP }) => {
  const rates = useCurrencyRates();

  if (!rates || !amountGBP) return null;

  // If every rate is 1 (the no-provider fallback), there's nothing
  // meaningful to show yet.
  const hasRealRates = DISPLAY_CURRENCIES.some((c) => rates[c] && rates[c] !== 1);
  if (!hasRealRates) return null;

  const estimates = DISPLAY_CURRENCIES.filter((c) => rates[c]).map((currency) => {
    const converted = Math.round(amountGBP * rates[currency] * 100) / 100;
    return `${CURRENCY_SYMBOLS[currency] || ''}${converted} ${currency}`;
  });

  if (estimates.length === 0) return null;

  return (
    <span className="text-xs text-slate-400">
      ~{estimates.join(' / ')}
    </span>
  );
};

export default PriceEstimate;