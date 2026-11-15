# Study Bison — Study Smarter, Rise Higher

A free study-companion site: 54 exam goals, each with lecture series, notes & PDFs, and educators.
Rebuilt as a production Next.js app (Next 16 / React 19 / Tailwind 3).

**Live (public):** https://unacedmy-studybison.vercel.app
**Deployment URL:** https://unacedmy-study-arslanansari1629-blips-projects.vercel.app
_(the `*.vercel.app` project alias stays behind team Deployment Protection — the custom
`unacedmy-studybison.vercel.app` domain is public)_

## Pages

| Route | Description |
| --- | --- |
| `/` | Hero, stats, goal explorer (search + category filters), feature blocks |
| `/goals` | Full library of all 54 goals |
| `/goals/[slug]` | Goal detail: Lectures / PDFs & Notes / Educators tabs, related goals (SSG, 54 pages) |
| `/my-courses` | Saved goals, persisted in `localStorage` |
| `/source` | Live source status: upstream health, latency, proxy docs |
| `/api/proxy/**` | Reverse proxy to the upstream site (HTML/CSS/JS rewritten) |
| `/api/health` | JSON upstream reachability + latency |
| `/robots.txt` | SEO |

## Stack

- Next.js App Router, fully static prerendered (61 pages)
- Tailwind CSS with a custom glass/aurora dark design system
- Client-side saved-courses context (no backend, no account needed)
- Fonts loaded via stylesheet link so builds never depend on Google Fonts

## Local development

```bash
npm install
npm run dev     # http://localhost:3000
npm run build && npm start
```

## Live proxy

The copy is not a snapshot: the source site's paths are reverse-proxied at request time.

- `GET /api/proxy/<path>` — full passthrough (query strings, headers, bodies, methods).
  Absolute upstream URLs and root-relative asset paths are rewritten to `/api/proxy/...`
  so pages, CSS, JS and images all load from your own domain.
- `middleware.ts` — the upstream's own paths (`/about`, `/lectures`, `/course/*`, `/library/*`)
  are transparently rewritten to the proxy, so the same URLs work here. Curated routes and
  everything else never hit the proxy (keeps serverless invocations low, and still 404s for
  paths the upstream itself does not have).
- `GET /api/health` — upstream status and latency.
- `UPSTREAM_ORIGIN` env var — point the proxy at another mirror without a redeploy.

## Deploy

Connected to Vercel project `unacedmy-study`. Every push to a connected branch builds a
deployment; pushes to `main` are promoted to production.

## Disclaimer

Unofficial study platform. Lectures & PDFs are streamed from publicly available sources;
Study Bison hosts no content and is not affiliated with Unacademy.
