import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Renders a player page for an Unacademy replay URL inside our own origin, so the
 * lecture plays without leaving the site. Only allowed on the known player hosts.
 */
const ALLOWED = [/^https:\/\/player\.uacdn\.net\//i, /^https:\/\/uamedia\.uacdn\.net\//i, /^https:\/\/[a-z0-9.-]*uacdn\.net\//i];

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url') ?? '';
  if (!ALLOWED.some((re) => re.test(url))) {
    return new Response('Blocked: url must be an *.uacdn.net player link', { status: 400 });
  }

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Lecture</title>
<style>html,body{margin:0;height:100%;background:#000;overflow:hidden}
iframe{position:absolute;inset:0;width:100%;height:100%;border:0}</style></head>
<body><iframe src="${url.replace(/"/g, '&quot;')}"
 allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
 allowfullscreen referrerpolicy="no-referrer"></iframe></body></html>`;

  return new Response(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=600',
      'x-frame-options': 'SAMEORIGIN',
    },
  });
}
