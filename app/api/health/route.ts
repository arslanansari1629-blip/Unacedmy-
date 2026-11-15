import { NextResponse } from 'next/server';
import { UPSTREAM_ORIGIN } from '@/lib/upstream';

export const dynamic = 'force-dynamic';

export async function GET() {
  const started = Date.now();
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(UPSTREAM_ORIGIN, {
      method: 'GET',
      signal: controller.signal,
      cache: 'no-store',
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; StudyBisonProxy/1.0)', accept: 'text/html' },
    });
    clearTimeout(t);
    return NextResponse.json({
      ok: res.ok,
      upstream: UPSTREAM_ORIGIN,
      status: res.status,
      ms: Date.now() - started,
      checkedAt: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      upstream: UPSTREAM_ORIGIN,
      status: null,
      ms: Date.now() - started,
      error: err instanceof Error ? err.message : 'unreachable',
      checkedAt: new Date().toISOString(),
    });
  }
}
