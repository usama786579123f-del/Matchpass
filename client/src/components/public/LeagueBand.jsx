import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

/**
 * League/competition divider band — groups a row of events under a
 * named competition, mirroring how ticket marketplaces segment browse
 * pages by league so buyers can scan by competition.
 */
const LeagueBand = ({ league, count }) => {
  return (
    <div className="my-8 flex items-center justify-between rounded-xl bg-ink px-5 py-3.5">
      <div className="flex items-center gap-2.5">
        <span className="h-2 w-2 rounded-full bg-primary-400" />
        <h3 className="font-display text-sm font-semibold tracking-wide text-white sm:text-base">
          {league}
        </h3>
        {count !== undefined && (
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium text-white/70">
            {count} matches
          </span>
        )}
      </div>
      <Link
        to={`/events?league=${encodeURIComponent(league)}`}
        className="flex items-center gap-1 text-xs font-semibold text-white/80 hover:text-white"
      >
        See all <ArrowRight size={13} />
      </Link>
    </div>
  );
};

export default LeagueBand;