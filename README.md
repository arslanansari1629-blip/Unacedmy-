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
| `/api/media?url=` | **Lecture video stream** — Range/206 passthrough for `uamedia.uacdn.net` recordings |
| `/api/asset` | Raw whitelisted `*.uacdn.net` asset passthrough |
| `/robots.txt` | SEO |

## Lecture playback — solved

A recorded class exposes `live_class.video_url`, an official player page:
`player.uacdn.net/liveweb/v…/index.html?replay=true&uid=<CLASS_UID>&chat_id=<LESSON_UID>`.

That player needs a signed replay token from a logged-in Unacademy session, so the player page
itself is a dead end. The recording, however, is served openly from the media CDN:

```
https://uamedia.uacdn.net/lesson-raw/<CLASS_UID>/output.webm
```

`lib/api.ts → mediaFromVideoUrl()` derives it from the `uid` param of `video_url`
(verified on multiple lectures: 188–222 MB WebM, `accept-ranges: bytes`; there is no `.mp4`
variant). `app/api/media` streams it through this origin with full **Range / 206** support, so
the `<video>` element seeks natively, including from arbitrary offsets.

The lecture room therefore plays the class directly — with speed control (1×–2×), ±10s,
resume-from-last-position, mark-watched, next/prev, a filterable batch sidebar and a
"playable only" filter on the batch page. The official player remains one click away
(`official ↗`) for synced interactive notes, polls and chat.

## Stack## Stack

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
               /api/media?url=…               → lecture video stream (Range/206, seekable)
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
