import { useNavigate } from "react-router-dom";
import { useCompare } from "../context/CompareContext";
import { CapacitorGlyph } from "./icons";

// Persistent floating bar, appears once at least one chip is selected
// for comparison. Lets the user see both picks, remove one, clear the
// selection, or jump into the side-by-side Compare view once 2 are picked.
export default function CompareBar() {
  const { items, remove, clear, max } = useCompare();
  const navigate = useNavigate();

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-lg fade-up">
      <div className="hud-card rounded-lg px-5 py-4 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-flare text-flare shrink-0" />
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted shrink-0">
              Compare ({items.length}/{max})
            </span>
          </div>
          <button
            type="button"
            onClick={clear}
            className="font-mono text-[10px] uppercase tracking-wide text-muted hover:text-silk transition-colors shrink-0"
          >
            Clear
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-3">
          {items.map((it) => (
            <span
              key={it.slug}
              className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full pl-3 pr-1.5 py-1"
            >
              <span className="font-display text-xs text-silk">{it.name}</span>
              <button
                type="button"
                onClick={() => remove(it.slug)}
                aria-label={`Remove ${it.name} from comparison`}
                className="w-4 h-4 flex items-center justify-center rounded-full text-muted hover:text-danger hover:bg-danger/10 transition-colors"
              >
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>
            </span>
          ))}
          {Array.from({ length: Math.max(0, max - items.length) }).map((_, i) => (
            <span
              key={`empty-${i}`}
              className="font-mono text-[10px] uppercase tracking-wide text-muted/60 border border-dashed border-white/10 rounded-full px-3 py-1.5"
            >
              Pick a chip
            </span>
          ))}
        </div>

        <button
          type="button"
          disabled={items.length < 2}
          onClick={() => navigate("/compare")}
          className="btn-solid w-full mt-4 font-medium text-sm py-2.5 rounded-full text-center
                     inline-flex items-center justify-center gap-2
                     disabled:opacity-30 disabled:pointer-events-none"
        >
          <CapacitorGlyph />
          Compare now →
        </button>
      </div>
    </div>
  );
}
