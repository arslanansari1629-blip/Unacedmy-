import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * PDF passthrough with Range support so notes/slides render in the browser's
 * built-in viewer instead of downloading. Restricted to Unacademy CDN hosts.
 */
const ALLOWED = /^https:\/\/[a-z0-9.-]*uacdn\.net\//i;

export async function GET(req: NextRequest) {
  const target = req.nextUrl.searchParams.get('url') ?? '';
  if (!ALLOWED.test(target)) {
    return new Response('Blocked: url must be an *.uacdn.net link', { status: 400 });
  }

  const range = req.headers.get('range');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);

  try {
    const upstream = await fetch(target, {
      headers: range ? { range, 'user-agent': 'Mozilla/5.0' } : { 'user-agent': 'Mozilla/5.0' },
      signal: controller.signal,
      cache: 'no-store',
    });

    const headers = new Headers();
    for (const key of ['content-type', 'content-length', 'content-range', 'accept-ranges', 'last-modified', 'etag']) {
      const v = upstream.headers.get(key);
      if (v) headers.set(key, v);
    }
    if (!headers.has('content-type')) headers.set('content-type', 'application/pdf');
    headers.set('content-disposition', 'inline');
    headers.set('cache-control', 'public, max-age=3600');

    return new Response(upstream.body, { status: upstream.status, headers });
  } catch (err) {
    return new Response(`stream failed: ${err instanceof Error ? err.message : 'error'}`, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}
