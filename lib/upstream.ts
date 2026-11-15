export const UPSTREAM_ORIGIN =
  process.env.UPSTREAM_ORIGIN?.replace(/\/+$/, '') || 'https://unacademy-studybison.space-z.ai';

/** Public path prefix the reverse proxy is mounted on. */
export const PROXY_PREFIX = '/api/proxy';

export const isProxiedPath = (path: string) => path.startsWith(PROXY_PREFIX);

/** Build a public (same-origin) URL for an upstream path. */
export const toProxyUrl = (path: string) => `${PROXY_PREFIX}${path.startsWith('/') ? path : `/${path}`}`;

/** Hop-by-hop headers that must not be forwarded. */
export const HOP_BY_HOP = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'content-encoding',
  'content-length',
  'host',
]);
