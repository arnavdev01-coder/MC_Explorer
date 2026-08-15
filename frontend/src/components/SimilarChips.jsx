import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchMicrocontrollers } from "../api";
import { extractPriceBucket } from "../lib/facets";

const SIMILAR_COUNT = 4;

// Scores every other catalog entry against the current chip and returns
// the top matches. Weighted so an exact architecture match (e.g. both
// "32-bit ARM Cortex-M4") counts for more than just sharing a
// manufacturer, which in turn counts for more than landing in the same
// price bucket alone.
function scoreCandidate(mc, candidate) {
  let score = 0;
  if (candidate.architecture === mc.architecture) score += 3;
  if (candidate.manufacturer === mc.manufacturer) score += 2;
  if (candidate.price_bucket === extractPriceBucket(mc.price_range)) score += 1;
  return score;
}

export default function SimilarChips({ mc }) {
  const [similar, setSimilar] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setSimilar(null);
    setError(false);
    fetchMicrocontrollers({})
      .then((all) => {
        if (cancelled) return;
        const ranked = all
          .filter((c) => c.slug !== mc.slug)
          .map((c) => ({ ...c, _score: scoreCandidate(mc, c) }))
          .filter((c) => c._score > 0)
          .sort((a, b) => b._score - a._score || a.name.localeCompare(b.name))
          .slice(0, SIMILAR_COUNT);
        setSimilar(ranked);
      })
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [mc.slug, mc.architecture, mc.manufacturer, mc.price_range]);

  if (error || (similar && similar.length === 0)) return null;

  return (
    <div className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="font-display text-sm font-semibold text-silk uppercase tracking-wide">
          Similar chips
        </h2>
        <span className="font-mono text-[10px] uppercase tracking-wide text-muted">
          Matched by architecture, manufacturer &amp; price
        </span>
      </div>

      {!similar && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: SIMILAR_COUNT }).map((_, i) => (
            <div key={i} className="h-[104px] bg-surface border border-white/5 rounded-md animate-pulse" />
          ))}
        </div>
      )}

      {similar && similar.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {similar.map((c) => (
            <Link
              key={c.slug}
              to={`/mc/${c.slug}`}
              className="relative bg-surface border border-white/5 hover:border-flare/50 rounded-md p-4
                         transition-colors duration-200 group"
            >
              <p className="font-mono text-[10px] text-muted tracking-wide uppercase truncate">
                {c.manufacturer}
              </p>
              <h3 className="font-display text-sm font-semibold text-silk mt-0.5 truncate group-hover:text-flare transition-colors">
                {c.name}
              </h3>
              <p className="font-mono text-[10px] text-muted mt-2 uppercase tracking-wide truncate">
                {c.architecture}
              </p>
              <div className="flex items-center justify-between mt-2.5 font-mono text-[10px] text-muted">
                <span>{c.clock_speed}</span>
                <span>{c.io_pins_count} I/O</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
