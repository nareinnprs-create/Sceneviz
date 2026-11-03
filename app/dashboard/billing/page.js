'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { apiJson, useSessionToken } from '@/components/dashboard/session';
import { SkeletonLine, btnPrimary, cardClass } from '@/components/dashboard/ui';
import { t } from '@/components/dashboard/i18n';

const TIER_ORDER = ['starter', 'growth', 'scale'];

const TIER_COPY = {
  starter: { nameKey: 'billing.tierStarter', blurbKey: 'billing.tierStarterBlurb' },
  growth: { nameKey: 'billing.tierGrowth', blurbKey: 'billing.tierGrowthBlurb', popular: true },
  scale: { nameKey: 'billing.tierScale', blurbKey: 'billing.tierScaleBlurb' },
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
        <h1 className="font-display text-2xl font-bold tracking-tight">{t('billing.title')}</h1>
        <p className="mt-1 text-sm text-secondary">
          {t('billing.subtitle')}{' '}
          {data?.currency && data.currency !== 'USD'
            ? t('billing.priceLocal', { cur: data.currency })
            : t('billing.priceUsd')}
        </p>
      </header>

      {paid && (
        <div role="alert" className="rounded-xl border border-primary/40 bg-primary/10 p-5">
          <p className="text-sm font-semibold text-primary">{t('billing.paymentReceived')}</p>
          <p className="mt-1 text-sm text-secondary">{t('billing.paymentNote')}</p>
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
            const copy = TIER_COPY[tier.id] || {};
            const name = copy.nameKey ? t(copy.nameKey) : tier.id;
            return (
              <section
                key={tier.id}
                aria-label={t('billing.tierAria', { name })}
                className={`${cardClass} flex flex-col p-6 ${
                  copy.popular ? 'ring-1 ring-primary/50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-bold">{name}</h2>
                  {copy.popular && (
                    <span className="rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      {t('billing.popular')}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-secondary">{copy.blurbKey ? t(copy.blurbKey) : ''}</p>
                <p className="mt-4 font-display text-3xl font-bold tracking-tight">
                  {priceLabel(tier)}
                </p>
                {tier.localPrice && (
                  <p className="mt-0.5 text-xs text-secondary">{t('billing.baseUsd', { usd: tier.usd })}</p>
                )}
                <p className="mt-3 text-sm font-semibold text-primary">
                  {t('billing.credits', { n: tier.credits.toLocaleString() })}
                </p>
                <p className="mt-1 text-xs text-secondary">
                  {t('billing.images', {
                    a: Math.floor(tier.credits / 10).toLocaleString(),
                    b: Math.floor(tier.credits / 4).toLocaleString(),
                  })}
                </p>
                <button
                  type="button"
                  onClick={() => buy(tier.id)}
                  disabled={busy !== ''}
                  className={`${btnPrimary} mt-6 w-full`}
                >
                  {busy === tier.id ? t('billing.startingCheckout') : t('billing.buy', { name })}
                </button>
              </section>
            );
          })}
        </div>
      )}

      <p className="text-xs text-secondary">{t('billing.footer')}</p>
    </div>
  );
}
