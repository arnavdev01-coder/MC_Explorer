import express from "express";
import cors from "cors";
import db from "./db.js";
import CHANGELOG from "./changelog.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ---------- Package family helpers ----------
// package_type values look like "QFN-48 (module on dev board)" or
// "DIP-40 / PLCC-44 / LQFP-44" (multiple footprint options for the same
// chip). We extract every recognizable package "family" token so a chip
// with several footprint options is filterable under any of them.
const PACKAGE_FAMILIES = [
  "UFQFPN", "VFQFPN", "TQFN", "VQFN", "HVQFN", "WLCSP", "WLP",
  "SPDIP", "PDIP", "DIP", "SOIC", "SSOP", "TSSOP", "SOP", "QSOP",
  "LQFP", "TQFP", "QFP", "QFN", "BGA", "LGA", "CSP",
];

function extractPackageFamilies(packageType) {
  const found = new Set();
  const upper = packageType.toUpperCase();
  for (const fam of PACKAGE_FAMILIES) {
    if (upper.includes(fam)) found.add(fam);
  }
  if (found.size === 0) found.add("Module / Other");
  return [...found];
}

// ---------- Architecture bit-width helper ----------
function extractBitWidth(architecture) {
  const m = architecture.match(/^(\d+)-bit/i);
  return m ? `${m[1]}-bit` : "Other";
}

// ---------- Price bucket helper ----------
// price_range values look like "₹250 – ₹600". We bucket on the average
// of the low/high figures.
function extractPriceAvg(priceRange) {
  const nums = (priceRange.match(/[\d,]+/g) || []).map((n) => Number(n.replace(/,/g, "")));
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function extractPriceBucket(priceRange) {
  const avg = extractPriceAvg(priceRange);
  if (avg === null) return "unknown";
  if (avg < 150) return "budget";
  if (avg < 500) return "mid";
  return "premium";
}

const PRICE_BUCKET_LABELS = {
  budget: "Budget (< ₹150 avg)",
  mid: "Mid-range (₹150 – ₹500 avg)",
  premium: "Premium (> ₹500 avg)",
};

// ---------- Clock speed helper ----------
// clock_speed values look like "Up to 240 MHz" or "72 MHz (overclockable
// to 96 MHz)" — take the highest number mentioned as the sort value.
function extractClockMHz(clockSpeed) {
  const nums = (clockSpeed.match(/[\d.]+/g) || []).map(Number).filter((n) => !Number.isNaN(n));
  if (nums.length === 0) return null;
  return Math.max(...nums);
}

function withFacetFields(row) {
  return {
    ...row,
    communication: row.communication.split(","),
    package_families: extractPackageFamilies(row.package_type),
    bit_width: extractBitWidth(row.architecture),
    price_bucket: extractPriceBucket(row.price_range),
    price_avg: extractPriceAvg(row.price_range),
    clock_mhz: extractClockMHz(row.clock_speed),
  };
}

// ---------- Sort helpers ----------
// Query param shape: "field:dir", e.g. "price:asc", "clock:desc". Chips
// missing a parseable number (price_avg/clock_mhz null) sort to the end
// regardless of direction, rather than jumping to the front on "high to low".
const SORT_KEYS = {
  name: (r) => r.name.toLowerCase(),
  price: (r) => r.price_avg,
  clock: (r) => r.clock_mhz,
  pins: (r) => r.io_pins_count,
};

function applySort(results, sortParam) {
  const [field, dirRaw] = String(sortParam || "name:asc").split(":");
  const getKey = SORT_KEYS[field] || SORT_KEYS.name;
  const dir = dirRaw === "desc" ? -1 : 1;

  return [...results].sort((a, b) => {
    const av = getKey(a);
    const bv = getKey(b);
    if (av === null && bv === null) return a.name.localeCompare(b.name);
    if (av === null) return 1; // nulls always last
    if (bv === null) return -1;
    if (av < bv) return -1 * dir;
    if (av > bv) return 1 * dir;
    return a.name.localeCompare(b.name); // stable tiebreaker
  });
}

// ---------- GET /api/microcontrollers ----------
// List microcontrollers (summary fields only, for the home page grid),
// with real facet filtering applied in JS since the catalog is small
// and several facets (package family, bit width, price bucket) are
// derived from free-text fields rather than clean columns.
app.get("/api/microcontrollers", (req, res) => {
  const { search, communication, architecture, manufacturer, package: pkg, price, sort } = req.query;

  const rows = db
    .prepare(
      `SELECT id, slug, name, manufacturer, architecture, short_description,
              clock_speed, io_pins_count, communication, price_range, package_type
       FROM microcontrollers
       ORDER BY name ASC`
    )
    .all()
    .map(withFacetFields);

  let results = rows;

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(
      (r) => r.name.toLowerCase().includes(q) || r.manufacturer.toLowerCase().includes(q)
    );
  }
  if (communication) {
    const wanted = communication.split(",").map((c) => c.trim().toLowerCase());
    results = results.filter((r) =>
      wanted.every((w) => r.communication.some((c) => c.toLowerCase() === w))
    );
  }
  if (architecture) {
    const wanted = architecture.split(",").map((a) => a.trim());
    results = results.filter((r) => wanted.includes(r.bit_width));
  }
  if (manufacturer) {
    const wanted = manufacturer.split(",").map((m) => m.trim());
    results = results.filter((r) => wanted.includes(r.manufacturer));
  }
  if (pkg) {
    const wanted = pkg.split(",").map((p) => p.trim());
    results = results.filter((r) => r.package_families.some((f) => wanted.includes(f)));
  }
  if (price) {
    const wanted = price.split(",").map((p) => p.trim());
    results = results.filter((r) => wanted.includes(r.price_bucket));
  }

  results = applySort(results, sort);

  res.json(results);
});

// ---------- GET /api/facets ----------
// Distinct filter option values + counts, computed from the full
// (unfiltered) catalog so dropdowns always reflect what's really in the data.
app.get("/api/facets", (req, res) => {
  const rows = db
    .prepare(`SELECT manufacturer, architecture, communication, package_type, price_range FROM microcontrollers`)
    .all();

  const tally = (map, key) => map.set(key, (map.get(key) || 0) + 1);

  const manufacturers = new Map();
  const bitWidths = new Map();
  const protocols = new Map();
  const packages = new Map();
  const priceBuckets = new Map();

  for (const r of rows) {
    tally(manufacturers, r.manufacturer);
    tally(bitWidths, extractBitWidth(r.architecture));
    for (const c of r.communication.split(",")) tally(protocols, c.trim());
    for (const f of extractPackageFamilies(r.package_type)) tally(packages, f);
    tally(priceBuckets, extractPriceBucket(r.price_range));
  }

  const toSorted = (map) =>
    [...map.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([value, count]) => ({ value, count }));

  const bitWidthOrder = ["8-bit", "16-bit", "32-bit", "Other"];
  const priceBucketOrder = ["budget", "mid", "premium", "unknown"];

  res.json({
    manufacturers: toSorted(manufacturers),
    bitWidths: bitWidthOrder
      .filter((w) => bitWidths.has(w))
      .map((w) => ({ value: w, count: bitWidths.get(w) })),
    protocols: toSorted(protocols),
    packages: toSorted(packages),
    priceBuckets: priceBucketOrder
      .filter((p) => priceBuckets.has(p))
      .map((p) => ({ value: p, label: PRICE_BUCKET_LABELS[p] || p, count: priceBuckets.get(p) })),
  });
});

// ---------- GET /api/microcontrollers/:slug ----------
// Full detail for one microcontroller, including its pin list
app.get("/api/microcontrollers/:slug", (req, res) => {
  const mc = db
    .prepare("SELECT * FROM microcontrollers WHERE slug = ?")
    .get(req.params.slug);

  if (!mc) {
    return res.status(404).json({ error: "Microcontroller not found" });
  }

  const pins = db
    .prepare("SELECT pin_number, pin_name, pin_type, description FROM pins WHERE microcontroller_id = ? ORDER BY id ASC")
    .all(mc.id);

  res.json({
    ...mc,
    communication: mc.communication.split(","),
    pins,
  });
});

// ---------- GET /api/changelog ----------
// Full dated changelog, newest first (already stored in that order).
app.get("/api/changelog", (req, res) => {
  res.json(CHANGELOG);
});

// ---------- GET /api/meta ----------
// Lightweight catalog metadata for badges/footers — last-updated date and
// current totals — without pulling the full changelog or catalog.
app.get("/api/meta", (req, res) => {
  const { c: totalCount } = db.prepare("SELECT COUNT(*) AS c FROM microcontrollers").get();
  const { c: manufacturerCount } = db
    .prepare("SELECT COUNT(DISTINCT manufacturer) AS c FROM microcontrollers")
    .get();

  res.json({
    lastUpdated: CHANGELOG[0]?.date ?? null,
    totalCount,
    manufacturerCount,
  });
});

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`MC Explorer API running on http://localhost:${PORT}`);
});
