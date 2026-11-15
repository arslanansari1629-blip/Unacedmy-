'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSavedCourses } from './SavedCourses';

const links = [
  { href: '/', label: 'Home' },
  { href: '/goals', label: 'Goals' },
  { href: '/search', label: 'Search' },
  { href: '/my-courses', label: 'My Courses' },
  { href: '/source', label: 'Live Source' },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { saved } = useSavedCourses();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled ? 'bg-ink/80 backdrop-blur-xl border-b border-white/10' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-brand to-accent shadow-lg shadow-brand/30">
            <Image src="/icons/logo.svg" alt="Study Bison logo" width={22} height={22} priority />
          </span>
          <span className="leading-none">
            <span className="block font-display text-[15px] font-extrabold tracking-tight">STUDY BISON</span>
            <span className="mt-1 block text-[9px] font-medium tracking-[0.22em] text-white/40">
              STUDY SMARTER · RISE HIGHER
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => {
            const active = l.href === '/' ? pathname === '/' : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  active ? 'text-white' : 'text-white/60 hover:text-white'
                }`}
              >
                {active && <span className="absolute inset-0 rounded-full bg-white/10" />}
                <span className="relative flex items-center gap-1.5">
                  {l.label}
                  {l.href === '/my-courses' && saved.length > 0 && (
                    <span className="grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
                      {saved.length}
                    </span>
                  )}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="https://t.me/studyvaultpro"
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white/80 transition hover:border-white/30 hover:text-white sm:block"
          >
            Telegram
          </a>
          <Link
            href="/my-courses"
            className="btn-primary hidden rounded-full px-4 py-2 text-sm font-semibold text-white md:block"
          >
            My Courses
          </Link>
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/15 md:hidden"
          >
            <span className="relative block h-3.5 w-4">
              <span
                className={`absolute left-0 h-[2px] w-4 rounded bg-white transition-all ${
                  open ? 'top-1.5 rotate-45' : 'top-0'
                }`}
              />
              <span
                className={`absolute left-0 top-1.5 h-[2px] w-4 rounded bg-white transition-opacity ${
                  open ? 'opacity-0' : 'opacity-100'
                }`}
              />
              <span
                className={`absolute left-0 h-[2px] w-4 rounded bg-white transition-all ${
                  open ? 'top-1.5 -rotate-45' : 'top-3'
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-ink/95 backdrop-blur-xl md:hidden">
          <div className="mx-auto max-w-6xl space-y-1 px-4 py-3">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="block rounded-xl px-3 py-3 text-sm font-medium text-white/80 hover:bg-white/5 hover:text-white"
              >
                {l.label}
              </Link>
            ))}
            <a
              href="https://t.me/studyvaultpro"
              target="_blank"
              rel="noreferrer"
              className="block rounded-xl px-3 py-3 text-sm font-medium text-white/80 hover:bg-white/5 hover:text-white"
            >
              Telegram
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
