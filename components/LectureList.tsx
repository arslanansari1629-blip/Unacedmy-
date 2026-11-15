'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Lecture, mediaFromVideoUrl } from '@/lib/api';

const dur = (s?: number) => {
  if (!s) return '';
  const h = Math.floor(s / 3600);
  const m = Math.round((s % 3600) / 60);
  return h ? `${h}h ${m}m` : `${m}m`;
};

const DATE = (iso?: string) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
};

export function LectureList({
  items,
  courseUid,
  goal = '',
  teacher = '',
  playableCount = 0,
}: {
  items: Lecture[];
  courseUid?: string;
  goal?: string;
  teacher?: string;
  playableCount?: number;
}) {
  const [q, setQ] = useState('');
  const [playableOnly, setPlayableOnly] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items
      .map((l, i) => ({ lecture: l.value, index: i }))
      .filter(({ lecture }) => !term || (lecture?.title ?? '').toLowerCase().includes(term))
      .filter(({ lecture }) => !playableOnly || Boolean(mediaFromVideoUrl(lecture?.live_class?.video_url)));
  }, [items, q, playableOnly]);

  if (items.length === 0) {
    return (
      <div className="glass mt-4 rounded-2xl px-6 py-12 text-center text-sm text-white/50">
        This batch has no published lectures yet.
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="relative">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={`Search ${items.length} lectures…`}
          aria-label="Search lectures"
          className="w-full rounded-xl border border-white/10 bg-black/40 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/30 outline-none focus:border-brand/60"
        />
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30">🔍</span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setPlayableOnly((v) => !v)}
          className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition ${
            playableOnly
              ? 'border-emerald-400/50 bg-emerald-400/15 text-emerald-300'
              : 'border-white/12 text-white/55 hover:border-white/30 hover:text-white'
          }`}
        >
          {playableOnly ? '✓ ' : ''}Playable only ({playableCount})
        </button>
        <span className="text-[11px] text-white/30">
          {rows.length} of {items.length} lectures
        </span>
      </div>

      <ul className="mt-3 divide-y divide-white/[0.06] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
        {rows.map(({ lecture, index }) => {
          if (!lecture) return null;
          const lc = lecture.live_class;
          const video = lc?.video_url;
          const slides = lc?.slides_pdf;
          const isOpen = openIndex === index;
          return (
            <li key={lecture.uid} className="group">
              <div className="flex items-start gap-3 px-4 py-3 transition hover:bg-white/[0.03]">
                <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/[0.06] font-mono text-[11px] text-white/50">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-medium leading-snug text-white/90">{lecture.title}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-white/40">
                    {lc?.video_duration ? <span>⏱ {dur(lc.video_duration)}</span> : null}
                    {lc?.live_at ? <span>{DATE(lc.live_at)}</span> : null}
                    {lecture.for_plus ? <span className="text-amber-300/70">Plus</span> : null}
                    {slides?.with_annotation ? <span className="text-sky-300/70">📄 notes</span> : null}
                    {mediaFromVideoUrl(lc?.video_url) ? (
                      <span className="text-emerald-300/80">▶ playable</span>
                    ) : null}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  {slides?.with_annotation ? (
                    <a
                      href={`/api/stream?url=${encodeURIComponent(slides.with_annotation)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-white/12 px-2.5 py-1 text-[10.5px] font-semibold text-white/65 transition hover:border-sky-400/40 hover:text-sky-300"
                      title="Open class notes (PDF)"
                    >
                      Notes
                    </a>
                  ) : null}
                  {video && courseUid ? (
                    <Link
                      href={`/lectures/${courseUid}/${lecture.uid}?goal=${encodeURIComponent(goal)}&teacher=${encodeURIComponent(teacher)}`}
                      className="flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[10.5px] font-bold text-ink transition hover:bg-white/90"
                    >
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                      Play
                    </Link>
                  ) : video ? (
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      className="flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[10.5px] font-bold text-ink transition hover:bg-white/90"
                    >
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                      {isOpen ? 'Close' : 'Play'}
                    </button>
                  ) : (
                    <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10.5px] text-white/30">
                      No video
                    </span>
                  )}
                </div>
              </div>

              {isOpen && video ? (
                <div className="border-t border-white/[0.06] bg-black/50 px-3 pb-3 pt-3">
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
                    <iframe
                      src={`/api/player?url=${encodeURIComponent(video)}`}
                      title={lecture.title}
                      className="absolute inset-0 h-full w-full border-0"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-white/40">
                    {slides?.with_annotation ? (
                      <a
                        href={`/api/stream?url=${encodeURIComponent(slides.with_annotation)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-sky-300"
                      >
                        Notes with annotations ↗
                      </a>
                    ) : null}
                    {slides?.no_annotation ? (
                      <a
                        href={`/api/stream?url=${encodeURIComponent(slides.no_annotation)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-sky-300"
                      >
                        Clean slides ↗
                      </a>
                    ) : null}
                    <a
                      href={lecture.permalink ?? '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-auto hover:text-white/70"
                    >
                      Source ↗
                    </a>
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      {rows.length === 0 ? (
        <p className="mt-6 text-center text-sm text-white/45">No lectures match “{q}”.</p>
      ) : null}
    </div>
  );
}
