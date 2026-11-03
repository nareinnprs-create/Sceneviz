'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { apiJson, useSessionToken } from '@/components/dashboard/session';
import { SkeletonLine, cardClass, formatDate } from '@/components/dashboard/ui';
import { t } from '@/components/dashboard/i18n';

export default function DashboardOverviewPage() {
  const token = useSessionToken();
  const [me, setMe] = useState(null);

  useEffect(() => {
    if (!token) return undefined;
    let active = true;
    let timer = null;
    // Billing redirects back with ?paid=1 after checkout — watch /me until the
    // credit balance moves, then announce it. Strip the param so refreshes
    // don't re-poll.
    const isPaid = new URLSearchParams(window.location.search).get('paid') === '1';
    apiJson('/me')
      .then((data) => {
        if (!active) return;
        setMe(data);
        if (!isPaid) return;
        window.history.replaceState(null, '', '/dashboard');
        const baseline = data?.account?.credits ?? 0;
        if (baseline > 0) {
          toast.success(t('overview.creditsAdded'));
          return;
        }
        let tries = 0;
        timer = setInterval(async () => {
          tries += 1;
          try {
            const fresh = await apiJson('/me');
            if (!active) return;
            if ((fresh?.account?.credits ?? 0) !== baseline) {
              setMe(fresh);
              toast.success(t('overview.creditsAdded'));
              clearInterval(timer);
            } else if (tries >= 12) {
              clearInterval(timer);
            }
          } catch {
            // transient poll errors: keep trying until the cap
          }
        }, 10000);
      })
      .catch((err) => {
        if (!err.handled && active) toast.error(err.message);
      });
    return () => {
      active = false;
      if (timer) clearInterval(timer);
    };
  }, [token]);

  if (!me) {
    return (
      <div className="space-y-6">
        <SkeletonLine className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2">
          <SkeletonLine className="h-28 w-full" />
          <SkeletonLine className="h-28 w-full" />
        </div>
        <SkeletonLine className="h-40 w-full" />
      </div>
    );
  }

  const { account, keys } = me;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight">{t('overview.title')}</h1>
        <p className="mt-1 text-sm text-secondary">{t('overview.signedInAs', { email: account.email })}</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2" aria-label={t('aria.accountSummary')}>
        <div className={`${cardClass} p-6`}>
          <p className="text-xs font-bold uppercase tracking-widest text-secondary">{t('overview.credits')}</p>
          <p className="mt-2 font-display text-5xl font-bold text-primary">{account.credits}</p>
        </div>
        <div className={`${cardClass} p-6`}>
          <p className="text-xs font-bold uppercase tracking-widest text-secondary">{t('overview.apiKeys')}</p>
          <p className="mt-2 font-display text-5xl font-bold">{keys.length}</p>
          <p className="mt-1 text-xs text-secondary">{t('overview.keysHint')}</p>
        </div>
      </section>

      <section className={`${cardClass} p-6`} aria-label={t('aria.accountDetails')}>
        <p className="text-xs font-bold uppercase tracking-widest text-secondary">{t('overview.account')}</p>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex flex-wrap gap-x-2">
            <dt className="text-secondary">{t('overview.email')}</dt>
            <dd>{account.email}</dd>
          </div>
          <div className="flex flex-wrap gap-x-2">
            <dt className="text-secondary">{t('overview.accountId')}</dt>
            <dd className="break-all font-mono text-xs">{account.id}</dd>
          </div>
          <div className="flex flex-wrap gap-x-2">
            <dt className="text-secondary">{t('overview.memberSince')}</dt>
            <dd>{formatDate(account.created_at)}</dd>
          </div>
        </dl>
      </section>

      <section className="grid gap-4 sm:grid-cols-2" aria-label={t('aria.quickLinks')}>
        <Link
          href="/dashboard/keys"
          className={`${cardClass} block p-6 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60`}
        >
          <p className="font-semibold">{t('overview.manageKeys')}</p>
          <p className="mt-1 text-sm text-secondary">{t('overview.manageKeysSub')}</p>
        </Link>
        <Link
          href="/dashboard/history"
          className={`${cardClass} block p-6 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60`}
        >
          <p className="font-semibold">{t('overview.historyLink')}</p>
          <p className="mt-1 text-sm text-secondary">{t('overview.historySub')}</p>
        </Link>
      </section>
    </div>
  );
}
