import type { Metadata } from 'next';
import Link from 'next/link';
import { goals, categories } from '@/lib/goals';

export const metadata: Metadata = { title: 'Search' };

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? '').trim();
  const nq = normalize(query);

  const hits = nq
    ? goals
        .map((g) => {
          const hay = normalize(`${g.name} ${g.category} ${g.slug} ${g.uid}`);
          const name = normalize(g.name);
          let score = 0;
          if (name === nq) score += 100;
          if (name.startsWith(nq)) score += 60;
          if (name.includes(nq)) score += 40;
          if (hay.includes(nq)) score += 20;
          for (const word of nq.split(' ')) {
            if (word.length > 2 && hay.includes(word)) score += 8;
            if (word.length > 2 && name.startsWith(word)) score += 12;
          }
          return { goal: g, score };
        })
        .filter((h) => h.score > 0)
        .sort((a, b) => b.score - a.score)
    : [];

  return (
    <section className="mx-auto w-full max-w-5xl px-4 pt-10 sm:px-6 sm:pt-14">
      <p className="text-[11px] font-semibold tracking-[0.2em] text-brand">SEARCH</p>
      <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight sm:text-4xl">
        Find your goal
      </h1>
      <p className="mt-2 text-sm text-white/50">
        Search all {goals.length} goals across {categories.length} streams — JEE, NEET, UPSC, GATE, banking, state PSCs and more.
      </p>

      <form action="/search" className="relative mt-6">
        <input
          name="q"
          defaultValue={query}
          autoFocus
          placeholder="Try “JEE”, “UPSC”, “Railway”, “NEET PG”…"
          aria-label="Search goals"
          className="w-full rounded-2xl border border-white/12 bg-black/40 py-3.5 pl-11 pr-28 text-sm text-white placeholder:text-white/30 outline-none focus:border-brand/60"
        />
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30">🔍</span>
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-white px-4 py-2 text-[12px] font-bold text-ink hover:bg-white/90"
        >
          Search
        </button>
      </form>

      {query ? (
        <p className="mt-4 text-[12px] text-white/40">
          {hits.length} {hits.length === 1 ? 'goal' : 'goals'} matching “{query}”
        </p>
      ) : (
        <div className="mt-8">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-white/35">POPULAR CATEGORIES</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {categories.map((c) => (
              <Link
                key={c}
                href={`/goals?category=${encodeURIComponent(c)}`}
                className="rounded-full border border-white/12 px-3.5 py-1.5 text-[12px] text-white/65 hover:border-white/30 hover:text-white"
              >
                {c}
              </Link>
            ))}
          </div>
        </div>
      )}

      {query && hits.length === 0 ? (
        <div className="glass mt-6 rounded-2xl px-6 py-12 text-center">
          <p className="text-sm text-white/60">No goal matched “{query}”.</p>
          <Link href="/goals" className="mt-3 inline-block text-[12px] font-semibold text-brand hover:text-accent">
            Browse all goals →
          </Link>
        </div>
      ) : null}

      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {hits.map(({ goal }) => (
          <li key={goal.uid}>
            <Link
              href={`/goals/${goal.slug}`}
              className="glass card-glow flex items-start gap-3 rounded-2xl p-4 transition hover:-translate-y-0.5"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/[0.07] text-xl ring-1 ring-white/10">
                {goal.emoji}
              </span>
              <span className="min-w-0">
                <span className="block text-[10px] font-semibold tracking-[0.14em] text-brand">{goal.category}</span>
                <span className="mt-1 block text-sm font-semibold leading-snug text-white/90">{goal.name}</span>
                <span className="mt-1 block font-mono text-[10px] text-white/30">{goal.uid}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {query && hits.length > 0 ? (
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-[12px] text-white/45">
            Looking for a specific educator or batch? Open a goal, pick an educator, then use the lecture search inside
            their batch.
          </p>
        </div>
      ) : null}
    </section>
  );
}
