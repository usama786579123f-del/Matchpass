const logger = require('../utils/logger');

/**
 * Currency conversion service. MatchPass operates primarily in GBP
 * (UK market), but this service provides a ready hook for multi-currency
 * support later without requiring changes elsewhere in the codebase.
 *
 * Behavior:
 *  - If CURRENCY_API_KEY is not set, all conversions are treated as 1:1
 *    (safe no-op fallback) so the app runs fully without this key.
 *  - If a key is added later, swap the fetchLiveRates() body to call
 *    a real provider (e.g. exchangerate.host, Open Exchange Rates).
 */

const DEFAULT_CURRENCY = process.env.DEFAULT_CURRENCY || 'GBP';

let cachedRates = null;
let cachedAt = null;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

const fetchLiveRates = async () => {
  if (!process.env.CURRENCY_API_KEY || process.env.CURRENCY_API_KEY.includes('xxxx')) {
    // No real key configured yet - fallback to 1:1 for all currencies.
    return { GBP: 1, USD: 1, EUR: 1 };
  }

  // Placeholder for a real provider call once CURRENCY_API_KEY is set.
  // Example (exchangerate.host style):
  //   const res = await fetch(`https://api.exchangerate.host/latest?base=GBP&access_key=${process.env.CURRENCY_API_KEY}`);
  //   const data = await res.json();
  //   return data.rates;
  logger.warn('CURRENCY_API_KEY is set but no live provider is wired yet - using 1:1 fallback.');
  return { GBP: 1, USD: 1, EUR: 1 };
};

const getRates = async () => {
  const now = Date.now();
  if (cachedRates && cachedAt && now - cachedAt < CACHE_TTL_MS) {
    return cachedRates;
  }
  cachedRates = await fetchLiveRates();
  cachedAt = now;
  return cachedRates;
};

/**
 * Converts an amount from one currency to another.
 * Safe to call even without a configured provider - returns the
 * original amount unchanged when rates aren't available.
 */
const convert = async (amount, fromCurrency = DEFAULT_CURRENCY, toCurrency = DEFAULT_CURRENCY) => {
  if (fromCurrency === toCurrency) return amount;

  const rates = await getRates();
  const fromRate = rates[fromCurrency] || 1;
  const toRate = rates[toCurrency] || 1;

  const amountInBase = amount / fromRate;
  const converted = amountInBase * toRate;

  return Math.round(converted * 100) / 100;
};

module.exports = { convert, getRates, DEFAULT_CURRENCY };