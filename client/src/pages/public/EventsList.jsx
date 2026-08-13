import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import api from '../../services/api';
import EventCard from '../../components/public/EventCard';
import { useSEO } from '../../hooks/useSEO';

const LEAGUES = ['Premier League', 'Champions League', 'FA Cup', 'Championship', 'League Cup'];
const SORT_OPTIONS = [
  { value: 'date_asc', label: 'Date: Soonest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

const EventsList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useSEO({
    title: 'Browse Football Events',
    description: 'Search and filter upcoming football fixtures across the Premier League, Champions League, and more on MatchPass.',
  });

  const league = searchParams.get('league') || '';
  const sort = searchParams.get('sort') || 'date_asc';
  const dateFrom = searchParams.get('dateFrom') || '';
  const dateTo = searchParams.get('dateTo') || '';
  const priceMin = searchParams.get('priceMin') || '';
  const priceMax = searchParams.get('priceMax') || '';

  // Local draft state for price inputs so we don't refetch on every keystroke
  const [priceDraft, setPriceDraft] = useState({ min: priceMin, max: priceMax });

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (league) params.set('league', league);
        if (sort) params.set('sort', sort);
        if (dateFrom) params.set('dateFrom', dateFrom);
        if (dateTo) params.set('dateTo', dateTo);
        if (priceMin) params.set('priceMin', priceMin);
        if (priceMax) params.set('priceMax', priceMax);
        params.set('limit', '24');

        const { data } = await api.get(`/events?${params.toString()}`);
        setEvents(data.data.events || []);
      } catch {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [league, sort, dateFrom, dateTo, priceMin, priceMax]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  const applyPriceFilter = () => {
    const next = new URLSearchParams(searchParams);
    if (priceDraft.min) next.set('priceMin', priceDraft.min);
    else next.delete('priceMin');
    if (priceDraft.max) next.set('priceMax', priceDraft.max);
    else next.delete('priceMax');
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setPriceDraft({ min: '', max: '' });
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = league || dateFrom || dateTo || priceMin || priceMax;

  return (
    <div className="container-page py-10">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="font-display text-display-sm text-ink">Browse events</h1>
        <p className="text-slate-500">
          {loading ? 'Loading fixtures...' : `${events.length} upcoming ${events.length === 1 ? 'fixture' : 'fixtures'}`}
        </p>
      </div>

      {/* Filter bar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFiltersOpen((v) => !v)}
          className="btn-secondary !px-4 !py-2 text-sm sm:hidden"
        >
          <SlidersHorizontal size={15} /> Filters
        </button>

        <div className={`${filtersOpen ? 'flex' : 'hidden'} w-full flex-col gap-2 sm:flex sm:w-auto sm:flex-row sm:items-center`}>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => updateParam('league', '')}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                !league ? 'bg-ink text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All leagues
            </button>
            {LEAGUES.map((l) => (
              <button
                key={l}
                onClick={() => updateParam('league', l)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  league === l ? 'bg-ink text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <select
          value={sort}
          onChange={(e) => updateParam('sort', e.target.value)}
          className="ml-auto rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-ink focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Date + price range filters */}
      <div className="mb-6 flex flex-wrap items-end gap-4 rounded-xl border border-slate-100 bg-bg-subtle p-4">
        <div>
          <label htmlFor="dateFrom" className="mb-1.5 block text-xs font-medium text-slate-500">
            From date
          </label>
          <input
            id="dateFrom"
            type="date"
            value={dateFrom}
            onChange={(e) => updateParam('dateFrom', e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-ink focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
          />
        </div>

        <div>
          <label htmlFor="dateTo" className="mb-1.5 block text-xs font-medium text-slate-500">
            To date
          </label>
          <input
            id="dateTo"
            type="date"
            value={dateTo}
            onChange={(e) => updateParam('dateTo', e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-ink focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
          />
        </div>

        <div>
          <label htmlFor="priceMin" className="mb-1.5 block text-xs font-medium text-slate-500">
            Min price (£)
          </label>
          <input
            id="priceMin"
            type="number"
            min={0}
            placeholder="0"
            value={priceDraft.min}
            onChange={(e) => setPriceDraft({ ...priceDraft, min: e.target.value })}
            onBlur={applyPriceFilter}
            onKeyDown={(e) => e.key === 'Enter' && applyPriceFilter()}
            className="w-24 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-ink focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
          />
        </div>

        <div>
          <label htmlFor="priceMax" className="mb-1.5 block text-xs font-medium text-slate-500">
            Max price (£)
          </label>
          <input
            id="priceMax"
            type="number"
            min={0}
            placeholder="Any"
            value={priceDraft.max}
            onChange={(e) => setPriceDraft({ ...priceDraft, max: e.target.value })}
            onBlur={applyPriceFilter}
            onKeyDown={(e) => e.key === 'Enter' && applyPriceFilter()}
            className="w-24 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-ink focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
          />
        </div>

        {hasActiveFilters ? (
          <button
            onClick={clearAllFilters}
            className="ml-auto flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-danger"
          >
            <X size={14} /> Clear all filters
          </button>
        ) : null}
      </div>

      {league && (
        <div className="mb-6 flex items-center gap-2">
          <span className="badge bg-primary-50 text-primary-700">
            {league}
            <button onClick={() => updateParam('league', '')} aria-label="Clear filter">
              <X size={12} />
            </button>
          </span>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card h-56 animate-pulse bg-slate-50" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="card flex flex-col items-center justify-center gap-3 py-20 text-center">
          <p className="font-semibold text-ink">No events found</p>
          <p className="max-w-sm text-sm text-slate-500">
            Try a different league, date range, or price, or check back soon for new fixtures.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {events.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsList;