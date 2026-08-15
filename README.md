# MC Explorer — Microcontroller Catalog

A full-stack site: pick a microcontroller from a catalog, see full specs and a
pin-by-pin table, and jump to the manufacturer's official page.

- **Backend:** Node.js + Express + SQLite (via `better-sqlite3`) — no separate
  database server to install, it's just a file.
- **Frontend:** React + Vite + Tailwind CSS, React Router for the two pages
  (catalog grid, detail page).
- Seeded with 143 real microcontrollers and dev boards (ESP32, Arduino Uno,
  STM32 Blue Pill, Raspberry Pi Pico, ATtiny85, ESP8266, plus the STM32/PIC/AVR/
  NXP/TI/Nordic/RISC-V/etc. lineup added later) with pinouts, specs, and links.
  The original 6 have full datasheet-verified pinouts; the 137 added afterward
  ship with a shorter, representative pin summary (power/ground/comm/ADC/GPIO)
  rather than an exhaustive pin-by-pin table — check the datasheet link for
  the complete map on those.
- Every page now carries the same looping hologram-style hero video (the
  catalog home page and each chip's detail page) for a consistent look.
- **Copy-to-clipboard**: every pin row in the pinout table has a copy button
  (copies the pin name), and datasheet/buy links have a copy-link button next
  to them, both on the detail hero and the Communication panel.
- **Compare panel**: hit "Compare" on any catalog card to add a chip to the
  comparison tray (bottom of the screen, or the "Compare" link in the header —
  it shows a live count badge). Pick two chips and hit "Compare now" for a
  side-by-side view at `/compare`: a spec table that highlights differing
  rows, a communication-protocol diff (shared vs. chip-specific), and quick
  links back to each chip's full pinout.
- **Shareable filtered views**: search, filters, and sort all live in the URL
  (`?q=...&communication=...&sort=...`), so a filtered view can be bookmarked
  or shared, refreshing doesn't lose it, and browser back/forward step through
  filter changes.
- **Pagination**: the catalog grid loads 9 chips at a time with a "Load more"
  button, instead of rendering every match at once.
- **Loading skeletons**: the catalog grid shows placeholder cards (matching
  `ChipCard`'s exact layout) while a fetch is in flight, instead of a bare
  "Loading…" line.
- **Changelog**: `/changelog` lists dated catalog updates, sourced from
  `backend/changelog.js`. The home page shows a "Last updated" badge (in the
  hero HUD card and above the catalog grid) linking to it — add a new entry
  there whenever you add/update/remove chips.
- **404 page**: unknown routes and unknown chip slugs (`/mc/some-typo`) land
  on a styled not-found page with a search box and a "Browse Catalog" CTA,
  instead of a dead end.
- **robots.txt + sitemap.xml**: `frontend/public/robots.txt` points crawlers
  at the sitemap; `frontend/public/sitemap.xml` starts with the static routes
  and is regenerated with a `<url>` entry per chip page by
  `scripts/generate-sitemap.mjs` (see below).

## Running it locally

You need Node.js installed (v18+). Two terminals: one for backend, one for frontend.

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

This starts the API on `http://localhost:5000` and creates `mc-explorer.db`
(SQLite file) automatically on first run, seeded with all 143 microcontrollers.
If you already have an `mc-explorer.db` from before, delete it before starting
the backend so it reseeds with the full current catalog.

Check it worked: open `http://localhost:5000/api/microcontrollers` in your
browser — you should see JSON.

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). The dev server
proxies `/api/*` requests to the backend automatically (see `vite.config.js`).

## Before deploying

1. Update `og:image`/`twitter:image` in `frontend/index.html` and the
   `Sitemap:` line in `frontend/public/robots.txt` with your real domain
   (they ship as root-relative/placeholder values since the domain isn't
   known ahead of time).
2. Regenerate the sitemap with real chip URLs:
   ```bash
   SITE_URL=https://your-domain.com node scripts/generate-sitemap.mjs
   ```
   This reads slugs straight from `backend/db.js` and rewrites
   `frontend/public/sitemap.xml`. Re-run it whenever chips are added or
   removed (it's a good candidate for a deploy-time step).
3. Add a dated entry to `backend/changelog.js` — the "Last updated" badge
   and `/changelog` page both read from it.

## Adding a new microcontroller

Right now data lives in `backend/db.js`, in the `seed` array — each entry has
an `mc` object (specs) and a `pins` array. Add a new object there and delete
`backend/mc-explorer.db` before restarting the backend, so it reseeds with
your new entry included.

Once you're comfortable, a natural next step is building a small admin form
(a `POST /api/microcontrollers` route + a form on the frontend) so you can add
new chips without touching code or deleting the database — happy to help
build that when you're ready.

## Project structure

```
mc-explorer/
├── backend/
│   ├── db.js        # schema + seed data
│   ├── server.js    # Express routes
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api.js               # fetch helpers
    │   ├── App.jsx               # routes + header
    │   ├── main.jsx
    │   ├── index.css
    │   ├── components/ChipCard.jsx
    │   └── pages/Home.jsx, Detail.jsx
    ├── tailwind.config.js        # design tokens (colors, fonts)
    └── package.json
```

## Design notes

Dark "PCB" theme — near-black background, copper accent for primary actions,
teal "trace" accent for data/technical highlights, monospace font for anything
that reads like a datasheet value (specs, pin numbers). Catalog cards have
small pin nubs on their edges to echo an actual IC package.
