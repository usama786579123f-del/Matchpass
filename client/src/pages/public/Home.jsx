import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Zap,
  Search,
  Ticket,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import api from '../../services/api';
import EventCard from '../../components/public/EventCard';
import LeagueBand from '../../components/public/LeagueBand';
import { useSEO } from '../../hooks/useSEO';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=2000&auto=format&fit=crop';

/**
 * Placeholder demo events shown ONLY when the live API returns nothing —
 * keeps the homepage looking fully populated for design review before
 * real fixtures exist in the database. Swap/remove once admin has
 * created real events with real imageUrl values.
 */
const DEMO_EVENTS = [
  {
    _id: 'demo-1',
    slug: 'demo-1',
    league: 'Premier League',
    homeTeam: 'Arsenal',
    awayTeam: 'Manchester City',
    eventDate: new Date(Date.now() + 6 * 86400000),
    venue: { name: 'Emirates Stadium', city: 'London' },
    lowestPrice: 145,
    imageUrl:
      'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?q=80&w=1200&auto=format&fit=crop',
  },
  {
    _id: 'demo-2',
    slug: 'demo-2',
    league: 'Premier League',
    homeTeam: 'Liverpool',
    awayTeam: 'Chelsea',
    eventDate: new Date(Date.now() + 9 * 86400000),
    venue: { name: 'Anfield', city: 'Liverpool' },
    lowestPrice: 98,
    imageUrl:
      'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?q=80&w=1200&auto=format&fit=crop',
  },
  {
    _id: 'demo-3',
    slug: 'demo-3',
    league: 'Champions League',
    homeTeam: 'Manchester United',
    awayTeam: 'Bayern Munich',
    eventDate: new Date(Date.now() + 14 * 86400000),
    venue: { name: 'Old Trafford', city: 'Manchester' },
    lowestPrice: 210,
    imageUrl:
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop',
  },
  {
    _id: 'demo-4',
    slug: 'demo-4',
    league: 'Champions League',
    homeTeam: 'Tottenham Hotspur',
    awayTeam: 'Real Madrid',
    eventDate: new Date(Date.now() + 18 * 86400000),
    venue: { name: 'Tottenham Hotspur Stadium', city: 'London' },
    lowestPrice: 175,
    imageUrl:
      'https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?q=80&w=1200&auto=format&fit=crop',
  },
  {
    _id: 'demo-5',
    slug: 'demo-5',
    league: 'FA Cup',
    homeTeam: 'Newcastle United',
    awayTeam: 'Aston Villa',
    eventDate: new Date(Date.now() + 21 * 86400000),
    venue: { name: "St James' Park", city: 'Newcastle' },
    lowestPrice: 62,
    imageUrl:
      'https://images.unsplash.com/photo-1459865264687-595d652de67e?q=80&w=1200&auto=format&fit=crop',
  },
  {
    _id: 'demo-6',
    slug: 'demo-6',
    league: 'FA Cup',
    homeTeam: 'West Ham United',
    awayTeam: 'Everton',
    eventDate: new Date(Date.now() + 23 * 86400000),
    venue: { name: 'London Stadium', city: 'London' },
    lowestPrice: 54,
    imageUrl:
      'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=1200&auto=format&fit=crop',
  },
];

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingDemo, setUsingDemo] = useState(false);

  useSEO({
    title: 'Buy & Sell Football Tickets Safely',
    description:
      'MatchPass is the UK marketplace for buying and selling football match tickets with escrow protection, verified sellers, and fast payouts.',
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await api.get('/events/featured');
        if (data.data.events?.length) {
          setEvents(data.data.events);
        } else {
          setEvents(DEMO_EVENTS);
          setUsingDemo(true);
        }
      } catch {
        setEvents(DEMO_EVENTS);
        setUsingDemo(true);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const leagues = [...new Set(events.map((e) => e.league))];

  return (
    <div>
      {/* ---- Photo hero ---- */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={HERO_IMAGE}
            alt="Packed stadium under floodlights"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-ink/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/60 via-transparent to-transparent" />
        </div>

        <div className="container-page relative py-24 sm:py-32">
          <div className="max-w-2xl animate-slide-up">
            <span className="badge bg-white/10 text-white/90 backdrop-blur-sm">
              <ShieldCheck size={13} /> Every ticket protected by escrow
            </span>
            <h1 className="mt-5 font-display text-display-lg text-white sm:text-display-xl">
              Match day,
              <br />
              <span className="text-primary-400">without the risk.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-white/75">
              Buy and sell football tickets with confidence. Funds held
              securely until your ticket is delivered — no scams, no
              surprises.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const q = e.target.elements.heroSearch.value.trim();
                if (q) window.location.href = `/search?q=${encodeURIComponent(q)}`;
              }}
              className="mt-8 flex max-w-lg items-center gap-2 rounded-2xl bg-white p-2 shadow-elevated"
            >
              <Search className="ml-2 shrink-0 text-slate-400" size={20} />
              <input
                name="heroSearch"
                type="text"
                placeholder="Search for a team, match, or venue"
                className="w-full bg-transparent py-2 text-sm text-ink placeholder:text-slate-400 focus:outline-none"
              />
              <button type="submit" className="btn-primary shrink-0 !px-5">
                Find tickets
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ---- Trust bar ---- */}
      <section className="border-b border-slate-100 bg-bg-subtle">
        <div className="container-page grid grid-cols-1 gap-6 py-8 sm:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              title: 'Escrow protected',
              desc: 'Your payment is only released once delivery is confirmed.',
            },
            {
              icon: Zap,
              title: 'Verified sellers',
              desc: 'Every seller completes identity verification before listing.',
            },
            {
              icon: TrendingUp,
              title: 'Fair pricing',
              desc: 'See comparable prices before you buy — no guesswork.',
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                <Icon size={19} />
              </span>
              <div>
                <p className="font-semibold text-ink">{title}</p>
                <p className="text-sm text-slate-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---- Dense trending grid ---- */}
      <section className="container-page py-14">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-display text-display-sm text-ink">
              Trending matches
            </h2>
            <p className="mt-1 text-slate-500">Popular fixtures selling fast</p>
          </div>
          <Link
            to="/events"
            className="hidden items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700 sm:flex"
          >
            View all events <ArrowRight size={15} />
          </Link>
        </div>

        {usingDemo && (
          <div className="mb-6 rounded-xl border border-gold-200 bg-gold-50 px-4 py-2.5 text-xs font-medium text-gold-600">
            Showing sample fixtures for preview — live events will appear here once added via the admin panel.
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card h-56 animate-pulse bg-slate-50" />
            ))}
          </div>
        ) : (
          <>
            {/* First 2 as large feature cards */}
            <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {events.slice(0, 2).map((event) => (
                <EventCard key={event._id} event={event} size="lg" />
              ))}
            </div>

            {/* League-grouped dense grid */}
            {leagues.map((league) => {
              const leagueEvents = events.filter((e) => e.league === league);
              return (
                <div key={league}>
                  <LeagueBand league={league} count={leagueEvents.length} />
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {leagueEvents.map((event) => (
                      <EventCard key={event._id} event={event} />
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </section>

      {/* ---- Sell CTA ---- */}
      <section className="container-page pb-20">
        <div className="card flex flex-col items-center gap-4 overflow-hidden bg-gradient-to-br from-ink to-secondary-800 p-10 text-center sm:p-16">
          <span className="badge bg-white/10 text-white/90">For sellers</span>
          <h2 className="font-display text-display-sm text-white sm:text-display-md">
            Can't make the match? Sell your tickets.
          </h2>
          <p className="max-w-md text-white/70">
            List in minutes, get paid fast, and let us handle the buyer side
            entirely.
          </p>
          <Link to="/signup" className="btn-primary mt-2">
            Start selling <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;