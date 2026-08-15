import { Link } from "react-router-dom";
import { useRecentlyViewed } from "../context/RecentlyViewedContext";

// Quick-backtrack row of the last few chips the user opened. Lives above
// the catalog grid; renders nothing until there's history, so it never
// costs first-time visitors any space.
export default function RecentlyViewedStrip() {
  const { items, clear } = useRecentlyViewed();

  if (items.length === 0) return null;

  return (
    <div className="relative bg-surface border border-white/5 rounded-md px-4 py-3.5">
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-trace">
          Recently viewed
        </p>
        <button
          type="button"
          onClick={clear}
          className="font-mono text-[10px] uppercase tracking-wide text-muted hover:text-flare transition-colors"
        >
          Clear
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((it) => (
          <Link
            key={it.slug}
            to={`/mc/${it.slug}`}
            className="inline-flex items-center gap-2 bg-board/40 border border-white/10 hover:border-flare/50
                       rounded-full pl-3 pr-3 py-1.5 transition-colors group"
          >
            <span className="font-display text-xs text-silk group-hover:text-flare transition-colors">
              {it.name}
            </span>
            <span className="font-mono text-[10px] text-muted uppercase tracking-wide">
              {it.manufacturer}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
