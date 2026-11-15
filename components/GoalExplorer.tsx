'use client';

import { useMemo, useState } from 'react';
import { categories, goals, quickPicks, slugify } from '@/lib/goals';
import { GoalCard } from './GoalCard';

export function GoalExplorer() {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<string>('All');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return goals.filter((g) => {
      const matchQuery =
        !q ||
        g.name.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q) ||
        slugify(g.name).includes(q);
      const matchCat = active === 'All' || g.category === active;
      return matchQuery && matchCat;
    });
  }, [query, active]);

  const jump = (label: string) => {
    const found = goals.find(
      (g) => g.name.toLowerCase().startsWith(label.toLowerCase()) || slugify(g.name).startsWith(slugify(label)),
    );
    if (found) setQuery(found.name);
    else setQuery(label);
  };

  return (
    <section id="goals" className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <div className="glass rounded-3xl p-5 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.2em] text-white/40">SELECT YOUR GOAL</p>
            <h2 className="mt-1.5 font-display text-xl font-bold sm:text-2xl">Pick a goal, start learning</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickPicks.map((q) => (
              <button
                key={q}
                onClick={() => jump(q)}
                className="chip rounded-full border border-white/12 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-white/70 hover:border-brand/50 hover:text-white"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <div className="relative mt-5">
          <svg
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.6-3.6" strokeLinecap="round" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search 54 goals — JEE, UPSC, GATE, TET…"
            aria-label="Search goals"
            className="w-full rounded-xl border border-white/10 bg-black/40 py-3 pl-11 pr-10 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-brand/60 focus:ring-2 focus:ring-brand/20"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-white/40 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        <div className="no-scrollbar -mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1">
          {['All', ...categories].map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[11px] font-semibold tracking-wide transition ${
                active === c
                  ? 'border-transparent bg-gradient-to-r from-brand to-accent text-white'
                  : 'border-white/10 bg-white/[0.03] text-white/55 hover:border-white/25 hover:text-white'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <p className="mt-4 text-xs text-white/35">
          Showing <span className="text-white/70">{filtered.length}</span> of {goals.length} goals
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((g, i) => (
            <GoalCard key={g.slug} goal={g} index={i} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-14 text-center">
            <p className="text-3xl">🔍</p>
            <p className="mt-3 font-display text-base font-semibold">No goals match “{query}”</p>
            <button
              onClick={() => {
                setQuery('');
                setActive('All');
              }}
              className="mt-4 rounded-full border border-white/15 px-4 py-2 text-xs font-medium text-white/70 hover:border-white/35 hover:text-white"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
