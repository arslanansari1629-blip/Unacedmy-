'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export const RECENT_KEY = 'studybison:recent:v1';

export type RecentEntry = {
  lectureUid: string;
  courseUid: string;
  title: string;
  goal: string;
  teacher: string;
  at: number;
};

export function recordRecent(entry: Omit<RecentEntry, 'at'>) {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const list: RecentEntry[] = raw ? JSON.parse(raw) : [];
    const next = [{ ...entry, at: Date.now() }, ...list.filter((e) => e.lectureUid !== entry.lectureUid)].slice(0, 24);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {}
}

export function RecentlyWatched({ dense = false }: { dense?: boolean }) {
  const [items, setItems] = useState<RecentEntry[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      setItems(raw ? JSON.parse(raw) : []);
    } catch {}
    setReady(true);
  }, []);

  const clear = () => {
    try {
      localStorage.removeItem(RECENT_KEY);
    } catch {}
    setItems([]);
  };

  if (!ready || items.length === 0) return null;

  return (
    <section className={dense ? 'mt-6' : 'mx-auto mt-14 w-full max-w-6xl px-4 sm:px-6'}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-3 font-display text-lg font-bold">
          <span className="h-px w-6 bg-gradient-to-r from-brand to-transparent" />
          Continue watching
        </h2>
        <button
          onClick={clear}
          className="text-[11px] font-semibold text-white/35 hover:text-white/70"
        >
          Clear
        </button>
      </div>
      <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
        {items.map((e) => (
          <Link
            key={e.lectureUid}
            href={`/lectures/${e.courseUid}/${e.lectureUid}?goal=${encodeURIComponent(e.goal)}&teacher=${encodeURIComponent(e.teacher)}`}
            className="glass card-glow w-64 shrink-0 rounded-2xl p-3.5 transition hover:-translate-y-0.5"
          >
            <p className="text-[10px] font-semibold tracking-[0.12em] text-brand">
              {e.goal ? 'RESUME' : 'WATCHED'}
            </p>
            <p className="mt-1.5 line-clamp-2 text-[12.5px] font-medium leading-snug text-white/85">{e.title}</p>
            <p className="mt-1.5 truncate text-[10.5px] text-white/35">@{e.teacher}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
