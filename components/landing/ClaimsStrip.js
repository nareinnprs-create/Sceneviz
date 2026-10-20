export default function ClaimsStrip({ copy }) {
  return (
    <div className="w-full border-b border-divider bg-bg-card">
      <div
        role="list"
        aria-label={copy.ariaLabel}
        className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-center gap-x-8 gap-y-3 px-4 py-4 text-sm sm:px-6"
      >
        {copy.items.map((item) => (
          <div key={item.label} role="listitem" className="flex items-center gap-2 text-secondary-text">
            <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" aria-hidden="true" />
            <span>
              <span className="font-bold text-primary-text">{item.value}</span> {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
