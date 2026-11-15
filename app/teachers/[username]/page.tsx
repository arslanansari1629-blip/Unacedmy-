import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchCourses, fetchTeachers, teacherAvatar, teacherName, Teacher, initials } from '@/lib/api';
import { getGoal, goals } from '@/lib/goals';
import { BatchGrid } from '@/components/BatchGrid';
import { LiveBadge } from '@/components/LiveBadge';

export const revalidate = 600;

type Params = { username: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { username } = await params;
  return { title: `@${username}` };
}

/** Find the educator record: prefer the goal the visitor came from, else scan goals. */
async function findTeacher(username: string, goalSlug?: string): Promise<Teacher | null> {
  const preferred = goalSlug ? getGoal(goalSlug) : undefined;
  const order = preferred ? [preferred, ...goals.filter((g) => g.uid !== preferred.uid)] : goals;

  for (const goal of order.slice(0, 12)) {
    const page = await fetchTeachers(goal.uid);
    const hit = page?.results.find((t) => t.username.toLowerCase() === username.toLowerCase());
    if (hit) return hit;
  }
  return null;
}

export default async function TeacherPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<{ goal?: string; page?: string; sort?: string }>;
}) {
  const { username } = await params;
  const { goal, page, sort } = await searchParams;
  const teacher = await findTeacher(username, goal);
  if (!teacher) notFound();

  const type = sort === 'recent' ? 'recent' : 'popular';
  // One upstream page per request: 12 batches each, offset-driven.
  const PER = 12;
  const pageNo = Math.max(1, Number(page ?? '1') || 1);
  const courses = await fetchCourses(teacher.username, (pageNo - 1) * PER, type);
  const shown = courses?.results ?? [];
  const total = courses?.count ?? shown.length;
  const lastPage = Math.max(1, Math.ceil(total / PER));
  const name = teacherName(teacher);
  const av = teacherAvatar(teacher);
  const goalRecord = getGoal(goal ?? '');

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6 sm:pt-12">
      <nav className="flex flex-wrap items-center gap-2 text-[11px] text-white/40">
        <Link href="/" className="hover:text-white">Home</Link>
        <span>/</span>
        {goalRecord ? (
          <>
            <Link href={`/goals/${goalRecord.slug}`} className="hover:text-white">{goalRecord.name}</Link>
            <span>/</span>
          </>
        ) : (
          <>
            <Link href="/goals" className="hover:text-white">Goals</Link>
            <span>/</span>
          </>
        )}
        <span className="text-white/70">{name}</span>
      </nav>

      <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
        {av ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={av} alt={name} className="h-24 w-24 rounded-2xl object-cover ring-1 ring-white/15" />
        ) : (
          <span className="grid h-24 w-24 place-items-center rounded-2xl bg-gradient-to-br from-brand to-accent text-2xl font-bold">
            {initials(name)}
          </span>
        )}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">{name}</h1>
            {teacher.is_verified_educator ? (
              <span className="rounded-full bg-sky-400 text-[10px] font-bold text-black px-1.5 py-0.5">✓</span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-white/50">
            {teacher.topic || teacher.topics_display || 'Educator'}
            {teacher.avg_rating ? ` · ★ ${Number(teacher.avg_rating).toFixed(2)}` : ''}
            {teacher.followers_count ? ` · ${Number(teacher.followers_count).toLocaleString('en-IN')} followers` : ''}
          </p>
          {teacher.bio ? <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/45">{teacher.bio}</p> : null}
          <div className="mt-3 flex flex-wrap gap-2">
            {teacher.permalink ? (
              <a
                href={teacher.permalink}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/15 px-3.5 py-1.5 text-[11px] font-semibold text-white/70 hover:border-white/35 hover:text-white"
              >
                Unacademy profile ↗
              </a>
            ) : null}
            <LiveBadge label="Live catalog" />
          </div>
        </div>
      </div>

      <h2 className="mt-10 flex items-center gap-3 font-display text-lg font-bold">
        <span className="h-px w-6 bg-gradient-to-r from-brand to-transparent" />
        Batches &amp; courses
        {typeof courses?.count === 'number' ? (
          <span className="text-sm font-normal text-white/40">{courses.count}</span>
        ) : null}
      </h2>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {[
          { key: 'popular', label: 'Most popular' },
          { key: 'recent', label: 'Newest' },
        ].map((t) => {
          const active = type === t.key;
          return (
            <Link
              key={t.key}
              href={`/teachers/${teacher.username}?goal=${goal ?? ''}&sort=${t.key}`}
              className={`rounded-full border px-3.5 py-1.5 text-[11px] font-semibold transition ${
                active
                  ? 'border-white/30 bg-white/10 text-white'
                  : 'border-white/10 text-white/55 hover:border-white/25 hover:text-white'
              }`}
            >
              {t.label}
            </Link>
          );
        })}
        <span className="ml-auto text-[11px] text-white/35">
          {total} batches
        </span>
      </div>

      <BatchGrid
        courses={shown}
        hrefFor={(uid) => `/teachers/${teacher.username}/batch/${uid}?goal=${goal ?? ''}`}
      />

      {lastPage > 1 ? (
        <nav className="mt-8 flex items-center justify-center gap-2">
          {pageNo > 1 ? (
            <Link
              href={`/teachers/${teacher.username}?goal=${goal ?? ''}&sort=${type}&page=${pageNo - 1}`}
              className="rounded-full border border-white/12 px-4 py-2 text-[12px] font-semibold text-white/70 hover:border-white/35 hover:text-white"
            >
              ← Previous
            </Link>
          ) : null}
          <span className="px-2 text-[12px] text-white/45">
            Page {pageNo} of {lastPage} · {total} batches
          </span>
          {pageNo < lastPage ? (
            <Link
              href={`/teachers/${teacher.username}?goal=${goal ?? ''}&sort=${type}&page=${pageNo + 1}`}
              className="rounded-full border border-white/12 px-4 py-2 text-[12px] font-semibold text-white/70 hover:border-white/35 hover:text-white"
            >
              Next →
            </Link>
          ) : null}
        </nav>
      ) : null}

      {lastPage <= 1 ? (
        <p className="mt-6 text-center text-[11px] text-white/35">
          {total} batch{total === 1 ? '' : 'es'} on this educator, sorted by{' '}
          {type === 'recent' ? 'newest' : 'popularity'}.
        </p>
      ) : null}
    </section>
  );
}
