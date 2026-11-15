import { HOP_BY_HOP, UPSTREAM_ORIGIN } from './upstream';

const PROXY_ORIGIN = '/api/proxy';

/** Rewrite absolute upstream URLs and root-relative asset paths so they resolve through the proxy. */
export function rewriteBody(body: string, contentType: string | null, upstream: string): string {
  body = body.split(UPSTREAM_ORIGIN).join(PROXY_ORIGIN);
  body = body.split(upstream).join(PROXY_ORIGIN);

  const textual =
    contentType &&
    (contentType.includes('text/html') || contentType.includes('text/css') || contentType.includes('javascript'));

  if (textual) {
    body = body.replace(/(["'(\s])\/(?!api\/proxy)(?!\/)([\w./@~%+-]*)/g, `$1${PROXY_ORIGIN}/$2`);
  }
  return body;
}

export function filterResponseHeaders(upstream: Headers): Headers {
  const out = new Headers();
  upstream.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (!HOP_BY_HOP.has(lower) && lower !== 'content-security-policy') out.set(key, value);
  });
  out.set('x-proxied-from', UPSTREAM_ORIGIN);
  out.set('access-control-allow-origin', '*');
  return out;
}

export function filteredRequestHeaders(from: Headers): Headers {
  const out = new Headers();
  from.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) out.set(key, value);
  });
  out.set('accept-encoding', 'identity');
  out.set('referer', `${UPSTREAM_ORIGIN}/`);
  out.set('origin', UPSTREAM_ORIGIN);
  return out;
}

export function unreachableResponse(target: string, message: string, wantsHtml: boolean) {
  if (wantsHtml) {
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Live source unavailable · Study Bison</title>
<style>
:root{color-scheme:dark}
body{margin:0;min-height:100vh;display:grid;place-items:center;background:#07070b;color:#eef0f8;
font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;padding:24px}
.card{max-width:520px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);
border-radius:20px;padding:32px;text-align:center}
h1{font-size:20px;margin:14px 0 8px}
p{color:rgba(255,255,255,.6);font-size:14px;line-height:1.65;margin:0 0 18px}
code{font-size:11px;color:#22d3ee;word-break:break-all}
a{display:inline-block;margin-top:8px;background:#7c5cff;color:#fff;text-decoration:none;
padding:11px 20px;border-radius:999px;font-size:13px;font-weight:600}
i{font-style:normal;font-size:30px}
</style></head><body><div class="card">
<i>🛰️</i><h1>Live source unreachable</h1>
<p>This path is mirrored from <code>${target}</code>, but the upstream host refused the
connection from this server. The curated Study Bison pages still work normally.</p>
<a href="/">Back to Study Bison</a>
<p style="margin-top:16px"><code>${message}</code></p>
</div></body></html>`;
    return new Response(html, {
      status: 502,
      headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
    });
  }

  return new Response(
    JSON.stringify({
      ok: false,
      error: 'upstream_unreachable',
      message,
      target,
      hint: 'The upstream origin refused the connection. Set UPSTREAM_ORIGIN to a reachable mirror.',
    }),
    { status: 502, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } },
  );
}
