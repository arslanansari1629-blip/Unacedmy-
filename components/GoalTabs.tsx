'use client';

import { useState } from 'react';
import { Lecture, Pdf, Educator } from '@/lib/content';

type Tab = 'lectures' | 'pdfs' | 'educators';

const levelTone: Record<string, string> = {
  Foundation: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/25',
  Intermediate: 'bg-sky-400/15 text-sky-300 border-sky-400/25',
  Advanced: 'bg-fuchsia-400/15 text-fuchsia-300 border-fuchsia-400/25',
  'Crash Course': 'bg-amber-400/15 text-amber-300 border-amber-400/25',
};

export function GoalTabs({
  lectures,
  pdfs,
  educators,
  goalName,
}: {
  lectures: Lecture[];
  pdfs: Pdf[];
  educators: Educator[];
  goalName: string;
}) {
  const [tab, setTab] = useState<Tab>('lectures');

  const tabs: Array<{ id: Tab; label: string; count: number }> = [
    { id: 'lectures', label: 'Lectures', count: lectures.length },
    { id: 'pdfs', label: 'PDFs & Notes', count: pdfs.length },
    { id: 'educators', label: 'Educators', count: educators.length },
  ];

  return (
    <div className="mt-10">
      <div className="no-scrollbar flex gap-2 overflow-x-auto border-b border-white/10 pb-3">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
              tab === t.id
                ? 'bg-white text-ink'
                : 'text-white/55 hover:bg-white/5 hover:text-white'
            }`}
          >
            {t.label}
            <span className={`ml-2 text-[11px] ${tab === t.id ? 'text-ink/50' : 'text-white/30'}`}>{t.count}</span>
          </button>
        ))}
      </div>

      {tab === 'lectures' && (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {lectures.map((l) => (
            <div key={l.id} className="glass card-glow group rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3">
                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${levelTone[l.level]}`}>
                  {l.level}
                </span>
                <span className="text-[11px] text-white/35">{l.lectures} videos · {l.duration}</span>
              </div>
              <h3 className="mt-3 font-display text-[15px] font-semibold leading-snug">{l.title}</h3>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-white/45">{l.educator}</p>
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-full border border-white/12 px-3 py-1.5 text-[11px] font-semibold text-white/75 transition group-hover:border-brand/50 group-hover:text-white"
                >
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                  Watch
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'pdfs' && (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {pdfs.map((p) => (
            <div key={p.id} className="glass card-glow group flex gap-4 rounded-2xl p-5">
              <div className="grid h-12 w-10 shrink-0 place-items-center rounded-lg bg-white/[0.06] text-[9px] font-bold tracking-widest text-brand ring-1 ring-white/10">
                PDF
              </div>
              <div className="min-w-0">
                <h3 className="truncate font-display text-sm font-semibold">{p.title}</h3>
                <p className="mt-1 text-[11px] text-white/40">{p.kind} · {p.pages} pages</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {p.topics.map((t) => (
                    <span key={t} className="rounded-full bg-white/[0.05] px-2 py-0.5 text-[10px] text-white/45">{t}</span>
                  ))}
                </div>
                <button
                  type="button"
                  className="mt-3 text-[11px] font-semibold text-brand transition hover:text-accent"
                >
                  Download →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'educators' && (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {educators.map((e) => (
            <div key={e.id} className="glass card-glow rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-brand to-accent text-sm font-bold text-white">
                  {e.initials}
                </span>
                <div className="min-w-0">
                  <h3 className="truncate font-display text-sm font-semibold">{e.name}</h3>
                  <p className="text-[11px] text-white/45">{e.subject}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-[11px] text-white/45">
                <span>★ {e.rating.toFixed(1)} rating</span>
                <span>{e.lectures} lectures</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-6 text-[11px] text-white/30">
        {goalName} · resources streamed from public sources · Study Bison hosts no content.
      </p>
    </div>
  );
}
