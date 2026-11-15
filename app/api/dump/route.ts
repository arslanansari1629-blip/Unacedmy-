import { NextRequest, NextResponse } from 'next/server';
import { UPSTREAM_ORIGIN } from '@/lib/upstream';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * Fetch an upstream JS chunk (host fixed) and return a window of its text so the
 * client-side data fetching logic can be read exactly. Dev-facing diagnostic.
 */
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams.get('path') ?? '/';
  const start = Math.max(0, Number(req.nextUrl.searchParams.get('start') ?? 0));
  const len = Math.min(20000, Number(req.nextUrl.searchParams.get('len') ?? 6000));

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 20_000);
  try {
    const res = await fetch(`${UPSTREAM_ORIGIN}${p.startsWith('/') ? p : `/${p}`}`, {
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; StudyBisonInspect/1.0)', 'accept-encoding': 'identity' },
      signal: controller.signal,
      cache: 'no-store',
    });
    const text = await res.text();
    return NextResponse.json({
      status: res.status,
      total: text.length,
      start,
      len,
      chunk: text.slice(start, start + len),
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'failed' }, { status: 502 });
  } finally {
    clearTimeout(t);
  }
}
