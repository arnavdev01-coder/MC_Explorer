// Client-side mirrors of the derived-facet helpers in backend/server.js
// (extractBitWidth / extractPriceBucket). Kept in sync by hand — these are
// only used for approximate similarity matching on the Detail page, where
// we already have the raw architecture/price_range strings on hand and
// don't want a second API round trip just to get the same buckets the
// list endpoint already computes server-side.

export function extractBitWidth(architecture) {
  const m = String(architecture || "").match(/^(\d+)-bit/i);
  return m ? `${m[1]}-bit` : "Other";
}

export function extractPriceAvg(priceRange) {
  const nums = (String(priceRange || "").match(/[\d,]+/g) || []).map((n) =>
    Number(n.replace(/,/g, ""))
  );
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function extractPriceBucket(priceRange) {
  const avg = extractPriceAvg(priceRange);
  if (avg === null) return "unknown";
  if (avg < 150) return "budget";
  if (avg < 500) return "mid";
  return "premium";
}
