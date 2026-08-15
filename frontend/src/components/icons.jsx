// Small monoline SVG glyphs styled after real electronic components,
// used as understated icon accents on buttons and feature panels — same
// stroke weight/currentColor treatment as the rest of the site's
// iconography (CopyButton, ChipMark). Kept deliberately to a handful of
// shapes, reused consistently rather than inventing a new icon per spot.
// Each accepts an optional `size` (default matches original button-scale)
// so the same glyph can be dropped into a larger feature-card slot too.

// A simplified IC package — "browse/explore the catalog" actions.
export function ChipGlyph({ className = "", size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
      <rect x="7" y="7" width="10" height="10" rx="1.2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9.5 7V4M14.5 7V4M9.5 20v-3M14.5 20v-3M7 9.5H4M7 14.5H4M20 9.5h-3M20 14.5h-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

// A resistor zigzag with leads — "pick/discover a chip" actions.
export function ResistorGlyph({ className = "", size = 10 }) {
  const width = Math.round(size * 1.75);
  return (
    <svg width={width} height={size} viewBox="0 0 28 16" fill="none" className={`shrink-0 ${className}`}>
      <path
        d="M1 8h4l2-5 4 10 4-10 4 10 4-10 2 5h3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Two parallel plates with leads — a capacitor, doubling as a natural
// "two things side by side" mark for comparison actions.
export function CapacitorGlyph({ className = "", size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
      <path
        d="M2 12h6M16 12h6M9 4v16M15 4v16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

// A row of header pins — pinout/pin-mapping features.
export function PinRowGlyph({ className = "", size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
      <rect x="3" y="10" width="18" height="5" rx="1" stroke="currentColor" strokeWidth="1.8" />
      <path d="M6 10V5M10.5 10V5M14 10V5M18 10V5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

// A PCB trace with a via — export/data-flow features.
export function TraceGlyph({ className = "", size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
      <path d="M3 6h6l4 4h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 18h9l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="19" cy="6" r="1.6" fill="currentColor" />
      <circle cx="5" cy="18" r="1.6" fill="currentColor" />
    </svg>
  );
}

// An outlined star — mirrors the FavoriteButton glyph, for feature panels
// that reference saving/favoriting without needing the interactive button.
export function StarGlyph({ className = "", size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" className={`shrink-0 ${className}`}>
      <path d="M12 3.5l2.76 5.59 6.17.9-4.46 4.35 1.05 6.14L12 17.6l-5.52 2.9 1.05-6.14L3.07 10l6.17-.9L12 3.5z" />
    </svg>
  );
}
