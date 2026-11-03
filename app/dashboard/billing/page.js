'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { apiJson, useSessionToken } from '@/components/dashboard/session';
import { SkeletonLine, btnPrimary, cardClass } from '@/components/dashboard/ui';

const TIER_ORDER = ['starter', 'growth', 'scale'];

const TIER_COPY = {
  starter: { name: 'Starter', blurb: 'For trying real workflows' },
  growth: { name: 'Growth', blurb: 'For daily production work', popular: true },
  scale: { name: 'Scale', blurb: 'For teams and heavy pipelines' },
};

function priceLabel(tier) {
  // API returns localPrice only when it could resolve a rate for the visitor's
  // country; otherwise the tier card falls back to the USD base.
  return tier.localPrice || tier.priceUSD;
}

export default function DashboardBillingPage() {
  const token = useSessionToken();
  const [data, setData] = useState(null); // {currency, tiers}
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [paid, setPaid] = useState(false);

  // Dodo redirects back here with ?paid=1 after a successful checkout.
  useEffect(() => {
    setPaid(new URLSearchParams(window.location.search).get('paid') === '1');
  }, []);

  useEffect(() => {
    if (!token) return;
    apiJson('/billing/packs')
      .then(setData)
      .catch((err) => {
        if (!err.handled) toast.error(err.message);
        setData({ currency: 'USD', tiers: [] });
      });
  }, [token]);

  const buy = async (tierId) => {
    setBusy(tierId);
    setError('');
    try {
      const res = await apiJson('/billing/checkout', {
        method: 'POST',
        body: JSON.stringify({ tier: tierId, gateway: 'dodo' }),
      });
      window.location.assign(res.checkout_url);
    } catch (err) {
      if (!err.handled) setError(err.message);
      setBusy('');
    }
  };

  const tiers = data?.tiers
    ? [...data.tiers].sort((a, b) => TIER_ORDER.indexOf(a.id) - TIER_ORDER.indexOf(b.id))
    : [];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight">Buy credits</h1>
        <p className="mt-1 text-sm text-secondary">
          Credits are shared across your account and all of its API keys. Prices shown in
          {data?.currency && data.currency !== 'USD' ? ` ${data.currency} (approximate) — ` : ' USD — '}
          checkout adapts to your local currency automatically.
        </p>
      </header>

      {paid && (
        <div role="alert" className="rounded-xl border border-primary/40 bg-primary/10 p-5">
          <p className="text-sm font-semibold text-primary">Payment received.</p>
          <p className="mt-1 text-sm text-secondary">
            We&apos;re confirming it now — your balance updates automatically, usually within a
            minute. No need to do anything else.
          </p>
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}

      {data === null ? (
        <SkeletonLine className="h-64 w-full" />
      ) : (
        <div className="grid gap-5 md:grid-cols-3">
          {tiers.map((tier) => {
            const copy = TIER_COPY[tier.id] || { name: tier.id, blurb: '' };
            return (
              <section
                key={tier.id}
                aria-label={`Tier ${copy.name}`}
                className={`${cardClass} flex flex-col p-6 ${
                  copy.popular ? 'ring-1 ring-primary/50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-bold">{copy.name}</h2>
                  {copy.popular && (
                    <span className="rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      Popular
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-secondary">{copy.blurb}</p>
                <p className="mt-4 font-display text-3xl font-bold tracking-tight">
                  {priceLabel(tier)}
                </p>
                {tier.localPrice && (
                  <p className="mt-0.5 text-xs text-secondary">base ${tier.usd} USD</p>
                )}
                <p className="mt-3 text-sm font-semibold text-primary">
                  {tier.credits.toLocaleString()} credits
                </p>
                <p className="mt-1 text-xs text-secondary">
                  ≈ {Math.floor(tier.credits / 4).toLocaleString()} flux-dev or{' '}
                  {Math.floor(tier.credits / 2).toLocaleString()} sdxl images
                </p>
                <button
                  type="button"
                  onClick={() => buy(tier.id)}
                  disabled={busy !== ''}
                  className={`${btnPrimary} mt-6 w-full`}
                >
                  {busy === tier.id ? 'Starting checkout…' : `Buy ${copy.name}`}
                </button>
              </section>
            );
          })}
        </div>
      )}

      <p className="text-xs text-secondary">
        One-time purchase, no subscription. Payments are processed securely by Dodo Payments
        (merchant of record) — cards and local payment methods are supported at checkout.
      </p>
    </div>
  );
}
