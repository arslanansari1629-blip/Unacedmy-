'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { recordRecent } from './RecentlyWatched';

type SideItem = {
  uid: string;
  title: string;
  duration: number;
  hasVideo: boolean;
  hasNotes: boolean;
  plus: boolean;
};

const KEY = 'studybison:watched:v1';

const mins = (s: number) => (s ? `${Math.round(s / 60)}m` : '');

export function LectureStage({
  title,
  videoUrl,
  slidesWith,
  slidesClean,
  permalink,
  courseUid,
  lectureUid,
  prev,
  next,
  goal,
  teacher,
  sidebar,
  currentUid,
}: {
  title: string;
  videoUrl: string | null;
  slidesWith: string | null;
  slidesClean: string | null;
  permalink: string | null;
  courseUid: string;
  lectureUid: string;
  prev: { uid: string; title: string } | null;
  next: { uid: string; title: string } | null;
  goal: string;
  teacher: string;
  sidebar: SideItem[];
  currentUid: string;
}) {
  const [tab, setTab] = useState<'video' | 'slides'>('video');
  const [slideMode, setSlideMode] = useState<'annotated' | 'clean'>('annotated');
  const [watched, setWatched] = useState<string[]>([]);
  const [filter, setFilter] = useState('');
  const stageRef = useRef<HTMLDivElement>(null);

  const activeSlides = slideMode === 'annotated' ? slidesWith : slidesClean;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setWatched(JSON.parse(raw));
    } catch {}
    recordRecent({ lectureUid, courseUid, title, goal, teacher });
  }, [lectureUid, courseUid, title, goal, teacher]);

  const toggleWatched = useCallback(() => {
    setWatched((prevW) => {
      const nextW = prevW.includes(lectureUid) ? prevW.filter((u) => u !== lectureUid) : [...prevW, lectureUid];
      try {
        localStorage.setItem(KEY, JSON.stringify(nextW));
      } catch {}
      return nextW;
    });
  }, [lectureUid]);

  const isWatched = watched.includes(lectureUid);
  const progress = sidebar.length ? Math.round((watched.filter((u) => sidebar.some((s) => s.uid === u)).length / sidebar.length) * 100) : 0;

  // Keyboard shortcuts: j/k next/prev, w mark watched, s slides
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) return;
      if (e.key === 'w') toggleWatched();
      if (e.key === 's') setTab((t) => (t === 'slides' ? 'video' : 'slides'));
      if (e.key === 'j' && next) {
        window.location.href = `/lectures/${courseUid}/${next.uid}?goal=${encodeURIComponent(goal)}&teacher=${encodeURIComponent(teacher)}`;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, toggleWatched, courseUid, goal, teacher]);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return q ? sidebar.filter((s) => s.title.toLowerCase().includes(q)) : sidebar;
  }, [sidebar, filter]);

  const href = (uid: string) =>
    `/lectures/${courseUid}/${uid}?goal=${encodeURIComponent(goal)}&teacher=${encodeURIComponent(teacher)}`;

  return (
    <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div>
        <div ref={stageRef} className="glass overflow-hidden rounded-2xl">
          <div className="flex items-center gap-1 border-b border-white/10 px-2 py-1.5">
            <button
              onClick={() => setTab('video')}
              className={`rounded-lg px-3 py-1.5 text-[12px] font-semibold transition ${
                tab === 'video' ? 'bg-white text-ink' : 'text-white/60 hover:text-white'
              }`}
            >
              ▶ Video
            </button>
            <button
              onClick={() => setTab('slides')}
              disabled={!slidesWith && !slidesClean}
              className={`rounded-lg px-3 py-1.5 text-[12px] font-semibold transition disabled:opacity-30 ${
                tab === 'slides' ? 'bg-white text-ink' : 'text-white/60 hover:text-white'
              }`}
            >
              📄 Slides
            </button>
            <div className="ml-auto flex items-center gap-2 pr-1">
              <button
                onClick={toggleWatched}
                className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition ${
                  isWatched
                    ? 'border-emerald-400/50 bg-emerald-400/15 text-emerald-300'
                    : 'border-white/15 text-white/60 hover:border-white/35 hover:text-white'
                }`}
              >
                {isWatched ? '✓ Watched' : 'Mark watched'}
              </button>
            </div>
          </div>

          {tab === 'video' ? (
            <div className="relative aspect-video w-full bg-black">
              {videoUrl ? (
                <iframe
                  key={videoUrl}
                  src={videoUrl}
                  title={title}
                  className="absolute inset-0 h-full w-full border-0"
                  allow="autoplay; fullscreen; picture-in-picture; encrypted-media; clipboard-write"
                  allowFullScreen
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center px-6 text-center">
                  <div>
                    <p className="text-3xl">🎬</p>
                    <p className="mt-2 text-sm font-semibold">No video attached to this lecture</p>
                    <p className="mt-1 text-xs text-white/45">Use the slides tab to study the class notes.</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-black/60">
              <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
                <button
                  onClick={() => setSlideMode('annotated')}
                  disabled={!slidesWith}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition disabled:opacity-30 ${
                    slideMode === 'annotated' ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white'
                  }`}
                >
                  Annotated
                </button>
                <button
                  onClick={() => setSlideMode('clean')}
                  disabled={!slidesClean}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition disabled:opacity-30 ${
                    slideMode === 'clean' ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white'
                  }`}
                >
                  Clean
                </button>
                {activeSlides ? (
                  <a
                    href={`/api/stream?url=${encodeURIComponent(activeSlides)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-auto text-[11px] font-semibold text-brand hover:text-accent"
                  >
                    Open full PDF ↗
                  </a>
                ) : null}
              </div>
              <div className="h-[68vh] w-full">
                {activeSlides ? (
                  <iframe
                    key={activeSlides}
                    src={`/api/stream?url=${encodeURIComponent(activeSlides)}`}
                    title={`${title} slides`}
                    className="h-full w-full border-0 bg-white"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-sm text-white/45">No slides for this class.</div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {prev ? (
            <Link
              href={href(prev.uid)}
              className="rounded-full border border-white/12 px-3.5 py-1.5 text-[11px] font-semibold text-white/70 hover:border-white/35 hover:text-white"
            >
              ← Previous
            </Link>
          ) : null}
          {next ? (
            <Link
              href={href(next.uid)}
              className="rounded-full border border-white/12 px-3.5 py-1.5 text-[11px] font-semibold text-white/70 hover:border-white/35 hover:text-white"
            >
              Next →
            </Link>
          ) : null}
          {permalink ? (
            <a
              href={permalink}
              target="_blank"
              rel="noreferrer"
              className="ml-auto rounded-full border border-white/12 px-3.5 py-1.5 text-[11px] font-semibold text-white/60 hover:border-white/35 hover:text-white"
            >
              Open on Unacademy ↗
            </a>
          ) : null}
        </div>

        <p className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] leading-relaxed text-white/50">
          Video is delivered by Unacademy&apos;s official player, embedded as-is. Some classes are &ldquo;Plus&rdquo;
          (paid) and will ask you to sign in with an Unacademy account — that gate is theirs and this site does not
          bypass it. Slides, notes and PDFs on this page are open to everyone.
        </p>
      </div>

      <aside className="glass h-fit rounded-2xl">
        <div className="border-b border-white/10 px-3 py-2.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-white/60">
            <span>Batch lectures</span>
            <span>{progress}%</span>
          </div>
          <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-brand to-accent" style={{ width: `${progress}%` }} />
          </div>
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter lectures…"
            className="mt-2 w-full rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 text-[11.5px] text-white placeholder:text-white/30 outline-none focus:border-brand/60"
          />
        </div>
        <ul className="max-h-[60vh] overflow-y-auto p-1.5">
          {filtered.map((s) => {
            const active = s.uid === currentUid;
            return (
              <li key={s.uid}>
                <Link
                  href={href(s.uid)}
                  className={`flex items-start gap-2 rounded-lg px-2 py-2 transition ${
                    active ? 'bg-white/[0.10]' : 'hover:bg-white/[0.05]'
                  }`}
                >
                  <span className="mt-0.5 text-[10px]">{watched.includes(s.uid) ? '✅' : s.hasVideo ? '▶' : '📄'}</span>
                  <span className="min-w-0 flex-1">
                    <span className={`block text-[11.5px] leading-snug ${active ? 'text-white' : 'text-white/70'}`}>
                      {s.title}
                    </span>
                    <span className="mt-0.5 flex gap-2 text-[10px] text-white/35">
                      {mins(s.duration)}
                      {s.hasNotes ? <span>📄</span> : null}
                      {s.plus ? <span className="text-amber-300/60">Plus</span> : null}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </aside>
    </div>
  );
}
