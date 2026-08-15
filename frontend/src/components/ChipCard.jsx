import { Link } from "react-router-dom";
import { useCompare } from "../context/CompareContext";
import FavoriteButton from "./FavoriteButton";

// Renders a microcontroller as a stylised IC package: a body with pin
// nubs along the left/right edges, echoing how the real chip looks on a board.
export default function ChipCard({ mc }) {
  const pinsPerSide = 6;
  const { isSelected, toggle } = useCompare();
  const selected = isSelected(mc.slug);

  const handleToggleCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggle({ slug: mc.slug, name: mc.name, manufacturer: mc.manufacturer, architecture: mc.architecture });
  };

  // Note: the compare toggle is a <button>, so the card can't be a single
  // <Link> wrapping everything (a button inside an anchor is invalid HTML
  // and breaks click targeting). Instead we use the "stretched link"
  // pattern: an absolutely-positioned Link covers the whole card and
  // handles navigation, while the content sits above it with
  // pointer-events disabled except on the compare button itself.
  return (
    <div
      className={`group relative rounded-md bg-surface border transition-colors duration-200 p-5
                 hover:shadow-[0_0_0_1px_rgba(56,189,248,0.35),0_8px_28px_-8px_rgba(56,189,248,0.3)]
                 ${selected ? "border-flare/60" : "border-white/5 hover:border-flare/50"}`}
    >
      <Link
        to={`/mc/${mc.slug}`}
        className="absolute inset-0 z-0 rounded-md"
        aria-label={`View details for ${mc.name}`}
      />

      {/* left pin nubs — one lights up cyan on hover, like an energized trace */}
      <div className="absolute -left-[6px] top-5 flex flex-col gap-[7px] pointer-events-none">
        {Array.from({ length: pinsPerSide }).map((_, i) => (
          <span key={i} className={`pin-nub ${i === 2 ? "pin-nub-flare" : ""}`} />
        ))}
      </div>
      {/* right pin nubs */}
      <div className="absolute -right-[6px] top-5 flex flex-col gap-[7px] pointer-events-none">
        {Array.from({ length: pinsPerSide }).map((_, i) => (
          <span key={i} className={`pin-nub ${i === 3 ? "pin-nub-copper" : ""}`} />
        ))}
      </div>

      <div className="relative z-[1] pointer-events-none">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-xs text-muted tracking-wide uppercase">
              {mc.manufacturer}
            </p>
            <h3 className="font-display text-lg font-semibold text-silk mt-0.5">
              {mc.name}
            </h3>
          </div>
          <span className="font-mono text-[10px] text-trace border border-trace/30 rounded px-1.5 py-0.5 whitespace-nowrap">
            {mc.architecture.split(" ")[0]}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-3">
          <button
            type="button"
            onClick={handleToggleCompare}
            aria-pressed={selected}
            className={`pointer-events-auto relative z-10 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide
                        rounded px-2 py-1 border transition-all ${
                          selected
                            ? "text-board bg-flare border-flare shadow-[0_0_12px_-2px_rgba(56,189,248,0.8)]"
                            : "text-muted border-white/10 hover:border-flare/50 hover:text-silk"
                        }`}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              {selected ? (
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              )}
            </svg>
            {selected ? "Added to compare" : "Compare"}
          </button>

          <FavoriteButton mc={mc} iconOnly className="pointer-events-auto relative z-10" />
        </div>

        <p className="text-sm text-muted mt-3 leading-relaxed">{mc.short_description}</p>

        <div className="flex flex-wrap gap-1.5 mt-4">
          {mc.communication.slice(0, 4).map((c) => (
            <span
              key={c}
              className="font-mono text-[10px] uppercase tracking-wide text-copper/90 bg-copper/10 rounded px-1.5 py-0.5"
            >
              {c}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5 font-mono text-xs text-muted">
          <span>{mc.clock_speed}</span>
          <span>{mc.io_pins_count} I/O pins</span>
        </div>
      </div>
    </div>
  );
}
