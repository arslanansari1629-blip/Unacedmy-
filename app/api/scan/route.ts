import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const BASE = 'https://player.uacdn.net/liveweb/v4031/';

async function grab(u: string) {
  try {
    const res = await fetch(u, {
      headers: { 'user-agent': UA, referer: 'https://unacademy.com/', accept: '*/*' },
      signal: AbortSignal.timeout(12_000),
      cache: 'no-store',
    });
    const text = await res.text();
    return { status: res.status, ct: res.headers.get('content-type'), len: text.length, text };
  } catch (e) {
    return { status: 0, ct: '', len: 0, text: e instanceof Error ? e.message : 'fail' };
  }
}

export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams;
  const version = sp.get('v') ?? 'v4031';
  const base = `https://player.uacdn.net/liveweb/${version}/`;
  const raw = sp.get('raw');
  const mode = sp.get('mode') ?? 'map';

  if (raw) {
    const r = await grab(raw);
    return Response.json({ url: raw, ...r });
  }

  // 1. index.html -> runtime file name
  const index = await grab(`${base}index.html`);
  const runtimeFile = index.text.match(/static\/js\/runtime-main\.[a-f0-9]+\.js/)?.[0];
  if (mode === 'index') {
    return Response.json({ status: index.status, len: index.len, runtimeFile, html: index.text });
  }
  if (!runtimeFile) return Response.json({ error: 'no runtime', indexLen: index.len });

  // 2. runtime -> chunk name map + hash map
  const runtime = await grab(`${base}${runtimeFile}`);
  const js = runtime.text;

  // webpack5: "static/js/" + ({}[chunkId]||chunkId) + "." + {hashMap}[chunkId] + ".chunk.js"
  const nameMap: Record<string, string> = {};
  for (const m of js.matchAll(/(\d+)\s*:\s*"([a-zA-Z0-9_~-]+)"/g)) nameMap[m[1]] = m[2];
  const hashMap: Record<string, string> = {};
  for (const m of js.matchAll(/(\d+)\s*:\s*"([a-f0-9]{16,24})"/g)) hashMap[m[1]] = m[2];

  const buildUrl = (id: string) => {
    const name = nameMap[id] ?? id;
    const hash = hashMap[id];
    return hash ? `${base}static/js/${name}.${hash}.chunk.js` : null;
  };

  if (mode === 'runtime') {
    return Response.json({ runtimeLen: js.length, nameMap, hashMap, js });
  }

  // 3. probe the chunks we care about
  const ids = sp.get('ids')?.split(',') ?? Object.keys(hashMap).slice(0, 40);
  const tried = await Promise.all(
    ids.slice(0, 25).map(async (id) => {
      const u = buildUrl(id);
      if (!u) return { id, url: null };
      const r = await grab(u);
      const media = (r.text.match(/https?:\/\/[^"'\\\s]+\.(?:mp4|m3u8|webm|mpd|json)[^"'\\\s]*/g) ?? []).slice(0, 6);
      return {
        id,
        name: nameMap[id],
        url: u,
        status: r.status,
        len: r.len,
        media,
        head: r.text.slice(0, 160).replace(/\s+/g, ' '),
      };
    }),
  );

  return Response.json({ nameMap, hashCount: Object.keys(hashMap).length, tried });
}
