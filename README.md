# Study Bison — Study Smarter, Rise Higher

A free study-companion site: 54 exam goals, each with lecture series, notes & PDFs, and educators.
Rebuilt as a production Next.js app (Next 16 / React 19 / Tailwind 3).

**Live:** https://unacedmy-study-arslanansari1629-blips-projects.vercel.app
_(the Vercel project has team Deployment Protection on — disable it in
Settings → Deployment Protection to make the link public)_

## Pages

| Route | Description |
| --- | --- |
| `/` | Hero, stats, goal explorer (search + category filters), feature blocks |
| `/goals` | Full library of all 54 goals |
| `/goals/[slug]` | Goal detail: Lectures / PDFs & Notes / Educators tabs, related goals (SSG, 54 pages) |
| `/my-courses` | Saved goals, persisted in `localStorage` |
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

## Deploy

Connected to Vercel project `unacedmy-study`. Every push to a connected branch builds a
deployment; pushes to `main` are promoted to production.

## Disclaimer

Unofficial study platform. Lectures & PDFs are streamed from publicly available sources;
Study Bison hosts no content and is not affiliated with Unacademy.
