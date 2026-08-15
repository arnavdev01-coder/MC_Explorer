#!/usr/bin/env node
// Regenerates frontend/public/sitemap.xml with one <url> per catalog page,
// including every /mc/:slug chip detail page (which a hand-written sitemap
// can't keep up with as chips are added/removed).
//
// Usage:
//   SITE_URL=https://your-domain.com node scripts/generate-sitemap.mjs
//
// Run this as part of your deploy step, after the backend DB is seeded —
// it reads slugs straight from backend/db.js, no server needs to be running.

import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import db from "../backend/db.js";
import CHANGELOG from "../backend/changelog.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_URL = (process.env.SITE_URL || "https://your-domain.com").replace(/\/+$/, "");
const lastmod = CHANGELOG[0]?.date;

const staticRoutes = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/compare", changefreq: "monthly", priority: "0.3" },
  { path: "/changelog", changefreq: "weekly", priority: "0.4" },
];

const chipSlugs = db.prepare("SELECT slug FROM microcontrollers ORDER BY slug ASC").all().map((r) => r.slug);

const urlEntry = ({ loc, changefreq, priority }) => `  <url>
    <loc>${loc}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;

const entries = [
  ...staticRoutes.map((r) => urlEntry({ loc: `${SITE_URL}${r.path}`, changefreq: r.changefreq, priority: r.priority })),
  ...chipSlugs.map((slug) =>
    urlEntry({ loc: `${SITE_URL}/mc/${slug}`, changefreq: "monthly", priority: "0.7" })
  ),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>
`;

const outPath = path.join(__dirname, "..", "frontend", "public", "sitemap.xml");
writeFileSync(outPath, xml);
console.log(`Wrote ${chipSlugs.length + staticRoutes.length} URLs to ${outPath}`);
