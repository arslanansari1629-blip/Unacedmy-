import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { goals, getGoal } from '@/lib/goals';
import { buildEducators, buildLectures, buildPdfs } from '@/lib/content';
import { GoalTabs } from '@/components/GoalTabs';
import { SaveButton } from '@/components/SaveButton';

export function generateStaticParams() {
  return goals.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const goal = getGoal(slug);
  if (!goal) return { title: 'Goal not found' };
  return {
    title: goal.name,
    description: `Free ${goal.name} lectures, handwritten notes, slide PDFs and top educators on Study Bison.`,
  };
}

export default async function GoalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const goal = getGoal(slug);
  if (!goal) notFound();

  const lectures = buildLectures(goal);
  const pdfs = buildPdfs(goal);
  const educators = buildEducators(goal);
  const related = goals
    .filter((g) => g.category === goal.category && g.slug !== goal.slug)
    .slice(0, 4);

  return (
    <>
      <section className="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6 sm:pt-12">
        <nav className="flex items-center gap-2 text-[11px] text-white/40">
          <Link href="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <Link href="/goals" className="hover:text-white">Goals</Link>
          <span>/</span>
          <span className="truncate text-white/70">{goal.name}</span>
        </nav>

        <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white/[0.07] text-3xl ring-1 ring-white/10">
              {goal.emoji}
            </span>
            <div>
              <p className="text-[10px] font-semibold tracking-[0.18em] text-brand">{goal.category}</p>
              <h1 className="mt-2 font-display text-2xl font-extrabold leading-tight tracking-tight sm:text-4xl">
                {goal.name}
              </h1>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/55">
                Complete free library for {goal.name} — {lectures.length} lecture series, {pdfs.length} notes &amp; PDF
                sets and {educators.length} top educators.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <SaveButton slug={goal.slug} name={goal.name} />
            <a
              href="https://t.me/studyvaultpro"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white/80 transition hover:border-white/35 hover:text-white"
            >
              Telegram
            </a>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { v: lectures.length, l: 'Lecture series' },
            { v: pdfs.length, l: 'Notes & PDFs' },
            { v: educators.length, l: 'Educators' },
          ].map((s) => (
            <div key={s.l} className="glass rounded-2xl px-4 py-3">
              <p className="font-display text-xl font-extrabold">{s.v}</p>
              <p className="text-[10.5px] uppercase tracking-[0.12em] text-white/40">{s.l}</p>
            </div>
          ))}
        </div>

        <GoalTabs lectures={lectures} pdfs={pdfs} educators={educators} goalName={goal.name} />
      </section>

      <section className="mx-auto mt-16 w-full max-w-6xl px-4 sm:px-6">
        <h2 className="font-display text-lg font-bold">More in {goal.category}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((g) => (
            <Link
              key={g.slug}
              href={`/goals/${g.slug}`}
              className="glass card-glow flex items-center gap-3 rounded-2xl p-4 transition hover:-translate-y-0.5"
            >
              <span className="text-xl">{g.emoji}</span>
              <span className="text-sm font-medium text-white/80">{g.name}</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
