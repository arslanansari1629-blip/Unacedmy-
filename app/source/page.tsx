import type { Metadata } from 'next';
import Link from 'next/link';
import { UPSTREAM_ORIGIN } from '@/lib/upstream';
import { SourceStatus } from '@/components/SourceStatus';

export const metadata: Metadata = {
  title: 'Live source',
  description: 'Reverse-proxy status for the upstream study source.',
};

export default function SourcePage() {
  return (
    <section className="mx-auto w-full max-w-4xl px-4 pt-10 sm:px-6 sm:pt-14">
      <p className="text-[10.5px] font-semibold tracking-[0.22em] text-brand">PROXY LAYER</p>
      <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Live source</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/55">
        The source site's own paths are reverse-proxied live to{' '}
        <span className="text-white/80">{UPSTREAM_ORIGIN}</span> — nothing is snapshotted. Assets, fonts and API
        calls referenced by the original are rewritten through the same proxy, so the mirror stays in sync.
      </p>

      <SourceStatus />

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <div className="glass rounded-2xl p-5">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-white/40">REVERSE PROXY</p>
          <p className="mt-2 font-mono text-xs text-accent">GET /api/proxy/&lt;path&gt;</p>
          <p className="mt-3 text-sm leading-relaxed text-white/55">
            Full passthrough: query strings, headers and bodies are forwarded; HTML, CSS and JS are rewritten so
            absolute upstream links and root-relative asset paths resolve through this domain.
          </p>
          <a
            href="/api/proxy/"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex text-[11px] font-semibold text-brand hover:text-accent"
          >
            Open proxied homepage →
          </a>
        </div>
        <div className="glass rounded-2xl p-5">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-white/40">FALLBACK ROUTING</p>
          <p className="mt-2 font-mono text-xs text-accent">middleware.ts</p>
          <p className="mt-3 text-sm leading-relaxed text-white/55">
            The source's paths (<code className="rounded bg-white/10 px-1.5 py-0.5 text-[11px]">/about</code>,{' '}
            <code className="rounded bg-white/10 px-1.5 py-0.5 text-[11px]">/lectures</code>,{' '}
            <code className="rounded bg-white/10 px-1.5 py-0.5 text-[11px]">/course/*</code>,{' '}
            <code className="rounded bg-white/10 px-1.5 py-0.5 text-[11px]">/library/*</code>) are rewritten to the
            proxy instead of 404-ing, and anything the upstream itself answers with 404 mirrors that 404. Curated
            pages keep their own routes and never pay a proxy call.
          </p>
          <Link href="/goals" className="mt-4 inline-flex text-[11px] font-semibold text-brand hover:text-accent">
            Browse curated goals →
          </Link>
        </div>
      </div>

      <div className="glass mt-3 rounded-2xl p-5">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-white/40">HEALTH CHECK</p>
        <p className="mt-2 font-mono text-xs text-accent">GET /api/health</p>
        <p className="mt-3 text-sm leading-relaxed text-white/55">
          Returns JSON with upstream reachability, HTTP status and latency. Point{' '}
          <code className="rounded bg-white/10 px-1.5 py-0.5 text-[11px]">UPSTREAM_ORIGIN</code> at another mirror in
          your Vercel environment to switch sources without a redeploy.
        </p>
      </div>
    </section>
  );
}
