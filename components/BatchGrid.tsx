import Link from 'next/link';
import { Course } from '@/lib/api';

const fmt = (n?: number) => (typeof n === 'number' ? n.toLocaleString('en-IN') : '—');

export function BatchGrid({
  courses,
  hrefFor,
}: {
  courses: Course[];
  hrefFor: (uid: string) => string;
}) {
  if (courses.length === 0) {
    return (
      <div className="glass mt-4 rounded-2xl px-6 py-12 text-center text-sm text-white/50">
        No public batches returned for this educator.
      </div>
    );
  }

  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((c) => {
        const thumb = c.thumbnail_v1 || c.thumbnail;
        const language = c.language_display;
        return (
          <Link
            key={c.uid}
            href={hrefFor(c.uid)}
            className="glass card-glow group flex flex-col overflow-hidden rounded-2xl transition hover:-translate-y-0.5"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-black/40">
              {thumb ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={thumb}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover opacity-90 transition group-hover:opacity-100 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="grid h-full place-items-center text-2xl">🎬</div>
              )}
              <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white/85">
                {fmt(c.item_count)} lectures
              </span>
              {language ? (
                <span className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                  {language}
                </span>
              ) : null}
            </div>
            <div className="flex flex-1 flex-col p-4">
              <h3 className="line-clamp-2 font-display text-[14px] font-semibold leading-snug">{c.name}</h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(c.topic_groups ?? []).slice(0, 2).map((t) => (
                  <span key={t.uid} className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] text-white/50">
                    {t.title || t.name}
                  </span>
                ))}
              </div>
              <div className="mt-auto flex items-center justify-between pt-3 text-[11px] text-white/40">
                <span>👁 {fmt(c.view_count)}</span>
                <span className="text-brand opacity-0 transition group-hover:opacity-100">Open →</span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
