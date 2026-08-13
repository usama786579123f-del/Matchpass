import { useEffect, useState } from 'react';
import api from '../services/api';

/**
 * Fetches GBP-based conversion rates once and caches them for the
 * session. Used purely for a "display estimate" next to GBP prices —
 * never for actual payment amounts, which always run through Stripe
 * in GBP on the backend.
 */
export const useCurrencyRates = () => {
  const [rates, setRates] = useState(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await api.get('/currency/rates');
        setRates(response.data.data.rates);
      } catch (err) {
        setRates(null);
      }
    };
    fetchRates();
  }, []);

  return rates;
};