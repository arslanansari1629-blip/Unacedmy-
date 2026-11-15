import { NextRequest, NextResponse } from 'next/server';
import { UPSTREAM_ORIGIN } from '@/lib/upstream';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

const UA = 'Mozilla/5.0 (compatible; StudyBisonInspect/1.0)';

async function get(path: string) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 15_000);
  try {
    const res = await fetch(`${UPSTREAM_ORIGIN}${path}`, {
      headers: { 'user-agent': UA, accept: '*/*', 'accept-encoding': 'identity' },
      signal: controller.signal,
      cache: 'no-store',
    });
    const text = await res.text();
    return { path, status: res.status, text };
  } catch (err) {
    return { path, status: 0, text: '', error: err instanceof Error ? err.message : 'failed' };
  } finally {
    clearTimeout(t);
  }
}

/**
 * Diagnostics for the upstream site (host fixed, same-origin only).
 *  ?path=/            -> list script/link/API hints for one page
 *  ?scan=1&grep=...   -> fetch the homepage, then every JS chunk, and grep them all
 */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const grepSource = params.get('grep');

  if (params.get('scan')) {
    const home = await get(params.get('path') || '/');
    const scripts = Array.from(
      new Set(home.text.match(/\/_next\/static\/[^"']+\.js/g) ?? []),
    ).slice(0, 20);

    const re = grepSource ? new RegExp(grepSource, 'gi') : null;
    const buckets: Array<{ script: string; status: number; size: number; matches: string[] }> = [];

    await Promise.all(
      scripts.map(async (script) => {
        const res = await get(script);
        const matches = re ? Array.from(new Set(res.text.match(re) ?? [])).slice(0, 40) : [];
        buckets.push({ script, status: res.status, size: res.text.length, matches });
      }),
    );

    return NextResponse.json({
      homepageStatus: home.status,
      homepageSize: home.text.length,
      scriptsScanned: buckets.length,
      grep: grepSource,
      results: buckets
        .sort((a, b) => b.matches.length - a.matches.length)
        .map((b) => ({ script: b.script, status: b.status, size: b.size, matchCount: b.matches.length, matches: b.matches })),
    });
  }

  const p = params.get('path') ?? '/';
  const path = p.startsWith('/') ? p : `/${p}`;
  const res = await get(path);
  if (res.error) return NextResponse.json({ target: `${UPSTREAM_ORIGIN}${path}`, error: res.error }, { status: 502 });

  if (grepSource) {
    const re = new RegExp(grepSource, 'gi');
    if (params.get('context')) {
      const win = Number(params.get('context')) || 220;
      const snippets: string[] = [];
      for (let m = re.exec(res.text); m && snippets.length < 25; m = re.exec(res.text)) {
        const start = Math.max(0, m.index - win);
        snippets.push(res.text.slice(start, Math.min(res.text.length, m.index + m[0].length + win)).replace(/\s+/g, ' '));
        if (m.index === re.lastIndex) re.lastIndex++;
      }
      return NextResponse.json({
        target: `${UPSTREAM_ORIGIN}${path}`,
        status: res.status,
        size: res.text.length,
        grep: grepSource,
        snippets,
      });
    }
    return NextResponse.json({
      target: `${UPSTREAM_ORIGIN}${path}`,
      status: res.status,
      size: res.text.length,
      matches: Array.from(new Set(res.text.match(re) ?? [])).slice(0, 60),
    });
  }

  const scripts = Array.from(new Set(res.text.match(/\/_next\/static\/[^"']+\.js/g) ?? []));
  const links = Array.from(new Set(res.text.match(/href="([^"]+)"/g)?.map((s) => s.slice(6, -1)) ?? []));
  const apiHints = Array.from(
    new Set([
      ...(res.text.match(/https?:\/\/[a-z0-9.-]*api[a-z0-9./_-]*/gi) ?? []),
      ...(res.text.match(/["'](\/api\/[a-z0-9./_-]*)["']/gi) ?? []),
      ...(res.text.match(/graphql[a-z0-9./_-]*/gi) ?? []),
    ]),
  ).slice(0, 40);

  return NextResponse.json({
    target: `${UPSTREAM_ORIGIN}${path}`,
    status: res.status,
    size: res.text.length,
    scriptCount: scripts.length,
    scripts,
    links: links.slice(0, 40),
    apiHints,
  });
}
