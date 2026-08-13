import { Construction } from 'lucide-react';

/**
 * Temporary placeholder used across not-yet-built pages so routing/layouts
 * can be tested end-to-end before every screen has final content.
 */
const EmptyState = ({ title }) => {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center gap-3 py-20 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
        <Construction size={26} />
      </span>
      <h1 className="font-display text-display-sm text-ink">{title}</h1>
      <p className="max-w-sm text-slate-500">This page is being built and will be ready soon.</p>
    </div>
  );
};

export default EmptyState;