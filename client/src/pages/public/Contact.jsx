import { useState } from 'react';
import { Mail, MessageSquare, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    // NOTE: wire this to a real /api/contact endpoint if/when one exists.
    // For now this simulates submission so the form is fully usable.
    await new Promise((resolve) => setTimeout(resolve, 700));
    toast.success("Message sent! We'll get back to you within 24 hours.");
    setFormData({ name: '', email: '', message: '' });
    setSubmitting(false);
  };

  return (
    <div className="container-page py-16">
      <div className="text-center">
        <h1 className="font-display text-display-sm text-ink">Get in touch</h1>
        <p className="mt-2 text-slate-500">We're here to help with any questions.</p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-1">
          <div className="card flex items-start gap-3 p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <Mail size={18} />
            </span>
            <div>
              <p className="font-semibold text-ink">Email us</p>
              <p className="text-sm text-slate-500">support@matchpass.com</p>
            </div>
          </div>
          <div className="card flex items-start gap-3 p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary-50 text-secondary-600">
              <MessageSquare size={18} />
            </span>
            <div>
              <p className="font-semibold text-ink">Live chat</p>
              <p className="text-sm text-slate-500">Available Mon–Fri, 9am–6pm GMT</p>
            </div>
          </div>
          <div className="card flex items-start gap-3 p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-50 text-gold-600">
              <Clock size={18} />
            </span>
            <div>
              <p className="font-semibold text-ink">Response time</p>
              <p className="text-sm text-slate-500">We reply within 24 hours</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="card flex flex-col gap-4 p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">Name</label>
                <input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Message</label>
              <textarea
                rows={6}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="input-field resize-none"
                required
              />
            </div>
            <button type="submit" disabled={submitting} className="btn-primary self-start">
              {submitting ? 'Sending...' : 'Send message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;