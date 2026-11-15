import type { Metadata } from 'next';
import { GoalExplorer } from '@/components/GoalExplorer';
import { goals } from '@/lib/goals';

export const metadata: Metadata = {
  title: 'All Goals',
  description: 'Browse all 54 study goals — JEE, NEET, UPSC, GATE, SSC, state PSCs, TET and more.',
};

export default function GoalsPage() {
  return (
    <>
      <section className="mx-auto w-full max-w-6xl px-4 pb-8 pt-10 sm:px-6 sm:pt-14">
        <p className="text-[10.5px] font-semibold tracking-[0.22em] text-brand">FULL LIBRARY</p>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          Every goal, every educator
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/55">
          {goals.length} goals across seven categories. Open any goal to see the real educators teaching it, their
          batches, every lecture, plus the notes and slides attached to each class.
        </p>
      </section>
      <GoalExplorer />
    </>
  );
}
