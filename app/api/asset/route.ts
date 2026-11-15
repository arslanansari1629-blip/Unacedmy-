import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const ALLOWED = /^https:\/\/([a-z0-9-]+\.)*uacdn\.net\//i;
const HOP = new Set(['host', 'connection', 'content-length', 'content-encoding', 'transfer-encoding']);

/** Raw whitelisted asset fetch (JS/CSS/fonts/images) used by the bootstrapped player. */
export async function GET(req: NextRequest) {
  const target = req.nextUrl.searchParams.get('url') ?? '';
  if (!ALLOWED.test(target)) return new Response('blocked', { status: 400 });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);
  try {
    const upstream = await fetch(target, {
      headers: {
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36',
        referer: 'https://unacademy.com/',
        accept: '*/*',
        'accept-encoding': 'identity',
      },
      signal: controller.signal,
      cache: 'no-store',
    });

    const headers = new Headers();
    upstream.headers.forEach((v, k) => {
      if (!HOP.has(k.toLowerCase())) headers.set(k, v);
    });
    headers.set('cache-control', 'public, max-age=3600');
    headers.delete('content-security-policy');
    headers.delete('x-frame-options');

    return new Response(upstream.body, { status: upstream.status, headers });
  } catch (err) {
    return new Response(`asset failed: ${err instanceof Error ? err.message : 'error'}`, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}
