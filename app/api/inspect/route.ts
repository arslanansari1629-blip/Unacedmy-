import { NextRequest, NextResponse } from 'next/server';
import { UPSTREAM_ORIGIN } from '@/lib/upstream';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Diagnostic endpoint (same-origin only, upstream host fixed): fetches a path from
 * the upstream site and reports what it references, so the real content API can be
 * discovered instead of guessed. Never fetches arbitrary hosts.
 */
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams.get('path') ?? '/';
  const grep = req.nextUrl.searchParams.get('grep');
  const path = p.startsWith('/') ? p : `/${p}`;
  const target = `${UPSTREAM_ORIGIN}${path}`;

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 20_000);

  try {
    const res = await fetch(target, {
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; StudyBisonInspect/1.0)',
        accept: '*/*',
        'accept-encoding': 'identity',
      },
      signal: controller.signal,
      cache: 'no-store',
      redirect: 'follow',
    });
    const text = await res.text();

    if (grep) {
      const re = new RegExp(grep, 'gi');
      const matches = Array.from(new Set(text.match(re) ?? [])).slice(0, 60);
      return NextResponse.json({ target, status: res.status, size: text.length, grep, matches });
    }

    const scripts = Array.from(new Set(text.match(/src="([^"]+\.js[^"]*)"/g)?.map((s) => s.slice(5, -1)) ?? []));
    const links = Array.from(new Set(text.match(/href="([^"]+)"/g)?.map((s) => s.slice(6, -1)) ?? []));
    const apis = Array.from(
      new Set(
        [
          ...(text.match(/https?:\/\/[a-z0-9.-]*api[a-z0-9./_-]*/gi) ?? []),
          ...(text.match(/["'](\/api\/[a-z0-9./_${}-]*)["']/gi) ?? []),
          ...(text.match(/graphql[a-z0-9./_-]*/gi) ?? []),
        ],
      ),
    ).slice(0, 40);

    return NextResponse.json({
      target,
      status: res.status,
      size: text.length,
      contentType: res.headers.get('content-type'),
      scriptCount: scripts.length,
      scripts: scripts.slice(0, 40),
      links: links.slice(0, 40),
      apiHints: apis,
    });
  } catch (err) {
    return NextResponse.json(
      { target, error: err instanceof Error ? err.message : 'fetch failed' },
      { status: 502 },
    );
  } finally {
    clearTimeout(t);
  }
}
