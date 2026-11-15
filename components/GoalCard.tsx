'use client';

import Link from 'next/link';
import { Goal } from '@/lib/goals';
import { useSavedCourses } from './SavedCourses';

export function GoalCard({ goal, index = 0 }: { goal: Goal; index?: number }) {
  const { isSaved, toggle } = useSavedCourses();
  const saved = isSaved(goal.slug);

  return (
    <div
      className="card-glow fade-up group relative rounded-2xl p-[1px]"
      style={{ animationDelay: `${Math.min(index, 12) * 30}ms` }}
    >
      <div className="glass relative flex h-full flex-col rounded-2xl p-4 transition-transform duration-300 group-hover:-translate-y-1">
        <div className="flex items-start justify-between">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/[0.07] text-xl ring-1 ring-white/10">
            {goal.emoji}
          </span>
          <button
            type="button"
            onClick={() => toggle(goal.slug)}
            aria-label={saved ? `Remove ${goal.name} from my courses` : `Save ${goal.name} to my courses`}
            aria-pressed={saved}
            className={`grid h-8 w-8 place-items-center rounded-full border transition ${
              saved
                ? 'border-brand/60 bg-brand/20 text-brand'
                : 'border-white/10 text-white/30 hover:border-white/30 hover:text-white/70'
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <Link href={`/goals/${goal.slug}`} className="mt-3 block">
          <h3 className="font-display text-[15px] font-semibold leading-snug text-white group-hover:text-white">
            {goal.name}
          </h3>
          <p className="mt-2 text-[9.5px] font-semibold tracking-[0.16em] text-white/35">{goal.category}</p>
        </Link>

        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-4 text-[11px] text-white/45">
          <span className="flex items-center gap-1">
            <Dot /> Lectures
          </span>
          <span className="flex items-center gap-1">
            <Dot /> PDFs
          </span>
          <span className="flex items-center gap-1">
            <Dot /> Educators
          </span>
        </div>
      </div>
    </div>
  );
}

function Dot() {
  return <span className="h-1 w-1 rounded-full bg-brand/70" />;
}
