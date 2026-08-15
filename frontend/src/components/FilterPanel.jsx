// Faceted filter panel for the catalog grid. Each facet is a multi-select
// set of pills/checkboxes backed by an array in the parent's filter state;
// values and counts come from /api/facets so options always reflect what's
// actually in the catalog.

import { useState } from "react";

function Pill({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`font-mono text-[10px] uppercase tracking-[0.12em] rounded-full px-3 py-1.5 border transition-all ${
        active
          ? "text-board bg-flare border-flare shadow-[0_0_14px_-2px_rgba(56,189,248,0.75)]"
          : "text-muted border-white/10 hover:border-flare/50 hover:text-silk"
      }`}
    >
      {children}
    </button>
  );
}

function FacetSection({ title, children }) {
  // Every facet gets an identical box: same height, same padding, same
  // title position — so the whole panel reads as one aligned grid instead
  // of columns of differing height. `children` is expected to end in a
  // `flex-1 min-h-0` scroll area so content never grows the box itself.
  return (
    <div className="flex flex-col h-48 bg-board/40 border border-white/5 rounded-md px-4 py-3.5">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-trace mb-3 shrink-0">
        {title}
      </p>
      <div className="flex-1 min-h-0 flex flex-col">{children}</div>
    </div>
  );
}

// Scrollable pill list shared by every facet section — identical padding,
// gap, and scrollbar treatment so the only thing that differs is content.
function PillList({ children }) {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto neon-scroll pr-1.5 flex flex-wrap content-start gap-2">
      {children}
    </div>
  );
}

function toggleValue(list, value) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

const SORT_OPTIONS = [
  { value: "name:asc", label: "Name (A–Z)" },
  { value: "name:desc", label: "Name (Z–A)" },
  { value: "price:asc", label: "Price: Low to High" },
  { value: "price:desc", label: "Price: High to Low" },
  { value: "clock:desc", label: "Clock Speed: High to Low" },
  { value: "clock:asc", label: "Clock Speed: Low to High" },
  { value: "pins:desc", label: "I/O Pins: High to Low" },
  { value: "pins:asc", label: "I/O Pins: Low to High" },
];

export default function FilterPanel({ facets, filters, setFilters, sort, setSort, resultCount, onClear }) {
  const [manufacturerQuery, setManufacturerQuery] = useState("");

  if (!facets) return null;

  const activeCount =
    filters.communication.length +
    filters.architecture.length +
    filters.manufacturer.length +
    filters.pkg.length +
    filters.price.length;

  const set = (key) => (value) =>
    setFilters((prev) => ({ ...prev, [key]: toggleValue(prev[key], value) }));

  const visibleManufacturers = facets.manufacturers.filter((f) =>
    f.value.toLowerCase().includes(manufacturerQuery.trim().toLowerCase())
  );

  return (
    <div className="relative bg-surface border border-white/5 rounded-md p-5">
      <div className="hud-corner tl" />
      <div className="hud-corner br" />

      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="font-display text-sm font-semibold text-silk uppercase tracking-wide">
          Filters
        </h3>
        <div className="flex items-center gap-4 flex-wrap">
          <p className="font-mono text-[11px] text-muted">{resultCount} matching chips</p>
          <label className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wide text-muted">Sort</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-board/60 border border-white/10 focus:border-flare/60 focus:outline-none
                         rounded-md pl-2.5 pr-7 py-1.5 text-[11px] font-mono text-silk transition-all
                         cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-board text-silk">
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="font-mono text-[10px] uppercase tracking-wide text-muted hover:text-flare transition-colors"
            >
              Clear ({activeCount})
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <FacetSection title="Architecture">
          <PillList>
            {facets.bitWidths.map((f) => (
              <Pill key={f.value} active={filters.architecture.includes(f.value)} onClick={() => set("architecture")(f.value)}>
                {f.value} <span className="opacity-60">({f.count})</span>
              </Pill>
            ))}
          </PillList>
        </FacetSection>

        <FacetSection title="Communication">
          <PillList>
            {facets.protocols.map((f) => (
              <Pill key={f.value} active={filters.communication.includes(f.value)} onClick={() => set("communication")(f.value)}>
                {f.value} <span className="opacity-60">({f.count})</span>
              </Pill>
            ))}
          </PillList>
        </FacetSection>

        <FacetSection title="Price">
          <PillList>
            {facets.priceBuckets.map((f) => (
              <Pill key={f.value} active={filters.price.includes(f.value)} onClick={() => set("price")(f.value)}>
                {f.label} <span className="opacity-60">({f.count})</span>
              </Pill>
            ))}
          </PillList>
        </FacetSection>

        <FacetSection title="Package">
          <PillList>
            {facets.packages.map((f) => (
              <Pill key={f.value} active={filters.pkg.includes(f.value)} onClick={() => set("pkg")(f.value)}>
                {f.value} <span className="opacity-60">({f.count})</span>
              </Pill>
            ))}
          </PillList>
        </FacetSection>

        <FacetSection title="Manufacturer">
          <input
            type="text"
            value={manufacturerQuery}
            onChange={(e) => setManufacturerQuery(e.target.value)}
            placeholder="Search manufacturers…"
            className="w-full mb-2.5 shrink-0 bg-board/60 border border-white/10 focus:border-flare/60
                       focus:outline-none rounded-md px-2.5 py-1.5 text-[11px] font-mono
                       text-silk placeholder:text-muted transition-all"
          />
          <PillList>
            {visibleManufacturers.length === 0 && (
              <p className="font-mono text-[11px] text-muted">No matches</p>
            )}
            {visibleManufacturers.map((f) => (
              <Pill key={f.value} active={filters.manufacturer.includes(f.value)} onClick={() => set("manufacturer")(f.value)}>
                {f.value} <span className="opacity-60">({f.count})</span>
              </Pill>
            ))}
          </PillList>
        </FacetSection>
      </div>
    </div>
  );
}
