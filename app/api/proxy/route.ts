import { NextRequest } from 'next/server';
import { UPSTREAM_ORIGIN } from '@/lib/upstream';
import {
  filterResponseHeaders,
  filteredRequestHeaders,
  rewriteBody,
  unreachableResponse,
} from '@/lib/proxy-core';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** Root passthrough: /api/proxy -> upstream "/" */
async function handler(req: NextRequest) {
  const target = new URL(UPSTREAM_ORIGIN);
  new URL(req.url).searchParams.forEach((value, key) => target.searchParams.set(key, value));
  const wantsHtml = (req.headers.get('accept') ?? '').includes('text/html');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const upstream = await fetch(target, {
      method: 'GET',
      headers: filteredRequestHeaders(req.headers),
      signal: controller.signal,
      cache: 'no-store',
    });
    const out = filterResponseHeaders(upstream.headers);
    const contentType = upstream.headers.get('content-type');
    const text = await upstream.text();
    out.delete('content-length');
    const body = contentType?.includes('text/html') || contentType?.includes('text/css')
      ? rewriteBody(text, contentType, target.origin)
      : text;
    return new Response(body, { status: upstream.status, headers: out });
  } catch (err) {
    return unreachableResponse(target.toString(), err instanceof Error ? err.message : 'proxy error', wantsHtml);
  } finally {
    clearTimeout(timeout);
  }
}

export const GET = handler;
