export const formatCurrency = (amount, currency = 'GBP') => {
  if (amount === null || amount === undefined) return '—';
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};