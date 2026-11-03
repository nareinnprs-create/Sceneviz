'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import { API_BASE_URL } from '@/lib/apiConfig';
import { clearSessionToken, getSessionToken } from './session';
import { Spinner, btnGhost } from './ui';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Overview', exact: true },
  { href: '/dashboard/keys', label: 'API Keys' },
  { href: '/dashboard/billing', label: 'Buy credits' },
  { href: '/dashboard/history', label: 'History' },
];

const TOASTER_OPTIONS = {
  style: { background: '#1E242D', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' },
};

export default function DashboardShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [token, setToken] = useState(undefined);

  // Re-read on navigation: sign-in/sign-out swap localStorage, and the layout
  // (this shell) does not remount between /dashboard routes.
  useEffect(() => {
    setToken(getSessionToken());
  }, [pathname]);

  const isLogin = pathname === '/dashboard/login';

  useEffect(() => {
    if (!isLogin && token === null) router.replace('/dashboard/login');
  }, [isLogin, token, router]);

  if (isLogin) {
    return (
      <>
        <Toaster position="top-right" toastOptions={TOASTER_OPTIONS} />
        {children}
      </>
    );
  }

  if (token === undefined || token === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app-bg">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const signOut = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // logout is best-effort; clear the local session regardless
    }
    clearSessionToken();
    router.replace('/dashboard/login');
  };

  return (
    <div className="min-h-screen bg-app-bg text-white">
      <Toaster position="top-right" toastOptions={TOASTER_OPTIONS} />
      <header className="sticky top-0 z-40 border-b border-white/10 bg-panel-bg/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-3 px-6 py-4">
          <Link
            href="/dashboard"
            className="rounded font-display text-lg font-bold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            Sceneviz <span className="text-primary">Dashboard</span>
          </Link>
          <nav aria-label="Dashboard" className="flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={`rounded px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
                    active ? 'font-semibold text-primary' : 'text-secondary hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <button type="button" onClick={signOut} className={`${btnGhost} ml-auto`}>
            Sign out
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
}
