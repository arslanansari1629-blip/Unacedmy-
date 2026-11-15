import { NextRequest, NextResponse } from 'next/server';
import { PROXY_PREFIX } from '@/lib/upstream';

/**
 * Any path that is not one of this app's own routes is served live from the
 * upstream site through the reverse proxy. This makes the clone behave like the
 * original for every URL it has, while our own designed pages keep their routes.
 */
const OWN_PREFIXES = [
  '/goals',
  '/my-courses',
  '/source',
  '/api/',
  '/_next/',
  '/icons/',
  '/favicon',
  '/robots.txt',
];

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  if (pathname === '/') return NextResponse.next();
  if (OWN_PREFIXES.some((p) => pathname === p || pathname.startsWith(p))) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = `${PROXY_PREFIX}${pathname}`;
  url.search = search;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/proxy).*)'],
};
