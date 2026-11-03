'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { apiJson, useSessionToken } from '@/components/dashboard/session';
import { SkeletonLine, btnPrimary, cardClass, formatDate, inputClass } from '@/components/dashboard/ui';
import { t } from '@/components/dashboard/i18n';

const MAX_KEYS = 10;

export default function DashboardKeysPage() {
  const token = useSessionToken();
  const [keys, setKeys] = useState(null);
  const [label, setLabel] = useState('');
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  // The full secret is returned once at creation and never again — keep it in
  // memory only, and drop it the moment the user dismisses the box.
  const [newKey, setNewKey] = useState(null);
  const [copied, setCopied] = useState(false);

  const loadKeys = useCallback(async () => {
    const data = await apiJson('/me');
    setKeys(data.keys || []);
  }, []);

  useEffect(() => {
    if (!token) return;
    loadKeys().catch((err) => {
      if (!err.handled) toast.error(err.message);
      setKeys([]);
    });
  }, [token, loadKeys]);

  const createKey = async (event) => {
    event.preventDefault();
    const trimmed = label.trim();
    if (!trimmed) {
      setFormError(t('keys.giveLabel'));
      return;
    }
    setBusy(true);
    setFormError('');
    try {
      const created = await apiJson('/keys', {
        method: 'POST',
        body: JSON.stringify({ label: trimmed }),
      });
      setNewKey({ key: created.key, label: created.label || trimmed });
      setLabel('');
      setCopied(false);
      toast.success(t('keys.createdToast'));
      await loadKeys();
    } catch (err) {
      if (!err.handled) setFormError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const copyKey = async () => {
    try {
      await navigator.clipboard.writeText(newKey.key);
      setCopied(true);
    } catch {
      toast.error(t('keys.copyFailed'));
    }
  };

  const deleteKey = async (item) => {
    if (!window.confirm(t('keys.deleteConfirm', { label: item.label || item.id }))) return;
    try {
      await apiJson(`/keys/${item.id}`, { method: 'DELETE' });
      toast.success(t('keys.deletedToast'));
      await loadKeys();
    } catch (err) {
      if (!err.handled) toast.error(err.message);
    }
  };

  const atLimit = keys !== null && keys.length >= MAX_KEYS;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight">{t('keys.title')}</h1>
        <p className="mt-1 text-sm text-secondary">
          {t('keys.subtitle')} {keys ? t('keys.used', { n: keys.length }) : ''}
        </p>
      </header>

      {newKey && (
        <div
          role="alert"
          className="rounded-xl border border-[#F2AE43]/40 bg-[#F2AE43]/10 p-5"
        >
          <p className="text-sm font-semibold text-[#F2AE43]">
            {t('keys.storeNow')}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <code className="min-w-0 flex-1 break-all rounded-md bg-black/40 px-3 py-2 font-mono text-sm text-white">
              {newKey.key}
            </code>
            <button
              type="button"
              onClick={copyKey}
              className="rounded-md bg-[#F2AE43] px-4 py-2 text-sm font-semibold text-black transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2AE43]/60"
            >
              {copied ? t('keys.copied') : t('keys.copyKey')}
            </button>
          </div>
          <p className="mt-2 text-xs text-secondary">{t('keys.labelOf', { label: newKey.label })}</p>
        </div>
      )}

      <section className={`${cardClass} p-6`} aria-label={t('aria.createKey')}>
        <p className="text-xs font-bold uppercase tracking-widest text-secondary">{t('keys.createTitle')}</p>
        <form onSubmit={createKey} className="mt-3 flex flex-wrap items-start gap-3">
          <div className="min-w-0 flex-1">
            <label htmlFor="key-label" className="sr-only">
              {t('keys.keyLabel')}
            </label>
            <input
              id="key-label"
              type="text"
              value={label}
              maxLength={40}
              placeholder={t('keys.labelPlaceholder')}
              onChange={(event) => {
                setLabel(event.target.value);
                setFormError('');
              }}
              className={inputClass}
            />
          </div>
          <button type="submit" disabled={busy || atLimit} className={btnPrimary}>
            {busy ? t('keys.creating') : t('keys.createKey')}
          </button>
        </form>
        {atLimit && <p className="mt-2 text-xs text-secondary">{t('keys.limitReached')}</p>}
        {formError && (
          <p role="alert" className="mt-2 text-sm text-red-400">
            {formError}
          </p>
        )}
      </section>

      <section aria-label={t('aria.yourKeys')} className="space-y-3">
        {keys === null ? (
          <>
            <SkeletonLine className="h-20 w-full" />
            <SkeletonLine className="h-20 w-full" />
          </>
        ) : keys.length === 0 ? (
          <div className={`${cardClass} p-8 text-center text-sm text-secondary`}>
            {t('keys.empty')}
          </div>
        ) : (
          keys.map((item) => (
            <div
              key={item.id}
              className={`${cardClass} flex flex-wrap items-center gap-x-4 gap-y-2 p-4`}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{item.label || t('keys.untitled')}</p>
                <p className="mt-0.5 break-all font-mono text-xs text-secondary">{item.key_hint}</p>
                <p className="mt-0.5 text-xs text-secondary">{t('keys.createdAt', { date: formatDate(item.created_at) })}</p>
              </div>
              <button
                type="button"
                onClick={() => deleteKey(item)}
                className="rounded-md border border-red-500/30 px-3 py-1.5 text-sm text-red-400 transition-colors hover:border-red-500/60 hover:bg-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60"
              >
                {t('keys.delete')}
              </button>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
