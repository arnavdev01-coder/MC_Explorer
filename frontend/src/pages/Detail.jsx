import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchMicrocontroller } from "../api";
import CopyButton from "../components/CopyButton";
import PinoutDiagram from "../components/PinoutDiagram";
import FavoriteButton from "../components/FavoriteButton";
import SimilarChips from "../components/SimilarChips";
import { useRecentlyViewed } from "../context/RecentlyViewedContext";
import { ChipGlyph, TraceGlyph } from "../components/icons";
import NotFound from "./NotFound";

const PIN_TYPE_STYLES = {
  power: "text-copper bg-copper/10 border-copper/30",
  ground: "text-muted bg-white/5 border-white/10",
  gpio: "text-silk bg-white/5 border-white/10",
  adc: "text-trace bg-trace/10 border-trace/30",
  pwm: "text-trace bg-trace/10 border-trace/30",
  comm: "text-copperLight bg-copper/10 border-copper/30",
  other: "text-muted bg-white/5 border-white/10",
};

function SpecRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
      <span className="text-xs text-muted font-mono uppercase tracking-wide">{label}</span>
      <span className="text-sm text-silk font-mono text-right">{value}</span>
    </div>
  );
}

export default function Detail() {
  const { slug } = useParams();
  const [mc, setMc] = useState(null);
  const [error, setError] = useState(null);
  const [activePin, setActivePin] = useState(null);
  const { addView } = useRecentlyViewed();

  useEffect(() => {
    setMc(null);
    setError(null);
    setActivePin(null);
    fetchMicrocontroller(slug).catch((e) => setError(e.message)).then((data) => data && setMc(data));
  }, [slug]);

  // Record the view once the chip actually loads (not on 404s/errors),
  // so the "Recently viewed" strip only ever links to real pages.
  useEffect(() => {
    if (!mc) return;
    addView({ slug: mc.slug, name: mc.name, manufacturer: mc.manufacturer, architecture: mc.architecture });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mc?.slug]);

  if (error === "Microcontroller not found") {
    return (
      <NotFound
        eyebrow={`// 404.${slug}`}
        title="No chip at this address."
        description={`We couldn't find a microcontroller matching "${slug}". It may have been renamed, removed, or the link is out of date.`}
      />
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <p className="font-mono text-danger">{error} — is the backend running on port 5000?</p>
        <Link to="/" className="text-copper text-sm mt-4 inline-block">← Back to catalog</Link>
      </div>
    );
  }

  if (!mc) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16">
        <p className="font-mono text-sm text-muted">Loading…</p>
      </div>
    );
  }

  return (
    <div>
      {/* ===== HERO (video background, same treatment as the home page) ===== */}
      <section className="relative min-h-[46vh] w-full overflow-hidden border-b border-white/5">
        <video
          className="hero-video absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          src="/hero-bg.mp4"
        />
        <div className="absolute inset-0 hero-flare" />
        <div className="absolute inset-0 hero-vignette" />
        <div className="absolute inset-0 grid-overlay" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-10 md:py-14">
          <Link to="/" className="site-nav-link font-mono text-xs">
            ← back to catalog
          </Link>

          <div className="mt-6 flex flex-col md:flex-row md:items-end md:justify-between gap-6 fade-up">
            <div>
              <p className="font-mono text-xs text-trace tracking-[0.2em] uppercase mb-2 flex items-center gap-2">
                <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-flare text-flare" />
                // {mc.manufacturer}
              </p>
              <h1 className="font-wide font-bold uppercase leading-[0.95] tracking-wide text-3xl md:text-5xl chrome-text">
                {mc.name}
              </h1>
              <p className="text-muted mt-4 max-w-2xl leading-relaxed">{mc.long_description}</p>
            </div>
            <div className="flex gap-3 shrink-0">
              <FavoriteButton
                mc={mc}
                className="btn-glass !border-0 rounded-full px-5 py-2 whitespace-nowrap"
              />
              <div className="flex items-center gap-1 btn-glass rounded-full pl-5 pr-2 py-2 whitespace-nowrap">
                <a
                  href={mc.datasheet_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs uppercase tracking-[0.15em] text-silk inline-flex items-center gap-1.5"
                >
                  <TraceGlyph />
                  Datasheet ↗
                </a>
                <span className="w-px h-4 bg-white/15 mx-1" aria-hidden="true" />
                <CopyButton text={mc.datasheet_url} label="Copy link" iconOnly className="text-silk/70" />
              </div>
              <div className="flex items-center gap-1 btn-solid font-medium text-sm pl-5 pr-2 py-2 rounded-full whitespace-nowrap">
                <a
                  href={mc.buy_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-center inline-flex items-center gap-1.5"
                >
                  <ChipGlyph />
                  Official product page →
                </a>
                <span className="w-px h-4 bg-board/20 mx-1" aria-hidden="true" />
                <CopyButton text={mc.buy_url} label="Copy link" iconOnly className="text-board/70 hover:text-board hover:bg-board/10" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Specs + Communication */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative md:col-span-2 bg-surface border border-white/5 rounded-md p-5">
          <div className="hud-corner tl" />
          <div className="hud-corner br" />
          <h2 className="font-display text-sm font-semibold text-silk uppercase tracking-wide mb-1">
            Specifications
          </h2>
          <SpecRow label="Architecture" value={mc.architecture} />
          <SpecRow label="Clock speed" value={mc.clock_speed} />
          <SpecRow label="Flash memory" value={mc.flash_memory} />
          <SpecRow label="RAM" value={mc.ram} />
          <SpecRow label="Operating voltage" value={mc.operating_voltage} />
          <SpecRow label="I/O pin count" value={mc.io_pins_count} />
          <SpecRow label="ADC channels" value={mc.adc_channels} />
          <SpecRow label="Package" value={mc.package_type} />
          <SpecRow label="Typical price" value={mc.price_range} />
        </div>

        <div className="relative bg-surface border border-white/5 rounded-md p-5">
          <div className="hud-corner tl" />
          <div className="hud-corner br" />
          <h2 className="font-display text-sm font-semibold text-silk uppercase tracking-wide mb-3">
            Communication
          </h2>
          <div className="flex flex-wrap gap-2">
            {mc.communication.map((c) => (
              <span
                key={c}
                className="font-mono text-xs uppercase tracking-wide text-flare bg-flare/10
                           border border-flare/30 rounded px-2 py-1"
              >
                {c}
              </span>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <a
              href={mc.datasheet_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-trace hover:text-trace/80 font-mono transition-colors"
            >
              View official datasheet ↗
            </a>
            <CopyButton text={mc.datasheet_url} label="Copy" />
          </div>
        </div>
      </div>

      {/* Visual pinout diagram */}
      <div className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="font-display text-sm font-semibold text-silk uppercase tracking-wide">
            Pinout diagram
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-wide text-muted">
            Schematic — pin 1 marked, click a pin to jump to its row
          </span>
        </div>
        <div className="relative bg-surface border border-white/5 rounded-md p-5">
          <div className="hud-corner tl" />
          <div className="hud-corner br" />
          <PinoutDiagram pins={mc.pins} activePin={activePin} onSelectPin={setActivePin} />
        </div>
      </div>

      {/* Pinout table */}
      <div className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="font-display text-sm font-semibold text-silk uppercase tracking-wide">
            Pinout — {mc.pins.length} pins documented
          </h2>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {Object.entries({
              power: "#00B8FF",
              ground: "#7F93B3",
              gpio: "#E8EEF7",
              adc: "#22D3EE",
              pwm: "#22D3EE",
              comm: "#5ED4FF",
              other: "#7F93B3",
            }).map(([type, color]) => (
              <span key={type} className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-muted">
                <span className="legend-dot" style={{ background: color, color }} />
                {type}
              </span>
            ))}
          </div>
        </div>
        <div className="bg-surface border border-white/5 rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left">
                <th className="font-mono text-xs text-muted uppercase tracking-wide font-medium px-4 py-3 w-20">Pin</th>
                <th className="font-mono text-xs text-muted uppercase tracking-wide font-medium px-4 py-3 w-40">Name</th>
                <th className="font-mono text-xs text-muted uppercase tracking-wide font-medium px-4 py-3 w-28">Type</th>
                <th className="font-mono text-xs text-muted uppercase tracking-wide font-medium px-4 py-3">Description</th>
                <th className="font-mono text-xs text-muted uppercase tracking-wide font-medium px-4 py-3 w-10">
                  <span className="sr-only">Copy</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {mc.pins.map((p, i) => (
                <tr
                  key={i}
                  onClick={() => setActivePin(p)}
                  className={`group/row border-b border-white/5 last:border-0 cursor-pointer transition-colors ${
                    activePin?.pin_number === p.pin_number ? "bg-flare/10" : "hover:bg-white/[0.02]"
                  }`}
                >
                  <td className="font-mono text-xs text-muted px-4 py-3">{p.pin_number}</td>
                  <td className="font-mono text-sm text-silk px-4 py-3">{p.pin_name}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`font-mono text-[10px] uppercase tracking-wide rounded px-1.5 py-0.5 border ${PIN_TYPE_STYLES[p.pin_type] || PIN_TYPE_STYLES.other}`}
                    >
                      {p.pin_type}
                    </span>
                  </td>
                  <td className="text-sm text-muted px-4 py-3 leading-relaxed">{p.description}</td>
                  <td className="px-4 py-3">
                    <CopyButton
                      text={p.pin_name}
                      label={`Copy pin ${p.pin_number} name`}
                      iconOnly
                      className="opacity-40 group-hover/row:opacity-100"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <SimilarChips mc={mc} />
      </div>
    </div>
  );
}
