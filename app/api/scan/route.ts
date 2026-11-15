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

  const names = sp.get('names');
  if (names) {
    const idx = await grab(`${base}index.html`);
    const rt = idx.text.match(/static\/js\/runtime-main\.[a-f0-9]+\.js/)?.[0];
    if (!rt) return Response.json({ error: 'no runtime' });
    const r = await grab(`${base}${rt}`);
    const js = r.text;
    // the chunk-name map lives in the first part of the runtime: {30:"live",32:"microInteraction",...}
    const map: Record<string, string> = {};
    for (const m of js.matchAll(/(\d{1,3})\s*:\s*"([A-Za-z][A-Za-z0-9_~-]*)"/g)) map[m[1]] = m[2];
    // and the hash map: {2:"88be...",...}
    const hashes: Record<string, string> = {};
    for (const m of js.matchAll(/(\d{1,3})\s*:\s*"([a-f0-9]{16,24})"/g)) hashes[m[1]] = m[2];
    const ids = Object.keys(hashes);
    const candidates: Record<string, string> = {};
    for (const id of ids) {
      const nm = map[id];
      if (!nm) continue;
      candidates[nm] = `${id}.${hashes[id]}`;
    }
    // probe every named chunk to find which ones actually exist
    const probes = await Promise.all(
      Object.entries(candidates).slice(0, 22).map(async ([nm, idHash]) => {
        const u = `${base}static/js/${nm}.${idHash.split('.')[1]}.chunk.js`;
        const res = await grab(u);
        return `${nm}: ${res.status} ${res.len}B`;
      }),
    );
    return Response.json({ nameEntries: Object.keys(map).length, map, probes });
  }

  const g = sp.get('grep');
  if (raw && g) {
    const r = await grab(raw);
    let re: RegExp;
    try {
      re = new RegExp(g, 'gi');
    } catch {
      return Response.json({ error: 'bad regex' }, { status: 400 });
    }
    const ctx = Number(sp.get('ctx') ?? '110');
    const hits: string[] = [];
    for (const m of r.text.matchAll(re)) {
      const i = m.index ?? 0;
      hits.push(r.text.slice(Math.max(0, i - ctx), i + m[0].length + ctx).replace(/\s+/g, ' '));
      if (hits.length >= 40) break;
    }
    return Response.json({ url: raw, status: r.status, len: r.len, hits });
  }

  const urls = sp.get('urls');
  if (urls) {
    const list = urls.split(',').map((u) => (u.startsWith('http') ? u : BASE + u));
    const out = await Promise.all(
      list.slice(0, 24).map(async (u) => {
        const r = await grab(u);
        const media = (r.text.match(/https?:\/\/[^"'\\\s]+(?:\.mp4|\.m3u8|\.webm|\.mpd|\.json)[^"'\\\s]*/g) ?? []).slice(0, 8);
        return { url: u, status: r.status, len: r.len, ct: r.ct, media, head: r.text.slice(0, 200).replace(/\s+/g, ' ') };
      }),
    );
    return Response.json({ out });
  }

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
