'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { apiJson, useSessionToken } from '@/components/dashboard/session';
import { SkeletonLine, cardClass, formatDate } from '@/components/dashboard/ui';

export default function DashboardOverviewPage() {
  const token = useSessionToken();
  const [me, setMe] = useState(null);

  useEffect(() => {
    if (!token) return undefined;
    let active = true;
    apiJson('/me')
      .then((data) => {
        if (active) setMe(data);
      })
      .catch((err) => {
        if (!err.handled && active) toast.error(err.message);
      });
    return () => {
      active = false;
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
        <h1 className="font-display text-2xl font-bold tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-secondary">Signed in as {account.email}</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2" aria-label="Account summary">
        <div className={`${cardClass} p-6`}>
          <p className="text-xs font-bold uppercase tracking-widest text-secondary">Credits</p>
          <p className="mt-2 font-display text-5xl font-bold text-primary">{account.credits}</p>
        </div>
        <div className={`${cardClass} p-6`}>
          <p className="text-xs font-bold uppercase tracking-widest text-secondary">API keys</p>
          <p className="mt-2 font-display text-5xl font-bold">{keys.length}</p>
          <p className="mt-1 text-xs text-secondary">Up to 10 keys per account</p>
        </div>
      </section>

      <section className={`${cardClass} p-6`} aria-label="Account details">
        <p className="text-xs font-bold uppercase tracking-widest text-secondary">Account</p>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex flex-wrap gap-x-2">
            <dt className="text-secondary">Email</dt>
            <dd>{account.email}</dd>
          </div>
          <div className="flex flex-wrap gap-x-2">
            <dt className="text-secondary">Account ID</dt>
            <dd className="break-all font-mono text-xs">{account.id}</dd>
          </div>
          <div className="flex flex-wrap gap-x-2">
            <dt className="text-secondary">Member since</dt>
            <dd>{formatDate(account.created_at)}</dd>
          </div>
        </dl>
      </section>

      <section className="grid gap-4 sm:grid-cols-2" aria-label="Quick links">
        <Link
          href="/dashboard/keys"
          className={`${cardClass} block p-6 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60`}
        >
          <p className="font-semibold">Manage API keys</p>
          <p className="mt-1 text-sm text-secondary">Create, copy and revoke keys &rarr;</p>
        </Link>
        <Link
          href="/dashboard/history"
          className={`${cardClass} block p-6 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60`}
        >
          <p className="font-semibold">Generation history</p>
          <p className="mt-1 text-sm text-secondary">Browse past outputs &rarr;</p>
        </Link>
      </section>
    </div>
  );
}
