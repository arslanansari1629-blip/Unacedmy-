import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

/** Dev-only: probe candidate replay/media endpoints for a recorded class. */
export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams;
  const uid = sp.get('uid') ?? 'L7HQYMKAFHTK3S43OZ2Q';
  const chat = sp.get('chat') ?? 'A9UHNO6E';
  const lesson = sp.get('lesson') ?? 'A9UHNO6E';
  const course = sp.get('course') ?? '7WJ8OYWE';
  const raw = sp.get('url');

  if (raw && /^https:\/\/(api\.unacademy\.com|unacademy\.com|player\.uacdn\.net|static\.uacdn\.net)\/[^\s]*$/.test(raw)) {
    try {
      const res = await fetch(raw, {
        headers: { 'user-agent': UA, accept: 'application/json, */*', referer: 'https://unacademy.com/' },
        signal: AbortSignal.timeout(15_000),
        cache: 'no-store',
      });
      const text = await res.text();
      return Response.json(
        { url: raw, status: res.status, ct: res.headers.get('content-type'), len: text.length, body: text },
        { headers: { 'cache-control': 'no-store', 'access-control-allow-origin': '*' } },
      );
    } catch (e) {
      return Response.json({ url: raw, error: e instanceof Error ? e.message : 'fail' }, { status: 502 });
    }
  }

  const urls = [
    `https://api.unacademy.com/api/v1/replay/?uid=${uid}`,
    `https://api.unacademy.com/api/v1/replay/${uid}/`,
    `https://api.unacademy.com/api/v2/replay/?uid=${uid}`,
    `https://api.unacademy.com/api/v3/replay/?uid=${uid}`,
    `https://api.unacademy.com/api/v1/live_class/${uid}/`,
    `https://api.unacademy.com/api/v1/live_class/?uid=${uid}`,
    `https://api.unacademy.com/api/v1/recorded/?uid=${uid}`,
    `https://api.unacademy.com/api/v1/video/?uid=${uid}`,
    `https://api.unacademy.com/api/v1/player/?uid=${uid}`,
    `https://api.unacademy.com/api/v1/session/?uid=${uid}`,
    `https://api.unacademy.com/api/v1/post/${lesson}/`,
    `https://api.unacademy.com/api/v1/lesson/${lesson}/`,
    `https://api.unacademy.com/api/v1/content/${lesson}/`,
    `https://api.unacademy.com/api/v1/collection/${course}/`,
    `https://api.unacademy.com/api/v1/collection/${course}/posts/?limit=2`,
    `https://unacademy.com/api/v1/replay/?uid=${uid}`,
    `https://player.uacdn.net/api/v1/replay/?uid=${uid}`,
    `https://player.uacdn.net/liveweb/v4031/data.json?uid=${uid}&chat_id=${chat}`,
    `https://player.uacdn.net/recorded/${uid}/data.json`,
    `https://player.uacdn.net/replay/${uid}/data.json`,
  ];

  const results = await Promise.all(
    urls.map(async (u) => {
      const started = Date.now();
      try {
        const res = await fetch(u, {
          headers: { 'user-agent': UA, accept: 'application/json, */*', referer: 'https://unacademy.com/' },
          redirect: 'follow',
          signal: AbortSignal.timeout(12_000),
          cache: 'no-store',
        });
        const ct = res.headers.get('content-type') ?? '';
        const text = await res.text();
        const snippet = text.slice(0, 260).replace(/\s+/g, ' ');
        const media = (text.match(/https?:\/\/[^"'\\\s]+\.(?:mp4|m3u8|webm|mpd)[^"'\\\s]*/g) ?? []).slice(0, 3);
        return { u, status: res.status, ct, ms: Date.now() - started, len: text.length, media, snippet };
      } catch (e) {
        return { u, status: 0, error: e instanceof Error ? e.message : 'fetch failed', ms: Date.now() - started };
      }
    }),
  );

  return Response.json(
    { uid, chat, results },
    { headers: { 'cache-control': 'no-store', 'access-control-allow-origin': '*' } },
  );
}
