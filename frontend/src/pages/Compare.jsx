import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchMicrocontroller } from "../api";
import { useCompare } from "../context/CompareContext";
import CopyButton from "../components/CopyButton";
import { ChipGlyph } from "../components/icons";

const SPEC_ROWS = [
  { label: "Architecture", key: "architecture" },
  { label: "Clock speed", key: "clock_speed" },
  { label: "Flash memory", key: "flash_memory" },
  { label: "RAM", key: "ram" },
  { label: "Operating voltage", key: "operating_voltage" },
  { label: "I/O pin count", key: "io_pins_count" },
  { label: "ADC channels", key: "adc_channels" },
  { label: "Package", key: "package_type" },
  { label: "Typical price", key: "price_range" },
];

function ChipColumnHeader({ mc, onRemove }) {
  return (
    <div className="relative bg-surface border border-white/5 rounded-md p-5">
      <div className="hud-corner tl" />
      <div className="hud-corner br" />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-xs text-trace tracking-[0.15em] uppercase mb-1 truncate">
            {mc.manufacturer}
          </p>
          <h2 className="font-display text-lg font-semibold text-silk truncate">{mc.name}</h2>
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${mc.name} from comparison`}
          className="w-7 h-7 shrink-0 flex items-center justify-center rounded-full border border-white/10 text-muted hover:text-danger hover:border-danger/40 transition-colors"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <Link
        to={`/mc/${mc.slug}`}
        className="mt-3 inline-flex items-center gap-1.5 font-mono text-[11px] text-muted hover:text-silk transition-colors"
      >
        View full detail page ↗
      </Link>
    </div>
  );
}

export default function Compare() {
  const { items, remove } = useCompare();
  const [details, setDetails] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    Promise.all(items.map((it) => fetchMicrocontroller(it.slug)))
      .then((results) => {
        if (cancelled) return;
        const map = {};
        results.forEach((mc) => (map[mc.slug] = mc));
        setDetails(map);
      })
      .catch((e) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [items]);

  if (items.length < 2) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <p className="font-mono text-xs text-trace tracking-[0.2em] uppercase mb-3">// compare</p>
        <h1 className="font-display text-2xl font-semibold text-silk">
          Pick two chips to compare
        </h1>
        <p className="text-muted mt-3 leading-relaxed">
          {items.length === 1
            ? `${items[0].name} is selected. Head back to the catalog and hit "Compare" on one more chip.`
            : `Head back to the catalog and hit "Compare" on any two chips to see them side by side.`}
        </p>
        <Link
          to="/#catalog"
          className="btn-glass inline-flex items-center gap-2 rounded-full px-6 py-2.5 mt-7 font-mono text-xs uppercase tracking-[0.15em] text-silk"
        >
          <ChipGlyph />
          Browse catalog <span aria-hidden="true">→</span>
        </Link>
      </div>
    );
  }

  const [a, b] = items;
  const mcA = details[a.slug];
  const mcB = details[b.slug];

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <p className="font-mono text-danger">{error}</p>
      </div>
    );
  }

  if (!mcA || !mcB) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <p className="font-mono text-sm text-muted">Loading comparison…</p>
      </div>
    );
  }

  const commA = new Set(mcA.communication);
  const commB = new Set(mcB.communication);
  const shared = [...commA].filter((c) => commB.has(c));
  const onlyA = [...commA].filter((c) => !commB.has(c));
  const onlyB = [...commB].filter((c) => !commA.has(c));

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <p className="font-mono text-xs text-trace tracking-[0.2em] uppercase mb-2">// compare</p>
      <h1 className="font-display text-2xl md:text-3xl font-semibold text-silk mb-8">
        {mcA.name} <span className="text-muted font-normal">vs</span> {mcB.name}
      </h1>

      {/* Chip headers */}
      <div className="grid grid-cols-2 gap-6">
        <ChipColumnHeader mc={mcA} onRemove={() => remove(mcA.slug)} />
        <ChipColumnHeader mc={mcB} onRemove={() => remove(mcB.slug)} />
      </div>

      {/* Spec comparison table */}
      <div className="relative mt-8 bg-surface border border-white/5 rounded-md overflow-hidden">
        <div className="hud-corner tl" />
        <div className="hud-corner br" />
        <div className="px-5 pt-5 pb-1 flex items-center justify-between">
          <h2 className="font-display text-sm font-semibold text-silk uppercase tracking-wide">
            Specifications
          </h2>
          <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-muted">
            <span className="legend-dot" style={{ background: "#38BDF8", color: "#38BDF8" }} />
            Differs
          </span>
        </div>
        <table className="w-full text-sm mt-2">
          <tbody>
            {SPEC_ROWS.map((row) => {
              const valA = mcA[row.key];
              const valB = mcB[row.key];
              const differs = String(valA) !== String(valB);
              return (
                <tr key={row.key} className="border-t border-white/5">
                  <td className="font-mono text-xs text-muted uppercase tracking-wide px-5 py-3 w-1/3">
                    {row.label}
                  </td>
                  <td
                    className={`font-mono text-sm px-5 py-3 w-1/3 ${
                      differs ? "text-flare bg-flare/5" : "text-silk"
                    }`}
                  >
                    {valA}
                  </td>
                  <td
                    className={`font-mono text-sm px-5 py-3 w-1/3 ${
                      differs ? "text-flare bg-flare/5" : "text-silk"
                    }`}
                  >
                    {valB}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Communication comparison */}
      <div className="relative mt-8 bg-surface border border-white/5 rounded-md p-5">
        <div className="hud-corner tl" />
        <div className="hud-corner br" />
        <h2 className="font-display text-sm font-semibold text-silk uppercase tracking-wide mb-4">
          Communication
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wide text-muted mb-2">Shared</p>
            <div className="flex flex-wrap gap-1.5">
              {shared.length === 0 && <span className="text-xs text-muted">None</span>}
              {shared.map((c) => (
                <span key={c} className="font-mono text-xs uppercase tracking-wide text-trace bg-trace/10 border border-trace/30 rounded px-2 py-1">
                  {c}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wide text-muted mb-2 truncate">
              Only on {mcA.name}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {onlyA.length === 0 && <span className="text-xs text-muted">—</span>}
              {onlyA.map((c) => (
                <span key={c} className="font-mono text-xs uppercase tracking-wide text-flare bg-flare/10 border border-flare/30 rounded px-2 py-1">
                  {c}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wide text-muted mb-2 truncate">
              Only on {mcB.name}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {onlyB.length === 0 && <span className="text-xs text-muted">—</span>}
              {onlyB.map((c) => (
                <span key={c} className="font-mono text-xs uppercase tracking-wide text-flare bg-flare/10 border border-flare/30 rounded px-2 py-1">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pinout summary + links to full tables */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
        {[mcA, mcB].map((mc) => (
          <div key={mc.slug} className="relative bg-surface border border-white/5 rounded-md p-5">
            <div className="hud-corner tl" />
            <div className="hud-corner br" />
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-sm font-semibold text-silk uppercase tracking-wide">
                {mc.name} pinout
              </h2>
              <span className="font-mono text-xs text-muted">{mc.pins.length} pins</span>
            </div>
            <div className="flex items-center justify-between">
              <Link
                to={`/mc/${mc.slug}`}
                className="text-sm text-trace hover:text-trace/80 font-mono transition-colors"
              >
                View full pin-by-pin table ↗
              </Link>
              <CopyButton text={mc.datasheet_url} label="Copy datasheet link" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
