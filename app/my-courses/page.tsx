import type { Metadata } from 'next';
import { MyCoursesClient } from '@/components/MyCoursesClient';

export const metadata: Metadata = {
  title: 'My Courses',
  description: 'Your saved goals on Study Bison.',
};

export default function MyCoursesPage() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 pt-10 sm:px-6 sm:pt-14">
      <p className="text-[10.5px] font-semibold tracking-[0.22em] text-brand">YOUR LIBRARY</p>
      <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">My Courses</h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/55">
        Goals you bookmark are saved on this device — no account needed.
      </p>
      <MyCoursesClient />
    </section>
  );
}
