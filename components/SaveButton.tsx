'use client';

import { useSavedCourses } from './SavedCourses';

export function SaveButton({ slug, name }: { slug: string; name: string }) {
  const { isSaved, toggle } = useSavedCourses();
  const saved = isSaved(slug);
  return (
    <button
      type="button"
      onClick={() => toggle(slug)}
      aria-pressed={saved}
      className={`flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${
        saved
          ? 'border border-brand/60 bg-brand/15 text-white'
          : 'btn-primary text-white'
      }`}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" strokeLinejoin="round" />
      </svg>
      {saved ? 'Saved to My Courses' : `Save ${name.split(' ')[0]}`}
    </button>
  );
}
