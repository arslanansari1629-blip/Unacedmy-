import { NextRequest, NextResponse } from 'next/server';
import { PROXY_PREFIX } from '@/lib/upstream';

/**
 * Paths this app does not define are reverse-proxied to the live source, so the
 * copy answers on the same URLs the original does. Only this known set of that
 * site's paths is forwarded — anything else falls through to our own 404, which
 * avoids paying a serverless invocation for random URLs.
 */
const UPSTREAM_PATHS = [/^\/about\/?$/, /^\/lectures\/?$/, /^\/course(\/|$)/, /^\/library(\/|$)/];

const OWN_PREFIXES = ['/goals', '/my-courses', '/source', '/api/', '/_next/', '/icons/', '/favicon', '/robots.txt'];

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  if (pathname === '/') return NextResponse.next();
  if (OWN_PREFIXES.some((p) => pathname === p || pathname.startsWith(p))) return NextResponse.next();
  if (!UPSTREAM_PATHS.some((re) => re.test(pathname))) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = `${PROXY_PREFIX}${pathname}`;
  url.search = search;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/proxy).*)'],
};
