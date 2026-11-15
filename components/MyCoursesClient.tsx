'use client';

import Link from 'next/link';
import { goals } from '@/lib/goals';
import { GoalCard } from './GoalCard';
import { useSavedCourses } from './SavedCourses';

export function MyCoursesClient() {
  const { saved, ready, clear } = useSavedCourses();
  const items = goals.filter((g) => saved.includes(g.slug));

  if (!ready) {
    return (
      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-2xl bg-white/[0.04]" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="glass mt-10 rounded-3xl px-6 py-16 text-center">
        <p className="text-4xl">🔖</p>
        <h2 className="mt-4 font-display text-lg font-bold">No saved goals yet</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-white/55">
          Tap the bookmark on any goal card and it will appear here instantly.
        </p>
        <Link
          href="/goals"
          className="btn-primary mt-7 inline-flex rounded-full px-6 py-3 text-sm font-semibold text-white"
        >
          Browse goals
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mt-8 flex items-center justify-between">
        <p className="text-xs text-white/40">
          <span className="text-white/80">{items.length}</span> saved goal{items.length === 1 ? '' : 's'}
        </p>
        <button
          onClick={clear}
          className="rounded-full border border-white/12 px-3.5 py-1.5 text-[11px] font-medium text-white/60 hover:border-red-400/40 hover:text-red-300"
        >
          Clear all
        </button>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((g, i) => (
          <GoalCard key={g.slug} goal={g} index={i} />
        ))}
      </div>
    </>
  );
}
