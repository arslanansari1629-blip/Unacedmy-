import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchCourses, fetchLectures, Lecture } from '@/lib/api';
import { getGoal } from '@/lib/goals';
import { LectureList } from '@/components/LectureList';
import { LiveBadge } from '@/components/LiveBadge';

export const revalidate = 600;

type Params = { username: string; uid: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { uid } = await params;
  return { title: `Batch ${uid}` };
}

export default async function BatchPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<{ goal?: string }>;
}) {
  const { username, uid } = await params;
  const { goal } = await searchParams;

  const [courses, lectures] = await Promise.all([fetchCourses(username), fetchLectures(uid)]);
  const course = courses?.results.find((c) => c.uid === uid);
  const goalRecord = getGoal(goal ?? '');

  const items: Lecture[] = lectures?.results ?? [];
  const withVideo = items.filter((l) => l.value?.live_class?.video_url).length;
  const withSlides = items.filter((l) => l.value?.live_class?.slides_pdf?.with_annotation).length;

  if (!course && items.length === 0) notFound();

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6 sm:pt-12">
      <nav className="flex flex-wrap items-center gap-2 text-[11px] text-white/40">
        <Link href="/goals" className="hover:text-white">Goals</Link>
        <span>/</span>
        {goalRecord ? (
          <>
            <Link href={`/goals/${goalRecord.slug}`} className="hover:text-white">{goalRecord.name}</Link>
            <span>/</span>
          </>
        ) : null}
        <Link href={`/teachers/${username}${goal ? `?goal=${goal}` : ''}`} className="hover:text-white">
          @{username}
        </Link>
        <span>/</span>
        <span className="truncate text-white/70">{course?.name ?? `Batch ${uid}`}</span>
      </nav>

      <div className="mt-6 flex flex-col gap-5 sm:flex-row">
        {course?.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.thumbnail_v1 || course.thumbnail}
            alt=""
            className="h-32 w-full rounded-2xl object-cover ring-1 ring-white/10 sm:w-56"
          />
        ) : null}
        <div className="min-w-0">
          <h1 className="font-display text-xl font-extrabold leading-snug tracking-tight sm:text-3xl">
            {course?.name ?? `Batch ${uid}`}
          </h1>
          <p className="mt-2 text-sm text-white/50">
            {items.length} lectures · {withVideo} with video · {withSlides} with notes
            {course?.language_display ? ` · ${course.language_display}` : ''}
            {course?.view_count ? ` · ${course.view_count.toLocaleString('en-IN')} views` : ''}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {(course?.topic_groups ?? []).slice(0, 6).map((t) => (
              <span key={t.uid} className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] text-white/50">
                {t.title || t.name}
              </span>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <LiveBadge label="Live from Unacademy" />
            {course?.permalink ? (
              <a
                href={course.permalink}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/15 px-3 py-1 text-[11px] font-semibold text-white/70 hover:border-white/35 hover:text-white"
              >
                Original source ↗
              </a>
            ) : null}
          </div>
        </div>
      </div>

      <h2 className="mt-10 flex items-center gap-3 font-display text-lg font-bold">
        <span className="h-px w-6 bg-gradient-to-r from-brand to-transparent" />
        Lectures
      </h2>

      <LectureList items={items} courseUid={uid} goal={goal ?? ''} teacher={username} />
    </section>
  );
}
