import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

/** Temporary discovery helper: fetch a page/asset as text and optionally grep it. */
export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams;
  const target = sp.get('url');
  if (!target) return Response.json({ error: 'url required' }, { status: 400 });

  let u: URL;
  try {
    u = new URL(target);
  } catch {
    return Response.json({ error: 'bad url' }, { status: 400 });
  }
  if (!/^https?:$/.test(u.protocol)) return Response.json({ error: 'http(s) only' }, { status: 400 });
  if (/^(localhost|127\.|0\.0\.0\.0|10\.|192\.168\.|169\.254\.)/i.test(u.hostname)) {
    return Response.json({ error: 'blocked host' }, { status: 400 });
  }

  try {
    const res = await fetch(u, {
      headers: {
        'user-agent': UA,
        accept: sp.get('accept') ?? '*/*',
        referer: 'https://studypanda.live/',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(20_000),
      cache: 'no-store',
    });
    const text = await res.text();
    const grep = sp.get('grep');
    if (grep) {
      let re: RegExp;
      try {
        re = new RegExp(grep, 'gi');
      } catch {
        return Response.json({ error: 'bad regex' }, { status: 400 });
      }
      const ctx = Number(sp.get('ctx') ?? '120');
      const hits: string[] = [];
      for (const m of text.matchAll(re)) {
        const i = m.index ?? 0;
        hits.push(text.slice(Math.max(0, i - ctx), i + m[0].length + ctx).replace(/\s+/g, ' '));
        if (hits.length >= 60) break;
      }
      return Response.json({ url: u.toString(), status: res.status, len: text.length, hits });
    }
    return Response.json({
      url: u.toString(),
      status: res.status,
      ct: res.headers.get('content-type'),
      len: text.length,
      body: text.slice(0, Number(sp.get('max') ?? '60000')),
    });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : 'fetch failed' }, { status: 502 });
  }
}
