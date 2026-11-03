// Shared presentation bits for the dashboard. Static Tailwind tokens only
// (bg-app-bg / bg-card-bg / primary / text-secondary) — the CSS-var tokens
// (border-divider, bg-bg-page, …) only resolve inside .landing-root.

export function Spinner({ className = 'h-5 w-5' }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block animate-spin rounded-full border-2 border-white/20 border-t-primary ${className}`}
    />
  );
}

export function SkeletonLine({ className = '' }) {
  return <div className={`animate-pulse rounded bg-white/10 ${className}`} aria-hidden="true" />;
}

// completed → cyan, failed → red, everything else (submitted / in progress) → amber.
const STATUS_STYLES = {
  completed: 'border-primary/30 bg-primary/10 text-primary',
  failed: 'border-red-500/30 bg-red-500/10 text-red-400',
};
const STATUS_PENDING = 'border-[#F2AE43]/30 bg-[#F2AE43]/10 text-[#F2AE43]';

export function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${
        STATUS_STYLES[status] || STATUS_PENDING
      }`}
    >
      {status}
    </span>
  );
}

export function timeAgo(iso) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (Number.isNaN(seconds)) return '';
  const units = [
    ['y', 31536000],
    ['mo', 2592000],
    ['d', 86400],
    ['h', 3600],
    ['m', 60],
  ];
  for (const [label, span] of units) {
    if (seconds >= span) return `${Math.floor(seconds / span)}${label} ago`;
  }
  return 'just now';
}

export function formatDate(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export const cardClass = 'rounded-xl border border-white/10 bg-card-bg';
export const inputClass =
  'w-full rounded-md border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 transition-colors focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30';
export const btnPrimary =
  'rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:cursor-not-allowed disabled:opacity-50';
export const btnGhost =
  'rounded-md border border-white/10 px-3 py-1.5 text-sm text-secondary transition-colors hover:border-white/25 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:cursor-not-allowed disabled:opacity-50';
