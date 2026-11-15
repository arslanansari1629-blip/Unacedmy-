import Link from 'next/link';
import { Teacher, teacherAvatar, teacherName, initials } from '@/lib/api';

function followers(t: Teacher) {
  const n = Number(t.followers_count ?? t.level_info?.follower_count ?? 0);
  if (!n) return null;
  if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export function TeacherGrid({
  teachers,
  goalSlug,
  goalName,
}: {
  teachers: Teacher[];
  goalSlug: string;
  goalName: string;
}) {
  if (teachers.length === 0) {
    return (
      <div className="glass mt-4 rounded-2xl px-6 py-12 text-center">
        <p className="text-3xl">🛰️</p>
        <p className="mt-3 font-display text-sm font-semibold">No educators returned for this goal</p>
        <p className="mt-1 text-xs text-white/45">
          The upstream catalog has no published educators for {goalName} right now.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {teachers.map((t) => {
        const name = teacherName(t);
        const av = teacherAvatar(t);
        const fans = followers(t);
        return (
          <Link
            key={t.username}
            href={`/teachers/${t.username}?goal=${goalSlug}`}
            className="glass card-glow group flex flex-col gap-3 rounded-2xl p-4 transition hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3">
              {av ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={av}
                  alt={name}
                  loading="lazy"
                  className="h-12 w-12 shrink-0 rounded-full object-cover ring-1 ring-white/15"
                />
              ) : (
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand to-accent text-sm font-bold">
                  {initials(name)}
                </span>
              )}
              <div className="min-w-0">
                <h3 className="truncate font-display text-sm font-semibold group-hover:text-white">{name}</h3>
                <p className="truncate text-[11px] text-white/45">{t.topic || t.topics_display || 'Educator'}</p>
              </div>
            </div>

            <p className="line-clamp-2 text-[12px] leading-relaxed text-white/45">
              {t.bio || 'Top educator on Unacademy.'}
            </p>

            <div className="mt-auto flex items-center gap-3 text-[11px] text-white/45">
              {t.avg_rating ? <span className="text-amber-300">★ {Number(t.avg_rating).toFixed(1)}</span> : null}
              {fans ? <span>👥 {fans}</span> : null}
              <span className="ml-auto text-brand opacity-0 transition group-hover:opacity-100">Open →</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
