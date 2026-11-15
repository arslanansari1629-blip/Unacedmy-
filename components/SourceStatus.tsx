'use client';

import { useCallback, useEffect, useState } from 'react';

type Health = {
  ok: boolean;
  upstream: string;
  status: number | null;
  ms: number;
  error?: string;
  checkedAt: string;
};

export function SourceStatus() {
  const [health, setHealth] = useState<Health | null>(null);
  const [loading, setLoading] = useState(true);

  const check = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/health', { cache: 'no-store' });
      setHealth((await res.json()) as Health);
    } catch {
      setHealth(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void check();
  }, [check]);

  const live = health?.ok;

  return (
    <div className="glass mt-6 flex flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="relative flex h-2.5 w-2.5">
          {loading ? (
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-white/40" />
          ) : (
            <>
              <span
                className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-70 ${
                  live ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span
                className={`relative inline-flex h-2.5 w-2.5 rounded-full ${live ? 'bg-emerald-400' : 'bg-amber-400'}`}
              />
            </>
          )}
        </span>
        <div>
          <p className="font-display text-sm font-semibold">
            {loading ? 'Checking upstream…' : live ? 'Upstream reachable' : 'Upstream unreachable from this host'}
          </p>
          <p className="mt-0.5 text-[11px] text-white/40">
            {health
              ? `${health.upstream} · ${health.status ?? 'no response'} · ${health.ms}ms`
              : 'Cannot reach /api/health'}
          </p>
        </div>
      </div>
      <button
        onClick={() => void check()}
        className="shrink-0 rounded-full border border-white/15 px-4 py-2 text-[11px] font-semibold text-white/75 transition hover:border-white/35 hover:text-white"
      >
        {loading ? 'Checking…' : 'Re-check'}
      </button>
    </div>
  );
}
