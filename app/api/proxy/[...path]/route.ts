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

type Ctx = { params: Promise<{ path: string[] }> };

async function handler(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  const target = new URL(`${UPSTREAM_ORIGIN}/${(path ?? []).join('/')}`);
  new URL(req.url).searchParams.forEach((value, key) => target.searchParams.set(key, value));

  const wantsHtml = (req.headers.get('accept') ?? '').includes('text/html');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const upstream = await fetch(target, {
      method: req.method,
      headers: filteredRequestHeaders(req.headers),
      body: req.method === 'GET' || req.method === 'HEAD' ? undefined : await req.arrayBuffer(),
      redirect: 'follow',
      signal: controller.signal,
      cache: 'no-store',
    });

    const out = filterResponseHeaders(upstream.headers);
    const contentType = upstream.headers.get('content-type');
    const textual =
      contentType &&
      (contentType.includes('text/html') ||
        contentType.includes('text/css') ||
        contentType.includes('javascript') ||
        contentType.includes('application/json'));

    if (textual) {
      const text = await upstream.text();
      const body = contentType.includes('application/json')
        ? text
        : rewriteBody(text, contentType, target.origin);
      out.delete('content-length');
      return new Response(body, { status: upstream.status, headers: out });
    }

    return new Response(upstream.body, { status: upstream.status, headers: out });
  } catch (err) {
    return unreachableResponse(target.toString(), err instanceof Error ? err.message : 'proxy error', wantsHtml);
  } finally {
    clearTimeout(timeout);
  }
}

export const GET = handler;
export const POST = handler;
export const HEAD = handler;
