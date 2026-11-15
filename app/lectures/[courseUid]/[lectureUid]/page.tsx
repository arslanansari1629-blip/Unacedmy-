import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchLectures, mediaFromVideoUrl, Lecture } from '@/lib/api';
import { LectureStage } from '@/components/LectureStage';
import { LiveBadge } from '@/components/LiveBadge';

export const revalidate = 600;

type Params = { courseUid: string; lectureUid: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { courseUid, lectureUid } = await params;
  const page = await fetchLectures(courseUid);
  const hit = page?.results?.find((l) => l.value?.uid === lectureUid);
  return { title: hit?.value?.title ? `${hit.value.title}` : 'Lecture' };
}

export default async function LecturePage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<{ goal?: string; teacher?: string }>;
}) {
  const { courseUid, lectureUid } = await params;
  const { goal, teacher } = await searchParams;

  const page = await fetchLectures(courseUid);
  const items = page?.results ?? [];
  const index = items.findIndex((l) => l.value?.uid === lectureUid);
  if (index === -1) notFound();

  const current = items[index];
  const lecture = current.value!;
  const lc = lecture.live_class;

  const prev = index > 0 ? items[index - 1] : null;
  const next = index < items.length - 1 ? items[index + 1] : null;

  const sidebar = items.map((l: Lecture) => ({
    uid: l.value?.uid ?? '',
    title: l.value?.title ?? '',
    duration: l.value?.live_class?.video_duration ?? 0,
    hasVideo: Boolean(mediaFromVideoUrl(l.value?.live_class?.video_url)),
    hasNotes: Boolean(l.value?.live_class?.slides_pdf?.with_annotation),
    plus: Boolean(l.value?.for_plus),
  }));

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6">
      <nav className="flex flex-wrap items-center gap-2 text-[11px] text-white/40">
        <Link href="/goals" className="hover:text-white">Goals</Link>
        <span>/</span>
        {teacher ? (
          <>
            <Link href={`/teachers/${teacher}${goal ? `?goal=${goal}` : ''}`} className="hover:text-white">
              @{teacher}
            </Link>
            <span>/</span>
          </>
        ) : null}
        <Link
          href={`/teachers/${teacher ?? ''}/batch/${courseUid}${goal ? `?goal=${goal}` : ''}`}
          className="hover:text-white"
        >
          Batch
        </Link>
        <span>/</span>
        <span className="truncate text-white/70">Lecture {index + 1}</span>
      </nav>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-xl font-extrabold leading-snug tracking-tight sm:text-2xl">
            {lecture.title}
          </h1>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-white/45">
            <span className="font-mono">#{String(index + 1).padStart(2, '0')}</span>
            {lc?.video_duration ? <span>⏱ {Math.floor(lc.video_duration / 60)} min</span> : null}
            {lc?.live_at ? (
              <span>
                {new Date(lc.live_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            ) : null}
            {mediaFromVideoUrl(lc?.video_url) ? (
              <span className="text-emerald-300/90">▶ playable</span>
            ) : null}
            {lecture.for_plus ? <span className="text-amber-300/80">Plus class</span> : null}
            {lc?.slides_pdf?.with_annotation ? <span className="text-sky-300/80">annotated notes</span> : null}
          </p>
        </div>
        <LiveBadge label="Live catalog" />
      </div>

      <LectureStage
        title={lecture.title}
        videoUrl={lc?.video_url ?? null}
        mediaUrl={mediaFromVideoUrl(lc?.video_url)}
        slidesWith={lc?.slides_pdf?.with_annotation ?? null}
        slidesClean={lc?.slides_pdf?.no_annotation ?? null}
        permalink={lecture.permalink ?? null}
        courseUid={courseUid}
        lectureUid={lecture.uid}
        prev={prev ? { uid: prev.value!.uid, title: prev.value!.title } : null}
        next={next ? { uid: next.value!.uid, title: next.value!.title } : null}
        goal={goal ?? ''}
        teacher={teacher ?? ''}
        sidebar={sidebar}
        currentUid={lecture.uid}
      />
    </section>
  );
}
