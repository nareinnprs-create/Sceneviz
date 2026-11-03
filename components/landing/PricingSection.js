const PACKS_URL = 'https://api.opraiz.com/billing/packs';
// Fallback mirroring GET /billing/packs ({currency, tiers:[{id, credits, usd, priceUSD, localPrice?}]})
// so the section still renders the USD base prices if the billing API is unreachable.
const FALLBACK_TIERS = [
  { id: 'starter', credits: 10000, usd: 50, priceUSD: '$50' },
  { id: 'growth', credits: 30000, usd: 149, priceUSD: '$149' },
  { id: 'scale', credits: 100000, usd: 499, priceUSD: '$499' },
];

async function fetchTiers() {
  try {
    const res = await fetch(PACKS_URL, { next: { revalidate: 3600 } });
    if (!res.ok) return FALLBACK_TIERS;
    const data = await res.json();
    const tiers = Array.isArray(data?.tiers) ? data.tiers : [];
    return tiers.length > 0 ? tiers : FALLBACK_TIERS;
  } catch {
    return FALLBACK_TIERS;
  }
}

function formatCredits(credits) {
  const value = Number(credits);
  return Number.isFinite(value) ? value.toLocaleString('en-US') : String(credits ?? '');
}

export default async function PricingSection({ copy }) {
  const tiers = await fetchTiers();
  const getStartedHref = copy?.getStartedHref || '/dashboard/login';

  return (
    <section id="pricing" className="w-full border-b border-divider bg-bg-card px-6 py-16 md:px-12">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-10">
        <div className="max-w-3xl">
          <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-secondary-text">{copy?.eyebrow}</p>
          <h2 className="font-display text-2xl font-black tracking-tight text-primary-text sm:text-3xl">{copy?.title}</h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-secondary-text sm:text-lg">{copy?.description}</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tiers.map((tier) => {
            const tierCopy = copy?.tiers?.[tier?.id] || {};
            const popular = Boolean(tierCopy.popular);
            return (
              <div
                key={tier?.id ?? tierCopy.name}
                className={`relative flex h-full min-w-0 flex-col gap-4 rounded-2xl border bg-bg-elevated p-6 ${
                  popular ? 'border-primary/50 ring-1 ring-primary/30' : 'border-divider'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-lg font-bold text-primary-text">{tierCopy.name || tier?.id}</h3>
                  {popular ? (
                    <span className="inline-flex shrink-0 items-center rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#101319]">
                      {copy?.popular}
                    </span>
                  ) : null}
                </div>
                <p className="text-sm leading-relaxed text-secondary-text">{tierCopy.blurb}</p>
                <div className="flex min-w-0 flex-col gap-1">
                  {tier?.localPrice ? (
                    <>
                      <span className="truncate font-display text-2xl font-black tracking-tight text-primary-text sm:text-3xl">
                        ≈ {tier.localPrice}
                      </span>
                      <span className="text-sm font-semibold text-secondary-text">
                        {tier?.priceUSD} {copy?.usdLabel}
                      </span>
                    </>
                  ) : (
                    <span className="font-display text-2xl font-black tracking-tight text-primary-text sm:text-3xl">
                      {tier?.priceUSD}
                    </span>
                  )}
                  <span className="text-xs font-semibold text-secondary-text">
                    {formatCredits(tier?.credits)} {copy?.creditsLabel}
                  </span>
                </div>
                {/* The dashboard is auth-gated and not localized (see SiteFooter's
                    Account column), so the href is rendered as-is, not localized. */}
                <a
                  href={getStartedHref}
                  className={`mt-auto inline-flex min-h-11 items-center justify-center rounded-full px-6 py-3 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
                    popular
                      ? 'bg-primary text-[#101319] hover:bg-primary-hover'
                      : 'border border-divider text-primary-text hover:bg-bg-card-hover'
                  }`}
                >
                  {copy?.getStarted}
                </a>
              </div>
            );
          })}
        </div>
        <p className="text-xs leading-relaxed text-secondary-text">{copy?.currencyNote}</p>
      </div>
    </section>
  );
}
