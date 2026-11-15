import { NextRequest, NextResponse } from 'next/server';
import { UPSTREAM_ORIGIN } from '@/lib/upstream';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * Dev diagnostic over the fixed upstream host.
 *  ?path=/_next/...js&find=<plain substring>[&pad=200]
 *      -> every offset of the substring plus surrounding text (plain search,
 *         no regex escaping needed)
 *  ?path=...&start=&len=   -> raw window of the file
 */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const p = q.get('path') ?? '/';
  const find = q.get('find');
  const pad = Math.min(1500, Number(q.get('pad') ?? 220));

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 20_000);
  try {
    const res = await fetch(`${UPSTREAM_ORIGIN}${p.startsWith('/') ? p : `/${p}`}`, {
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; StudyBisonInspect/1.0)', 'accept-encoding': 'identity' },
      signal: controller.signal,
      cache: 'no-store',
    });
    const text = await res.text();

    if (find) {
      const offsets: number[] = [];
      let from = 0;
      for (;;) {
        const at = text.indexOf(find, from);
        if (at === -1 || offsets.length >= 25) break;
        offsets.push(at);
        from = at + find.length;
      }
      const snippets = offsets.map((at) => ({
        offset: at,
        text: text.slice(Math.max(0, at - pad), Math.min(text.length, at + find.length + pad)),
      }));
      return NextResponse.json({
        status: res.status,
        total: text.length,
        find,
        occurrences: offsets.length,
        snippets,
      });
    }

    const start = Math.max(0, Number(q.get('start') ?? 0));
    const len = Math.min(20000, Number(q.get('len') ?? 6000));
    return NextResponse.json({ status: res.status, total: text.length, start, len, chunk: text.slice(start, start + len) });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'failed' }, { status: 502 });
  } finally {
    clearTimeout(t);
  }
}
