import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="relative z-10 mt-24 border-t border-white/10 bg-black/30">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand to-accent">
                <Image src="/icons/logo.svg" alt="Study Bison logo" width={24} height={24} />
              </span>
              <div>
                <p className="font-display text-base font-extrabold tracking-tight">STUDY BISON</p>
                <p className="text-[9px] tracking-[0.22em] text-white/40">STUDY SMARTER · RISE HIGHER</p>
              </div>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/55">
              A free study companion streaming lectures, notes and PDFs from India&apos;s top educators — JEE, NEET,
              UPSC, GATE and 50+ more goals.
            </p>
          </div>

          <div>
            <p className="text-[11px] font-semibold tracking-[0.18em] text-white/40">NAVIGATE</p>
            <ul className="mt-4 space-y-2.5 text-sm text-white/65">
              <li><Link href="/goals" className="hover:text-white">Goals</Link></li>
              <li><Link href="/my-courses" className="hover:text-white">My Courses</Link></li>
              <li><Link href="/source" className="hover:text-white">Live Source</Link></li>
              <li>
                <a href="/api/proxy/" className="hover:text-white">
                  Mirrored site
                </a>
              </li>
              <li>
                <a href="https://t.me/studyvaultpro" target="_blank" rel="noreferrer" className="hover:text-white">
                  Telegram
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-semibold tracking-[0.18em] text-white/40">GOALS</p>
            <ul className="mt-4 space-y-2.5 text-sm text-white/65">
              <li><Link href="/goals/jee-main-and-advanced" className="hover:text-white">JEE Main &amp; Advanced</Link></li>
              <li><Link href="/goals/neet-ug" className="hover:text-white">NEET UG</Link></li>
              <li><Link href="/goals/upsc-civil-services-ias" className="hover:text-white">UPSC (IAS)</Link></li>
              <li><Link href="/goals/gate" className="hover:text-white">GATE</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} STUDY BISON · UNOFFICIAL STUDY PLATFORM</p>
          <p className="max-w-lg leading-relaxed">
            Lectures &amp; PDFs are streamed from publicly available Unacademy APIs. Study Bison hosts no content and is
            not affiliated with Unacademy.
          </p>
        </div>
      </div>
    </footer>
  );
}
