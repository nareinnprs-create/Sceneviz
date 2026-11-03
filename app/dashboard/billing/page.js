'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { apiJson, useSessionToken } from '@/components/dashboard/session';
import { SkeletonLine, btnPrimary, cardClass } from '@/components/dashboard/ui';

const GATEWAY_LABELS = {
  dodo: 'Buy with Dodo (card/international)',
  cashfree: 'Buy with Cashfree (UPI/India)',
};

export default function DashboardBillingPage() {
  const token = useSessionToken();
  const [data, setData] = useState(null); // {packs, cashfreeAvailable}
  const [busy, setBusy] = useState(false);
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
        setData({ packs: [], cashfreeAvailable: false });
      });
  }, [token]);

  const buy = async (gateway) => {
    setBusy(true);
    setError('');
    try {
      const res = await apiJson('/billing/checkout', {
        method: 'POST',
        body: JSON.stringify({ pack: 'credits500', gateway }),
      });
      window.location.assign(res.checkout_url);
    } catch (err) {
      if (!err.handled) setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight">Buy credits</h1>
        <p className="mt-1 text-sm text-secondary">
          Credits are shared across your account and all of its API keys.
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

      {data === null ? (
        <SkeletonLine className="h-48 w-full" />
      ) : (
        data.packs.map((pack) => (
          <section key={pack.id} className={`${cardClass} p-6`} aria-label={`Credit pack ${pack.id}`}>
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <h2 className="font-display text-xl font-bold">{pack.credits.toLocaleString()} credits</h2>
              <p className="text-sm text-secondary">
                {pack.priceUSD} &middot; {pack.priceINR}
              </p>
            </div>
            <p className="mt-2 text-sm text-secondary">
              One-time purchase. Roughly {Math.floor(pack.credits / 4)} flux-dev or{' '}
              {Math.floor(pack.credits / 2)} sdxl images.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={() => buy('dodo')} disabled={busy} className={btnPrimary}>
                {busy ? 'Starting checkout…' : GATEWAY_LABELS.dodo}
              </button>
              <button
                type="button"
                onClick={() => buy('cashfree')}
                disabled
                title={data.cashfreeAvailable ? 'Unavailable right now' : 'Coming soon'}
                className={`${btnPrimary} opacity-50`}
              >
                {GATEWAY_LABELS.cashfree} — coming soon
              </button>
            </div>
            {error && (
              <p role="alert" className="mt-3 text-sm text-red-400">
                {error}
              </p>
            )}
          </section>
        ))
      )}
    </div>
  );
}
