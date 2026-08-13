import { useEffect, useState } from 'react';
import {
  Plus,
  X,
  Calendar,
  MapPin,
} from 'lucide-react';
import api from '../../services/api';
import { formatEventDate } from '../../utils/formatDate';
import EventForm from '../../components/admin/EventForm';
import VenueForm from '../../components/admin/VenueForm';

const EventManagement = () => {
  const [activeTab, setActiveTab] = useState('events');
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showVenueForm, setShowVenueForm] = useState(false);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events?limit=50&status=upcoming');
      setEvents(response.data.data.events || []);
    } catch (err) {
      setEvents([]);
    }
  };

  const fetchVenues = async () => {
    try {
      const response = await api.get('/venues');
      setVenues(response.data.data.venues || []);
    } catch (err) {
      setVenues([]);
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchEvents(), fetchVenues()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-display-sm text-ink">Event management</h1>
          <p className="mt-1 text-slate-500">
            Add and manage fixtures and venues on the platform.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowVenueForm(true)} className="btn-secondary">
            <MapPin size={16} />
            <span>New venue</span>
          </button>
          <button onClick={() => setShowEventForm(true)} className="btn-primary">
            <Plus size={16} />
            <span>New event</span>
          </button>
        </div>
      </div>

      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setActiveTab('events')}
          className={
            'rounded-full px-4 py-1.5 text-sm font-medium transition-colors ' +
            (activeTab === 'events'
              ? 'bg-ink text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200')
          }
        >
          Events
        </button>
        <button
          onClick={() => setActiveTab('venues')}
          className={
            'rounded-full px-4 py-1.5 text-sm font-medium transition-colors ' +
            (activeTab === 'venues'
              ? 'bg-ink text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200')
          }
        >
          Venues
        </button>
      </div>

      {activeTab === 'events' ? (
        <div className="card overflow-x-auto p-5">
          {loading ? (
            <div className="h-64 animate-pulse rounded-xl bg-slate-50" />
          ) : events.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">No events yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <th className="pb-3 pr-4">Fixture</th>
                  <th className="pb-3 pr-4">League</th>
                  <th className="pb-3 pr-4">Venue</th>
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event._id} className="border-b border-slate-100 last:border-0">
                    <td className="py-3.5 pr-4 font-medium text-ink">
                      {event.homeTeam} vs {event.awayTeam}
                    </td>
                    <td className="py-3.5 pr-4 text-slate-600">{event.league}</td>
                    <td className="py-3.5 pr-4 text-slate-600">{event.venue?.name}</td>
                    <td className="py-3.5 pr-4 text-slate-600">
                      {formatEventDate(event.eventDate)}
                    </td>
                    <td className="py-3.5">
                      <span className="badge-success capitalize">{event.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div className="card overflow-x-auto p-5">
          {loading ? (
            <div className="h-64 animate-pulse rounded-xl bg-slate-50" />
          ) : venues.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">No venues yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <th className="pb-3 pr-4">Name</th>
                  <th className="pb-3 pr-4">City</th>
                  <th className="pb-3 pr-4">Country</th>
                  <th className="pb-3">Capacity</th>
                </tr>
              </thead>
              <tbody>
                {venues.map((venue) => (
                  <tr key={venue._id} className="border-b border-slate-100 last:border-0">
                    <td className="py-3.5 pr-4 font-medium text-ink">{venue.name}</td>
                    <td className="py-3.5 pr-4 text-slate-600">{venue.city}</td>
                    <td className="py-3.5 pr-4 text-slate-600">{venue.country}</td>
                    <td className="py-3.5 text-slate-600">
                      {venue.capacity ? venue.capacity.toLocaleString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {showEventForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-elevated animate-scale-in">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
                <Calendar size={18} />
                <span>New event</span>
              </h2>
              <button
                onClick={() => setShowEventForm(false)}
                className="rounded-lg p-1.5 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>
            <EventForm
              onSuccess={() => {
                setShowEventForm(false);
                fetchAll();
              }}
            />
          </div>
        </div>
      ) : null}

      {showVenueForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-elevated animate-scale-in">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
                <MapPin size={18} />
                <span>New venue</span>
              </h2>
              <button
                onClick={() => setShowVenueForm(false)}
                className="rounded-lg p-1.5 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>
            <VenueForm
              onSuccess={() => {
                setShowVenueForm(false);
                fetchAll();
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default EventManagement;