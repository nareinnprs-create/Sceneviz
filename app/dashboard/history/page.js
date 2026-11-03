'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { apiJson, useSessionToken } from '@/components/dashboard/session';
import { SkeletonLine, StatusBadge, btnGhost, btnPrimary, cardClass, timeAgo } from '@/components/dashboard/ui';

const PAGE_SIZE = 20;

export default function DashboardHistoryPage() {
  const token = useSessionToken();
  const [items, setItems] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  const fetchPage = useCallback(async (cursor) => {
    const params = new URLSearchParams({ limit: String(PAGE_SIZE) });
    if (cursor) params.set('cursor', cursor);
    return apiJson(`/history?${params.toString()}`);
  }, []);

  useEffect(() => {
    if (!token) return;
    fetchPage(null)
      .then((data) => {
        setItems(data.items || []);
        setNextCursor(data.next_cursor || null);
      })
      .catch((err) => {
        if (!err.handled) setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [token, fetchPage]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const data = await fetchPage(nextCursor);
      setItems((prev) => [...prev, ...(data.items || [])]);
      setNextCursor(data.next_cursor || null);
    } catch (err) {
      if (!err.handled) toast.error(err.message);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight">History</h1>
        <p className="mt-1 text-sm text-secondary">Your recent generations, newest first.</p>
      </header>

      {loading ? (
        <div className="space-y-3" aria-label="Loading history">
          <SkeletonLine className="h-24 w-full" />
          <SkeletonLine className="h-24 w-full" />
          <SkeletonLine className="h-24 w-full" />
        </div>
      ) : error ? (
        <div role="alert" className={`${cardClass} p-6 text-sm text-red-400`}>
          {error}
        </div>
      ) : items.length === 0 ? (
        <div className={`${cardClass} p-10 text-center`}>
          <p className="text-sm text-secondary">No generations yet &mdash; head to the studio.</p>
          <Link href="/studio" className={`${btnPrimary} mt-4 inline-block`}>
            Open Studio
          </Link>
        </div>
      ) : (
        <>
          <section aria-label="Generations" className="space-y-3">
            {items.map((item) => {
              const thumb = item.output_urls?.[0];
              const showThumb = thumb && (thumb.startsWith('data:') || thumb.startsWith('https'));
              return (
                <article
                  key={item.id}
                  className={`${cardClass} flex items-center gap-4 p-4`}
                >
                  {showThumb ? (
                    <img
                      src={thumb}
                      alt={`${item.model || 'Generation'} output`}
                      loading="lazy"
                      className="h-16 w-16 flex-shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div
                      aria-hidden="true"
                      className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-white/5 text-secondary"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="M21 15l-5-5L5 21" />
                      </svg>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium">{item.model || 'Unknown model'}</p>
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="mt-1 text-xs text-secondary" title={item.created_at || ''}>
                      {timeAgo(item.created_at)} &middot; {item.cost_credits} credits
                    </p>
                  </div>
                </article>
              );
            })}
          </section>

          {nextCursor && (
            <div className="text-center">
              <button type="button" onClick={loadMore} disabled={loadingMore} className={btnGhost}>
                {loadingMore ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
