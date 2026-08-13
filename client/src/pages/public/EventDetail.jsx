import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, ChevronLeft, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import { formatEventDate, formatEventTime } from '../../utils/formatDate';
import ListingCardBuyer from '../../components/public/ListingCardBuyer';
import StadiumMap from '../../components/public/StadiumMap';
import { getSectionByLabel } from '../../utils/stadiumSections';

const EventDetail = () => {
  const { slug } = useParams();
  const [event, setEvent] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [hoveredSection, setHoveredSection] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const response = await api.get('/events/' + slug);
        setEvent(response.data.data.event);
        setListings(response.data.data.listings || []);
      } catch (err) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [slug]);

  if (loading) {
    return (
      <div className="container-page py-16">
        <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    );
  }

  if (notFound || !event) {
    return (
      <div className="container-page flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
        <h1 className="font-display text-display-sm text-ink">Event not found</h1>
        <p className="text-slate-500">This fixture may have been removed or the link is incorrect.</p>
        <Link to="/events" className="btn-primary mt-2">
          Browse events
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header banner */}
      <section className="relative overflow-hidden bg-ink">
        {event.imageUrl ? (
          <>
            <img
              src={event.imageUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/30" />
          </>
        ) : null}
        <div className="container-page relative py-12 sm:py-16">
          <Link
            to="/events"
            className="mb-6 inline-flex items-center gap-1 text-sm text-white/70 hover:text-white"
          >
            <ChevronLeft size={15} /> Back to events
          </Link>
          <span className="badge bg-white/10 text-white/90">{event.league}</span>
          <h1 className="mt-3 font-display text-display-md text-white sm:text-display-lg">
            {event.homeTeam} <span className="text-white/50">vs</span> {event.awayTeam}
          </h1>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/70">
            <span className="flex items-center gap-1.5">
              <Calendar size={15} /> {formatEventDate(event.eventDate)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={15} /> {formatEventTime(event.eventDate)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={15} /> {event.venue?.name}, {event.venue?.city}
            </span>
          </div>
        </div>
      </section>

      {/* Listings + seating map */}
      <section className="container-page py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">
              Available tickets
            </h2>
            <p className="text-sm text-slate-500">
              {listings.length} listing{listings.length !== 1 && 's'} from verified sellers
            </p>
          </div>
          <span className="hidden items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700 sm:flex">
            <ShieldCheck size={13} /> Escrow protected
          </span>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {listings.length === 0 ? (
              <div className="card flex flex-col items-center justify-center gap-2 py-16 text-center">
                <p className="font-semibold text-ink">No tickets listed yet</p>
                <p className="max-w-sm text-sm text-slate-500">
                  Check back soon - sellers list tickets for this fixture as the match approaches.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {listings.map((listing) => {
                  const sectionInfo = getSectionByLabel(listing.section);
                  return (
                    <div
                      key={listing._id}
                      onMouseEnter={() => sectionInfo && setHoveredSection(sectionInfo.id)}
                      onMouseLeave={() => setHoveredSection(null)}
                    >
                      <ListingCardBuyer listing={listing} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="card sticky top-24 p-5">
              <h3 className="mb-3 font-display text-sm font-semibold text-ink">Seating map</h3>
              <StadiumMap
                highlightedSectionId={hoveredSection}
                onSectionClick={setHoveredSection}
              />
              <p className="mt-3 text-xs text-slate-400">
                Schematic layout - hover a listing or tap a stand to preview its location.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EventDetail;