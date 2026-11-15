# Study Bison — Study Smarter, Rise Higher

A **live** free study site: 54 exam goals, each with the real educators teaching it, their batches,
every lecture with its slides PDF, and a full lecture study room (video, annotated notes, progress).

Not a static mock-up — the content comes from the same public catalogue the original app uses:
`/api/teachers → /api/courses → /api/lectures`, with real `goal_uid`s from Unacademy's own catalog.

**Live (public):** https://unacedmy-studybison.vercel.app
**Deployment URL:** https://unacedmy-study-arslanansari1629-blips-projects.vercel.app
_(the `*.vercel.app` project alias stays behind team Deployment Protection — the custom
`unacedmy-studybison.vercel.app` domain is public)_

## Pages

| Route | Description |
| --- | --- |
| `/` | Hero, stats, goal explorer (search + category filters), feature blocks |
| `/goals` | Full library of all 54 goals |
| `/goals/[slug]?page=N` | Live educators for that goal, 9 per page (avatars, bios, ratings, followers) |
| `/teachers/[username]?page=N&sort=popular\|recent` | Educator profile + all their batches, 12 per page |
| `/teachers/[username]/batch/[uid]` | Every lecture in the batch, with notes PDFs |
| `/lectures/[courseUid]/[lectureUid]` | **Lecture study room**: official video, annotated/clean slides, mark-watched, prev/next, filterable sidebar |
| `/search?q=` | Global goal search across all 54 goals |
| `/my-courses` | Saved goals, persisted in `localStorage` |
| `/source` | Live source status: upstream health, latency, proxy docs |
| `/api/proxy/**` | Reverse proxy to the upstream site (HTML/CSS/JS rewritten) |
| `/api/health` | JSON upstream reachability + latency |
| `/api/player` | Same-origin lecture player (host allowlist: `*.uacdn.net`) |
| `/api/stream` | Inline PDF passthrough with Range (host allowlist: `*.uacdn.net`) |
| `/api/asset` | Raw whitelisted `*.uacdn.net` asset passthrough |
| `/robots.txt` | SEO |

## About lecture playback (verified, not guesswork)

Unacademy does not publish direct media files, and I verified this down to the byte level
rather than assuming it:

1. A lecture exposes only `live_class.video_url` — an official player page
   (`player.uacdn.net/liveweb/v…/index.html?replay=true&uid=…&chat_id=…`).
2. The player's webpack chunk *names* are not in `index.html`; only the runtime has hashes.
   Resolving names to files correctly (they 403 if built wrong) shows
   `recordedVideoPlayer`, `vendors~recordedVideoPlayer`, `replay` and the 2 MB `app` chunk
   all download fine.
3. Inside those bundles the player does:
   `getReplayToken(apiHost, lessonId, accessToken)` → `getReplayMeta(videoId)` →
   `data.json` / `securejson.json` next to a media file, and it also checks that the
   referrer contains `unacademy.com`.
   **The token comes from a logged-in Unacademy session.** `/api/v1/replay`,
   `/api/v1/live_class`, `/api/v1/video`, `/api/v1/session` and 30+ sibling paths all 404
   without it.
4. The original site (`unacademy-studybison.space-z.ai`) hits the same wall: its
   `/api/player` renders **"SYNC ERROR: No data found"** for the exact same lecture URL.

So `player.uacdn.net` sends **no `X-Frame-Options` and no CSP**, which means the honest way to
make a lecture watchable in-app is to embed that official player **as-is**, where
Unacademy's own session resolves the stream — and to say plainly that Plus (paid) classes
need an Unacademy login. No gate is bypassed. Slides, notes and PDFs are public and proxied
through `/api/stream` with Range support.

The lecture room therefore gives you: the official player (plus a one-click "Open player"
escape hatch), annotated / clean slides, mark-watched progress, prev/next, a filterable
batch sidebar, and keyboard shortcuts.

## Stack

- Next.js App Router (16.4.x), goals prerendered, live data revalidated every 10 minutes
- Tailwind CSS with a custom glass/aurora dark design system
- Client-side saved-courses context (no backend, no account needed)
- Fonts loaded via stylesheet link so builds never depend on Google Fonts

## Local development

```bash
npm install
npm run dev     # http://localhost:3000
npm run build && npm start
```

## Live content chain

```
goal_uid  ──►  /api/teachers?goal_uid=…      → real educators per goal
               /api/courses?username=…&type=  → that educator's batches (504 for one JEE teacher)
               /api/lectures?uid=…            → every lecture, video_url + slides_pdf
               /api/player?url=…              → same-origin player for the replay
               /api/stream?url=…              → PDF passthrough (inline, Range) for notes
```

The 54 `goal_uid`s are the real ones the source app uses (e.g. `TMUVD` = JEE, `KSCGY` = UPSC),
read from its bundle. Verified live: JEE returns 10 educators incl. Vineet Loomba (1.6L followers),
UPSC returns Mrunal Patel (5.4L followers), and a 15-lecture batch resolves with durations, dates,
annotated notes and a working player.

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
