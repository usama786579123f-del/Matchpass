import { Link } from 'react-router-dom';
import { Ticket, ShieldCheck, Clock, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-ink">
      {/* Trust strip */}
      <div className="border-b border-white/10">
        <div className="container-page grid grid-cols-1 gap-6 py-8 sm:grid-cols-3">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 shrink-0 text-primary-400" size={22} />
            <div>
              <p className="text-sm font-semibold text-white">Buyer protection</p>
              <p className="text-sm text-white/50">
                Funds held in escrow until delivery is confirmed
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 shrink-0 text-primary-400" size={22} />
            <div>
              <p className="text-sm font-semibold text-white">Fast payouts</p>
              <p className="text-sm text-white/50">
                Sellers paid within 24 hours of match completion
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 shrink-0 text-primary-400" size={22} />
            <div>
              <p className="text-sm font-semibold text-white">Here to help</p>
              <p className="text-sm text-white/50">
                Disputes reviewed by our team within 48 hours
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-page grid grid-cols-2 gap-8 py-12 sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold text-white">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-500 text-white">
              <Ticket size={16} strokeWidth={2.5} />
            </span>
            MatchPass
          </Link>
          <p className="mt-3 text-sm text-white/50">
            The UK's trusted marketplace for buying and selling football
            match tickets.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-white">Company</p>
          <ul className="mt-3 space-y-2 text-sm text-white/50">
            <li><Link to="/about" className="hover:text-white">About us</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
            <li><Link to="/faq" className="hover:text-white">FAQ</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-white">Legal</p>
          <ul className="mt-3 space-y-2 text-sm text-white/50">
            <li><Link to="/terms" className="hover:text-white">Terms of service</Link></li>
            <li><Link to="/privacy" className="hover:text-white">Privacy policy</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-white">Get started</p>
          <ul className="mt-3 space-y-2 text-sm text-white/50">
            <li><Link to="/events" className="hover:text-white">Browse events</Link></li>
            <li><Link to="/signup" className="hover:text-white">Sell tickets</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-6">
        <p className="container-page text-center text-xs text-white/40">
          © {new Date().getFullYear()} MatchPass. All rights reserved. Registered in the United Kingdom.
        </p>
      </div>
    </footer>
  );
};

export default Footer;