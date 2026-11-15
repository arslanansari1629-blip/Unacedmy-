import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Generic passthrough for whitelisted Unacademy CDN hosts, used to bootstrap the
 * official player page same-origin (so its relative runtime/chunk requests resolve
 * here instead of 403-ing cross-origin).
 */
const ALLOWED = /^https:\/\/([a-z0-9-]+\.)*uacdn\.net\//i;
const HOP = new Set(['host', 'connection', 'content-length', 'content-encoding', 'transfer-encoding']);

function rewrite(html: string, baseUrl: string): string {
  try {
    const base = new URL(baseUrl);
    const dir = base.pathname.replace(/[^/]*$/, '');

    return html.replace(/(src|href)="(?!https?:|\/\/|#|data:|blob:)([^"]+)"/g, (_m, attr, rel) => {
      try {
        const clean = rel.replace(/^\.\//, '');
        const abs = new URL(clean.startsWith('/') ? clean : dir + clean, base).toString();
        return `${attr}="/api/asset?url=${encodeURIComponent(abs)}"`;
      } catch {
        return `${attr}="${rel}"`;
      }
    });
  } catch {
    return html;
  }
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const target = `https://${path.join('/')}`;
  if (!ALLOWED.test(target)) {
    return new Response('blocked', { status: 400 });
  }

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
      redirect: 'follow',
    });

    const headers = new Headers();
    upstream.headers.forEach((v, k) => {
      if (!HOP.has(k.toLowerCase())) headers.set(k, v);
    });
    headers.set('cache-control', 'public, max-age=300');
    headers.delete('content-security-policy');
    headers.delete('x-frame-options');

    const ct = upstream.headers.get('content-type') ?? '';
    if (ct.includes('text/html')) {
      const html = await upstream.text();
      headers.delete('content-length');
      return new Response(rewrite(html, target), { status: upstream.status, headers });
    }

    return new Response(upstream.body, { status: upstream.status, headers });
  } catch (err) {
    return new Response(`media proxy failed: ${err instanceof Error ? err.message : 'error'}`, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}
