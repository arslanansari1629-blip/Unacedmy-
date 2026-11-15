import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 py-28 text-center sm:px-6">
      <p className="font-display text-6xl font-extrabold text-white/15">404</p>
      <h1 className="mt-4 font-display text-2xl font-bold">This page could not be found</h1>
      <p className="mt-3 max-w-sm text-sm text-white/55">
        The goal or page you are looking for does not exist. Try the full library instead.
      </p>
      <Link href="/goals" className="btn-primary mt-8 rounded-full px-6 py-3 text-sm font-semibold text-white">
        Browse goals
      </Link>
    </section>
  );
}
