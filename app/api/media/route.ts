import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * Range-aware passthrough for Unacademy's raw lecture media
 * (https://uamedia.uacdn.net/lesson-raw/<uid>/output.webm).
 * Streaming + 206 support so the <video> element can seek.
 */
const ALLOWED = /^https:\/\/([a-z0-9-]+\.)*uacdn\.net\//i;

const PASS_HEADERS = [
  'content-type',
  'content-length',
  'content-range',
  'accept-ranges',
  'etag',
  'last-modified',
];

export async function GET(req: NextRequest) {
  const target = req.nextUrl.searchParams.get('url') ?? '';
  if (!ALLOWED.test(target)) {
    return new Response('Blocked: url must be an *.uacdn.net media link', { status: 400 });
  }

  /**
   * A lecture recording is 150-250 MB. Never stream the whole object through one
   * function invocation: if the client sends no Range, serve a bounded first chunk
   * as 206 and let the browser continue with follow-up range requests.
   */
  const CHUNK = 4 * 1024 * 1024;
  const range = req.headers.get('range') ?? `bytes=0-${CHUNK - 1}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 280_000);

  try {
    const upstream = await fetch(target, {
      headers: {
        'user-agent': req.headers.get('user-agent') ?? 'Mozilla/5.0',
        referer: 'https://unacademy.com/',
        accept: '*/*',
        range,
      },
      redirect: 'follow',
      signal: controller.signal,
      cache: 'no-store',
    });

    if (!upstream.ok && upstream.status !== 206) {
      return new Response(`Upstream ${upstream.status}`, { status: upstream.status === 404 ? 404 : 502 });
    }

    const headers = new Headers();
    for (const h of PASS_HEADERS) {
      const v = upstream.headers.get(h);
      if (v) headers.set(h, v);
    }
    if (!headers.has('content-type')) headers.set('content-type', 'video/webm');
    if (!headers.has('accept-ranges')) headers.set('accept-ranges', 'bytes');
    headers.set('cache-control', 'public, max-age=3600');
    headers.set('x-content-type-options', 'nosniff');

    return new Response(upstream.body, { status: upstream.status, headers });
  } catch (err) {
    return new Response(err instanceof Error ? `Media error: ${err.message}` : 'Media error', { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}

export async function HEAD(req: NextRequest) {
  const res = await GET(req);
  return new Response(null, { status: res.status, headers: res.headers });
}
