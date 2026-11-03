'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { apiJson, getSessionToken, setSessionToken } from '@/components/dashboard/session';
import { inputClass } from '@/components/dashboard/ui';
import { t } from '@/components/dashboard/i18n';

const TABS = [
  { id: 'login', labelKey: 'login.tabLogin' },
  { id: 'signup', labelKey: 'login.tabSignup' },
];

// Per-mode heading/subtitle copy keys.
const COPY = {
  login: { title: 'login.welcomeBack', sub: 'login.subLogin' },
  signup: { title: 'login.createTitle', sub: 'login.subSignup' },
  forgot: { title: 'login.forgotTitle', sub: 'login.forgotSub' },
  reset: { title: 'login.resetTitle', sub: 'login.resetSub' },
};

export default function DashboardLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Already signed in? Straight to the dashboard.
  useEffect(() => {
    if (getSessionToken()) router.replace('/dashboard');
  }, [router]);

  // Admin-minted reset links land here as /dashboard/login?reset=<token>
  // (scripts/admin.mjs prints exactly this URL). Capture the token, open the
  // set-new-password view and scrub the URL so the token leaves the address bar.
  useEffect(() => {
    const urlToken = new URLSearchParams(window.location.search).get('reset');
    if (!urlToken) return;
    setResetToken(urlToken);
    setMode('reset');
    window.history.replaceState(null, '', '/dashboard/login');
  }, []);

  const showTabs = mode === 'login' || mode === 'signup';
  const switchMode = (next) => {
    setMode(next);
    setError('');
    setPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const submitAuth = async (event) => {
    event.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError(t('login.enterEmail'));
      return;
    }
    if (mode === 'signup' && password.length < 8) {
      setError(t('login.passwordMin'));
      return;
    }
    if (!password) {
      setError(t('login.enterPassword'));
      return;
    }
    setBusy(true);
    setError('');
    try {
      const data = await apiJson(`/auth/${mode}`, {
        method: 'POST',
        body: JSON.stringify({ email: trimmedEmail, password }),
      });
      setSessionToken(data.session_token);
      router.replace('/dashboard');
    } catch (err) {
      if (!err.handled) {
        // The API returns its own English message; localize the common one.
        setError(/invalid email or password/i.test(err.message) ? t('login.invalidCredentials') : err.message);
      }
      setBusy(false);
    }
  };

  // No email service yet: /auth/forgot returns the reset token directly, so we
  // jump straight into the set-new-password view with it.
  const submitForgot = async (event) => {
    event.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError(t('login.enterEmail'));
      return;
    }
    setBusy(true);
    setError('');
    try {
      const data = await apiJson('/auth/forgot', {
        method: 'POST',
        body: JSON.stringify({ email: trimmedEmail }),
      });
      setResetToken(data.reset_token || '');
      setMode('reset');
    } catch (err) {
      if (!err.handled) setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const submitReset = async (event) => {
    event.preventDefault();
    if (newPassword.length < 8) {
      setError(t('login.passwordMin'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t('login.passwordsMismatch'));
      return;
    }
    setBusy(true);
    setError('');
    try {
      await apiJson('/auth/reset', {
        method: 'POST',
        body: JSON.stringify({ token: resetToken, new_password: newPassword }),
      });
      setResetToken('');
      setPassword('');
      switchMode('login');
      toast.success(t('login.passwordUpdated'));
    } catch (err) {
      if (!err.handled) setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const copy = COPY[mode];
  const passwordField = (
    <div className="space-y-1.5">
      <label htmlFor="password" className="block text-xs font-bold uppercase tracking-widest text-secondary">
        {t('login.password')}
      </label>
      <input
        id="password"
        type="password"
        autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
        value={password}
        onChange={(event) => {
          setPassword(event.target.value);
          setError('');
        }}
        placeholder={mode === 'signup' ? t('login.useMinHint') : t('login.password')}
        className={inputClass}
      />
      {mode === 'signup' && <p className="text-xs text-secondary">{t('login.useMinHint')}</p>}
      {mode === 'login' && (
        <button
          type="button"
          onClick={() => switchMode('forgot')}
          className="text-xs font-semibold text-primary transition-colors hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        >
          {t('login.forgot')}
        </button>
      )}
    </div>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-app-bg px-4 py-10">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-panel-bg p-8">
        <p className="font-display text-lg font-bold tracking-tight">
          Sceneviz <span className="text-primary">Dashboard</span>
        </p>
        <h1 className="mt-4 font-display text-2xl font-bold tracking-tight">{t(copy.title)}</h1>
        <p className="mt-1 text-sm text-secondary">{t(copy.sub)}</p>

        {showTabs && (
          <div role="tablist" aria-label="Authentication mode" className="mt-6 grid grid-cols-2 rounded-lg border border-white/10 bg-white/5 p-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={mode === tab.id}
                onClick={() => switchMode(tab.id)}
                className={`rounded-md px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
                  mode === tab.id ? 'bg-primary text-black' : 'text-secondary hover:text-white'
                }`}
              >
                {t(tab.labelKey)}
              </button>
            ))}
          </div>
        )}
        {!showTabs && (
          <button
            type="button"
            onClick={() => switchMode('login')}
            className="mt-4 text-xs font-semibold text-secondary transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            {t('login.backToLogin')}
          </button>
        )}

        {mode === 'forgot' && (
          <form onSubmit={submitForgot} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-widest text-secondary">
                {t('login.email')}
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError('');
                }}
                placeholder="you@example.com"
                className={inputClass}
              />
            </div>
            {error && (
              <p role="alert" className="text-sm text-red-400">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-md bg-primary py-2.5 text-sm font-semibold text-black transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? t('login.pleaseWait') : t('login.sendResetLink')}
            </button>
          </form>
        )}

        {mode === 'reset' && (
          <form onSubmit={submitReset} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="new-password" className="block text-xs font-bold uppercase tracking-widest text-secondary">
                {t('login.newPassword')}
              </label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => {
                  setNewPassword(event.target.value);
                  setError('');
                }}
                placeholder={t('login.useMinHint')}
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="confirm-password" className="block text-xs font-bold uppercase tracking-widest text-secondary">
                {t('login.confirmPassword')}
              </label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  setError('');
                }}
                className={inputClass}
              />
            </div>
            {error && (
              <p role="alert" className="text-sm text-red-400">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-md bg-primary py-2.5 text-sm font-semibold text-black transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? t('login.pleaseWait') : t('login.resetSubmit')}
            </button>
          </form>
        )}

        {(mode === 'login' || mode === 'signup') && (
          <form onSubmit={submitAuth} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-widest text-secondary">
                {t('login.email')}
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError('');
                }}
                placeholder="you@example.com"
                className={inputClass}
              />
            </div>
            {passwordField}

            {error && (
              <p role="alert" className="text-sm text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-md bg-primary py-2.5 text-sm font-semibold text-black transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? t('login.pleaseWait') : mode === 'login' ? t('login.tabLogin') : t('login.signupSubmit')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
