import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import api from '../../services/api';
import EventCard from '../../components/public/EventCard';

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [inputValue, setInputValue] = useState(query);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setEvents([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const response = await api.get(
          '/events?q=' + encodeURIComponent(query) + '&limit=24'
        );
        setEvents(response.data.data.events || []);
      } catch (err) {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setSearchParams({ q: inputValue.trim() });
    }
  };

  return (
    <div className="container-page py-10">
      <form onSubmit={handleSearch} className="mb-8 flex max-w-lg items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-subtle">
        <SearchIcon className="ml-2 shrink-0 text-slate-400" size={20} />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Search for a team, match, or venue"
          className="w-full bg-transparent py-2 text-sm text-ink placeholder:text-slate-400 focus:outline-none"
        />
        <button type="submit" className="btn-primary shrink-0 !px-5">
          Search
        </button>
      </form>

      <h1 className="font-display text-display-sm text-ink">
        {query ? 'Results for "' + query + '"' : 'Search events'}
      </h1>
      <p className="mt-1 text-slate-500">
        {loading
          ? 'Searching...'
          : query
          ? events.length + ' result' + (events.length !== 1 ? 's' : '') + ' found'
          : 'Enter a team, match, or venue name above.'}
      </p>

      <div className="mt-8">
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="card h-56 animate-pulse bg-slate-50" />
            ))}
          </div>
        ) : query && events.length === 0 ? (
          <div className="card flex flex-col items-center justify-center gap-3 py-16 text-center">
            <SearchIcon className="text-slate-300" size={32} />
            <p className="font-semibold text-ink">No results found</p>
            <p className="max-w-sm text-sm text-slate-500">
              Try a different team name, or browse all upcoming fixtures.
            </p>
            <Link to="/events" className="btn-secondary mt-2 text-sm">
              Browse all events
            </Link>
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SearchResults;