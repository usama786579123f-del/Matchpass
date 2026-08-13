import { useState, useEffect } from 'react';
import { Info, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatCurrency';
import { STADIUM_SECTIONS } from '../../utils/stadiumSections';

const TICKET_TYPES = [
  { value: 'e-ticket', label: 'E-ticket (PDF)' },
  { value: 'mobile-transfer', label: 'Mobile transfer' },
  { value: 'physical', label: 'Physical ticket' },
  { value: 'season-card', label: 'Season card' },
];

const ListingForm = ({ onSuccess, listingId }) => {
  const isEditMode = Boolean(listingId);

  const [events, setEvents] = useState([]);
  const [eventSearch, setEventSearch] = useState('');
  const [formData, setFormData] = useState({
    event: '',
    section: '',
    row: '',
    seats: '',
    quantity: 1,
    ticketType: 'e-ticket',
    pricePerTicket: '',
    faceValue: '',
    description: '',
    photoUrl: '',
  });
  const [priceSuggestion, setPriceSuggestion] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingListing, setLoadingListing] = useState(isEditMode);

  // Photo upload state
  const [photoFile, setPhotoFile] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // In edit mode, load the existing listing and pre-fill the form.
  useEffect(() => {
    if (!isEditMode) return;

    const fetchListing = async () => {
      try {
        const response = await api.get('/listings/' + listingId);
        const listing = response.data.data.listing;
        setFormData({
          event: listing.event?._id || '',
          section: listing.section || '',
          row: listing.row || '',
          seats: listing.seats || '',
          quantity: listing.quantity || 1,
          ticketType: listing.ticketType || 'e-ticket',
          pricePerTicket: listing.pricePerTicket ?? '',
          faceValue: listing.faceValue ?? '',
          description: listing.description || '',
          photoUrl: listing.photoUrl || '',
        });
        if (listing.event) {
          setEventSearch(listing.event.homeTeam + ' vs ' + listing.event.awayTeam);
        }
      } catch (err) {
        toast.error('Could not load listing details.');
      } finally {
        setLoadingListing(false);
      }
    };
    fetchListing();
  }, [isEditMode, listingId]);

  useEffect(() => {
    if (isEditMode) return; // don't re-search events when editing
    const searchEvents = async () => {
      if (eventSearch.length < 2) {
        setEvents([]);
        return;
      }
      try {
        const response = await api.get(
          '/events?q=' + encodeURIComponent(eventSearch) + '&limit=8'
        );
        setEvents(response.data.data.events || []);
      } catch (err) {
        setEvents([]);
      }
    };
    const debounce = setTimeout(searchEvents, 300);
    return () => clearTimeout(debounce);
  }, [eventSearch, isEditMode]);

  useEffect(() => {
    const fetchSuggestion = async () => {
      if (!formData.event) return;
      try {
        const response = await api.get(
          '/listings/price-suggestion?eventId=' +
            formData.event +
            '&section=' +
            formData.section
        );
        setPriceSuggestion(response.data.data);
      } catch (err) {
        setPriceSuggestion(null);
      }
    };
    fetchSuggestion();
  }, [formData.event, formData.section]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const selectEvent = (event) => {
    setFormData({ ...formData, event: event._id });
    setEventSearch(event.homeTeam + ' vs ' + event.awayTeam);
    setEvents([]);
  };

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);

    setUploadingPhoto(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('folder', 'listing-photos');

      const uploadRes = await api.post('/uploads', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFormData((prev) => ({ ...prev, photoUrl: uploadRes.data.data.url }));
      toast.success('Photo uploaded.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not upload photo.');
      setPhotoFile(null);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setFormData((prev) => ({ ...prev, photoUrl: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        quantity: parseInt(formData.quantity, 10),
        pricePerTicket: parseFloat(formData.pricePerTicket),
        faceValue: formData.faceValue ? parseFloat(formData.faceValue) : undefined,
      };

      if (isEditMode) {
        await api.patch('/listings/' + listingId, payload);
        toast.success('Listing updated!');
      } else {
        await api.post('/listings', payload);
        toast.success('Listing submitted for review!');
      }
      onSuccess?.();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          (isEditMode ? 'Could not update listing.' : 'Could not create listing.')
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingListing) {
    return (
      <div className="flex flex-col gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-11 animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Event search */}
      <div className="relative">
        <label className="mb-1.5 block text-sm font-medium text-ink">Event</label>
        <input
          type="text"
          value={eventSearch}
          onChange={(e) => {
            setEventSearch(e.target.value);
            setFormData({ ...formData, event: '' });
          }}
          placeholder="Search for a match..."
          className="input-field"
          required
          disabled={isEditMode}
        />
        {isEditMode ? (
          <p className="mt-1.5 text-xs text-slate-400">
            Event can't be changed on an existing listing — withdraw and create a new one instead.
          </p>
        ) : null}
        {!isEditMode && events.length > 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-xl border border-slate-200 bg-white p-1.5 shadow-elevated">
            {events.map((event) => (
              <button
                key={event._id}
                type="button"
                onClick={() => selectEvent(event)}
                className="flex w-full flex-col items-start rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50"
              >
                <span className="font-medium text-ink">
                  {event.homeTeam} vs {event.awayTeam}
                </span>
                <span className="text-xs text-slate-400">{event.league}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="section" className="mb-1.5 block text-sm font-medium text-ink">
            Section
          </label>
          <select
            id="section"
            name="section"
            value={formData.section}
            onChange={handleChange}
            className="input-field"
            required
          >
            <option value="">Select a section</option>
            {STADIUM_SECTIONS.map((s) => (
              <option key={s.id} value={s.label}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="row" className="mb-1.5 block text-sm font-medium text-ink">
            Row <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <input
            id="row"
            name="row"
            value={formData.row}
            onChange={handleChange}
            placeholder="e.g. 12"
            className="input-field"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="quantity" className="mb-1.5 block text-sm font-medium text-ink">
            Quantity
          </label>
          <input
            id="quantity"
            name="quantity"
            type="number"
            min={1}
            max={10}
            value={formData.quantity}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>
        <div>
          <label htmlFor="ticketType" className="mb-1.5 block text-sm font-medium text-ink">
            Ticket type
          </label>
          <select
            id="ticketType"
            name="ticketType"
            value={formData.ticketType}
            onChange={handleChange}
            className="input-field"
          >
            {TICKET_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="pricePerTicket" className="mb-1.5 block text-sm font-medium text-ink">
          Price per ticket (£)
        </label>
        <input
          id="pricePerTicket"
          name="pricePerTicket"
          type="number"
          min={1}
          step="0.01"
          value={formData.pricePerTicket}
          onChange={handleChange}
          className="input-field"
          required
        />
        {priceSuggestion?.suggestedPrice ? (
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
            <Info size={12} />
            Similar tickets are averaging {formatCurrency(priceSuggestion.suggestedPrice)}
            {' '}({priceSuggestion.sampleSize} listing{priceSuggestion.sampleSize !== 1 && 's'})
          </p>
        ) : null}
      </div>

      {/* Ticket photo upload */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">
          Ticket photo <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <p className="mb-2 text-xs text-slate-400">
          A photo of your actual ticket helps buyers trust your listing.
        </p>

        {formData.photoUrl ? (
          <div className="relative w-fit">
            <img
              src={formData.photoUrl}
              alt="Ticket preview"
              className="h-32 w-32 rounded-xl border border-slate-200 object-cover"
            />
            <button
              type="button"
              onClick={removePhoto}
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-white shadow-elevated"
              aria-label="Remove photo"
            >
              <X size={13} />
            </button>
          </div>
        ) : (
          <label className="flex w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-slate-200 py-8 text-center hover:border-primary-300 hover:bg-primary-50/30">
            <Upload size={20} className="text-slate-400" />
            <span className="text-sm text-slate-500">
              {uploadingPhoto
                ? 'Uploading...'
                : photoFile
                  ? photoFile.name
                  : 'Click to upload a photo of your ticket'}
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
              disabled={uploadingPhoto}
              className="hidden"
            />
          </label>
        )}
      </div>

      <div>
        <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-ink">
          Description <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={formData.description}
          onChange={handleChange}
          placeholder="Any additional details for buyers..."
          className="input-field resize-none"
          maxLength={1000}
        />
      </div>

      {!isEditMode && (
        <div className="rounded-xl border border-slate-100 bg-bg-subtle p-4 text-xs text-slate-500">
          Your listing will be reviewed by our team before it goes live - this usually takes less than a few hours.
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || !formData.event || uploadingPhoto}
        className="btn-primary justify-center"
      >
        {submitting
          ? isEditMode ? 'Saving...' : 'Submitting...'
          : isEditMode ? 'Save changes' : 'Submit listing'}
      </button>
    </form>
  );
};

export default ListingForm;