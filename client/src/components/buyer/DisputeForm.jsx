import { useState } from 'react';
import { Upload, X } from 'lucide-react';

const REASONS = [
  { value: 'ticket_not_received', label: "Ticket wasn't received" },
  { value: 'invalid_ticket', label: 'Ticket is invalid' },
  { value: 'wrong_ticket', label: 'Wrong ticket / seat' },
  { value: 'denied_entry', label: 'Denied entry at venue' },
  { value: 'seller_unresponsive', label: 'Seller unresponsive' },
  { value: 'other', label: 'Other' },
];

const DisputeForm = ({ onSubmit, submitting }) => {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []).slice(0, 5);
    setFiles(selected);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason || !description.trim()) return;
    onSubmit({ reason, description, files });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label className="mb-2 block text-sm font-medium text-ink">What went wrong?</label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {REASONS.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setReason(r.value)}
              className={`rounded-xl border-2 px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                reason === r.value
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-slate-200 text-ink hover:border-slate-300'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-ink">
          Describe the issue
        </label>
        <textarea
          id="description"
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Please give as much detail as possible — this helps our team resolve your case faster."
          className="input-field resize-none"
          maxLength={2000}
        />
        <p className="mt-1 text-right text-xs text-slate-400">{description.length}/2000</p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">
          Evidence <span className="font-normal text-slate-400">(optional, up to 5 photos)</span>
        </label>
        <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-slate-200 py-6 text-center hover:border-primary-300 hover:bg-primary-50/30">
          <Upload size={20} className="text-slate-400" />
          <span className="text-sm text-slate-500">Click to upload photos</span>
          <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
        </label>

        {files.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {files.map((file, i) => (
              <span key={i} className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs text-slate-600">
                {file.name.slice(0, 20)}
                <button type="button" onClick={() => removeFile(i)} aria-label="Remove file">
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={!reason || !description.trim() || submitting}
        className="btn-primary justify-center"
      >
        {submitting ? 'Submitting...' : 'Submit dispute'}
      </button>
      <p className="text-center text-xs text-slate-400">
        Our team reviews all disputes within 48 hours.
      </p>
    </form>
  );
};

export default DisputeForm;