import Link from 'next/link';
import { GoalExplorer } from '@/components/GoalExplorer';
import { goals } from '@/lib/goals';

const stats = [
  { value: '54', label: 'Goals covered' },
  { value: '430+', label: 'Lecture series' },
  { value: '600+', label: 'Notes & PDFs' },
  { value: '₹0', label: 'Forever free' },
];

export default function HomePage() {
  return (
    <>
      <section className="relative mx-auto w-full max-w-6xl px-4 pb-12 pt-10 sm:px-6 sm:pt-16">
        <div className="flex flex-col items-center text-center">
          <span className="floaty inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-3.5 py-1.5 text-[10.5px] font-semibold tracking-[0.14em] text-white/65">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
            100% FREE · LECTURES · NOTES · PDFs
          </span>

          <h1 className="mt-6 max-w-4xl font-display text-[2.1rem] font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            <span className="shine">LEARN FROM THE BEST</span>
            <br />
            <span className="text-white">WITHOUT LIMITS</span>
          </h1>

          <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/60 sm:text-base">
            Unlock video lectures, handwritten notes and slide PDFs from India&apos;s top educators — for every goal,
            completely free.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/goals"
              className="btn-primary rounded-full px-6 py-3 text-sm font-semibold text-white transition"
            >
              Explore all 54 goals
            </Link>
            <a
              href="https://t.me/studyvaultpro"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white/80 transition hover:border-white/35 hover:text-white"
            >
              Join Telegram
            </a>
          </div>

          <dl className="mt-12 grid w-full max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="glass rounded-2xl px-3 py-4">
                <dt className="font-display text-2xl font-extrabold text-white">{s.value}</dt>
                <dd className="mt-1 text-[10.5px] uppercase tracking-[0.12em] text-white/40">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <GoalExplorer />

      <section className="mx-auto mt-16 w-full max-w-6xl px-4 sm:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: '🎬', title: 'Lectures that stream free', body: 'Curated playlists from top educators across every major exam — no paywall, no signup wall.' },
            { icon: '📄', title: 'Handwritten notes & slides', body: 'Download-ready PDFs: handwritten notes, formula sheets, revision decks and previous-year papers.' },
            { icon: '👩‍🏫', title: 'Learn from real educators', body: 'Browse by educator to follow the teacher whose style clicks with you, then track your progress.' },
          ].map((f) => (
            <div key={f.title} className="glass rounded-2xl p-6">
              <span className="text-2xl">{f.icon}</span>
              <h3 className="mt-3 font-display text-base font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 w-full max-w-6xl px-4 sm:px-6">
        <div className="glass relative overflow-hidden rounded-3xl px-6 py-10 text-center sm:px-12">
          <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-brand/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-10 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />
          <h2 className="relative font-display text-2xl font-extrabold sm:text-3xl">
            {goals.length} goals. One free library.
          </h2>
          <p className="relative mx-auto mt-3 max-w-md text-sm text-white/60">
            Save goals to My Courses and pick up exactly where you left off — everything is stored on your device.
          </p>
          <Link
            href="/goals"
            className="relative mt-7 inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink transition hover:bg-white/90"
          >
            Browse the library
          </Link>
        </div>
      </section>
    </>
  );
}
