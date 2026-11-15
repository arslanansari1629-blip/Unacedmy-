import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

/** Media hosts we are willing to inspect/fetch (all Unacademy CDN properties). */
const ALLOWED = /^https:\/\/([a-z0-9-]+\.)*uacdn\.net\//i;

/**
 * Dev diagnostic for media discovery: fetch a whitelisted *.uacdn.net URL and
 * return either a raw window, plain-substring matches with context, or the list
 * of media/api URLs it references.
 */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const url = q.get('url') ?? '';
  if (!ALLOWED.test(url)) {
    return NextResponse.json({ error: 'blocked: only *.uacdn.net URLs' }, { status: 400 });
  }

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 25_000);
  try {
    const res = await fetch(url, {
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
    const text = await res.text();

    const find = q.get('find');
    if (find) {
      const pad = Math.min(2000, Number(q.get('pad') ?? 300));
      const snippets: Array<{ offset: number; text: string }> = [];
      let from = 0;
      for (;;) {
        const at = text.indexOf(find, from);
        if (at === -1 || snippets.length >= 20) break;
        snippets.push({ offset: at, text: text.slice(Math.max(0, at - pad), at + find.length + pad) });
        from = at + find.length;
      }
      return NextResponse.json({ status: res.status, total: text.length, find, snippets });
    }

    const media = Array.from(
      new Set([
        ...(text.match(/https?:\/\/[^\s"'<>]+\.(?:m3u8|mp4|webm|mpd|json)[^\s"'<>]*/gi) ?? []),
        ...(text.match(/["'][^"']*\.(?:m3u8|mp4|webm)[^"']*["']/gi) ?? []),
      ]),
    ).slice(0, 50);
    const apis = Array.from(
      new Set(text.match(/https?:\/\/[a-z0-9.-]*api[a-z0-9./_-]*/gi) ?? []),
    ).slice(0, 30);

    const start = Number(q.get('start') ?? 0);
    const len = Math.min(30000, Number(q.get('len') ?? 0));

    return NextResponse.json({
      status: res.status,
      total: text.length,
      contentType: res.headers.get('content-type'),
      media,
      apis,
      chunk: len ? text.slice(start, start + len) : undefined,
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'failed' }, { status: 502 });
  } finally {
    clearTimeout(t);
  }
}
