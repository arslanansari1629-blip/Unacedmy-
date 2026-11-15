import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { goals, getGoal } from '@/lib/goals';
import { fetchTeachers, teacherName } from '@/lib/api';
import { TeacherGrid } from '@/components/TeacherGrid';
import { SaveButton } from '@/components/SaveButton';
import { LiveBadge } from '@/components/LiveBadge';

export const revalidate = 600;

export function generateStaticParams() {
  return goals.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const goal = getGoal(slug);
  if (!goal) return { title: 'Goal not found' };
  return {
    title: goal.name,
    description: `Educators, batches, lectures, notes and PDFs for ${goal.name} — streamed free on Study Bison.`,
  };
}

export default async function GoalPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const { page } = await searchParams;
  const goal = getGoal(slug);
  if (!goal) notFound();

  // One upstream page per request: 9 educators each, offset-driven.
  const PER = 9;
  const pageNo = Math.max(1, Number(page ?? '1') || 1);
  const teachers = await fetchTeachers(goal.uid, (pageNo - 1) * PER);
  const total = teachers?.count ?? 0;
  const shown = teachers?.results ?? [];
  const lastPage = Math.max(1, Math.ceil(total / PER));
  const related = goals.filter((g) => g.category === goal.category && g.slug !== goal.slug).slice(0, 4);
  const names = (teachers?.results ?? []).slice(0, 3).map(teacherName);

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
                {teachers?.count
                  ? `${teachers.count} educators teaching ${goal.name}${names.length ? ` — including ${names.join(', ')}` : ''}. Open an educator to browse their batches and lectures.`
                  : `Live catalog for ${goal.name}.`}
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

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <LiveBadge label="Live data from Unacademy" />
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] text-white/50">
            goal_uid · {goal.uid}
          </span>
        </div>

        <h2 className="mt-10 flex items-center gap-3 font-display text-lg font-bold">
          <span className="h-px w-6 bg-gradient-to-r from-brand to-transparent" />
          Educators
          {teachers?.count ? <span className="text-sm font-normal text-white/40">{teachers.count}</span> : null}
        </h2>

        <TeacherGrid teachers={shown} goalSlug={goal.slug} goalName={goal.name} />

        {lastPage > 1 ? (
          <nav className="mt-8 flex items-center justify-center gap-2">
            {pageNo > 1 ? (
              <Link
                href={`/goals/${goal.slug}?page=${pageNo - 1}`}
                className="rounded-full border border-white/12 px-4 py-2 text-[12px] font-semibold text-white/70 hover:border-white/35 hover:text-white"
              >
                ← Previous
              </Link>
            ) : null}
            <span className="px-2 text-[12px] text-white/45">
              Page {pageNo} of {lastPage} · {total} educators
            </span>
            {pageNo < lastPage ? (
              <Link
                href={`/goals/${goal.slug}?page=${pageNo + 1}`}
                className="rounded-full border border-white/12 px-4 py-2 text-[12px] font-semibold text-white/70 hover:border-white/35 hover:text-white"
              >
                Next →
              </Link>
            ) : null}
          </nav>
        ) : null}
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
