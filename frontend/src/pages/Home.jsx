import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { fetchMicrocontrollers, fetchFacets, fetchMeta } from "../api";
import ChipCard from "../components/ChipCard";
import ChipCardSkeleton from "../components/ChipCardSkeleton";
import FilterPanel from "../components/FilterPanel";
import RecentlyViewedStrip from "../components/RecentlyViewedStrip";
import ExportButton from "../components/ExportButton";
import useSequentialVideo from "../hooks/useSequentialVideo";
import { ChipGlyph, CapacitorGlyph, ResistorGlyph, PinRowGlyph, TraceGlyph, StarGlyph } from "../components/icons";

// Hero background plays these back-to-back, then loops from the top —
// so the preexisting board footage and the new macro chip footage read
// as one continuous reel instead of either one repeating alone.
const HERO_VIDEOS = ["/hero-bg.mp4", "/chip-macro.mp4"];

// Animated count-up used by the metrics strip under the hero.
function Counter({ target, suffix = "" }) {
  const ref = useRef(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const duration = 1400;
          const start = performance.now();
          function tick(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(tick);
            else setValue(target);
          }
          requestAnimationFrame(tick);
          observer.unobserve(el);
        });
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref} className="font-wide font-bold text-2xl chrome-text">
      {value}
      {suffix}
    </span>
  );
}

const QUICK_PROTOCOLS = ["WiFi", "BLE", "USB", "CAN", "I2C", "SPI"];

// Toolkit panel shown between the hero and the catalog — a quick map of
// everything the site can do, each card linking straight into that part
// of the app (catalog anchor for in-page ones, a route for the rest).
const FEATURE_PANELS = [
  {
    title: "Compare side-by-side",
    description: "Line up two chips' specs, communication interfaces, and pinouts to see exactly where they differ.",
    cta: "Open comparison",
    to: "/compare",
    icon: CapacitorGlyph,
  },
  {
    title: "Save favorites",
    description: "Star chips as you browse and come back to a shortlist without re-running your search.",
    cta: "View favorites",
    to: "/favorites",
    icon: StarGlyph,
  },
  {
    title: "Datasheet-verified pinouts",
    description: "Every chip includes a full pin-by-pin breakdown, checked against the manufacturer's datasheet.",
    cta: "Browse catalog",
    anchor: true,
    icon: PinRowGlyph,
  },
  {
    title: "Export filtered results",
    description: "Grab whatever you've filtered down to as CSV or JSON — ready for a spec sheet or a BOM.",
    cta: "Browse catalog",
    anchor: true,
    icon: TraceGlyph,
  },
  {
    title: "Pick up where you left off",
    description: "Recently viewed chips stay one click away, right above the catalog.",
    cta: "Browse catalog",
    anchor: true,
    icon: ResistorGlyph,
  },
  {
    title: "Track dataset changes",
    description: "See what's been added, updated, or corrected in the catalog over time.",
    cta: "View changelog",
    to: "/changelog",
    icon: ChipGlyph,
  },
];

// Maps our internal filter keys to the query-param names used in the URL
// (and sent to the API) — "pkg" avoids shadowing the JS keyword but reads
// as "package" everywhere a human sees it.
const FILTER_PARAM_KEYS = {
  communication: "communication",
  architecture: "architecture",
  manufacturer: "manufacturer",
  pkg: "package",
  price: "price",
};

const PAGE_SIZE = 9;
const SKELETON_COUNT = 6;

function formatUpdatedDate(iso) {
  if (!iso) return null;
  try {
    return new Date(`${iso}T00:00:00Z`).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  } catch {
    return iso;
  }
}

function csvParam(searchParams, key) {
  const raw = searchParams.get(key);
  return raw ? raw.split(",").filter(Boolean) : [];
}

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const heroVideoRef = useSequentialVideo(HERO_VIDEOS);

  const [mcs, setMcs] = useState([]);
  const [totalCount, setTotalCount] = useState(null);
  const [manufacturerCount, setManufacturerCount] = useState(null);
  const [facets, setFacets] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // The URL is the source of truth for search/filters/sort, so the app
  // stays in sync on refresh, on a shared link, and with the browser's
  // back/forward buttons.
  const search = searchParams.get("q") || "";
  const sort = searchParams.get("sort") || "name:asc";
  const filters = useMemo(
    () => ({
      communication: csvParam(searchParams, "communication"),
      architecture: csvParam(searchParams, "architecture"),
      manufacturer: csvParam(searchParams, "manufacturer"),
      pkg: csvParam(searchParams, "package"),
      price: csvParam(searchParams, "price"),
    }),
    [searchParams]
  );

  // Merge a partial update into the URL's query params. Empty/absent
  // values are removed entirely so the URL stays clean (no "?q=&sort=...").
  const updateParams = (updates, { replace = false } = {}) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(updates).forEach(([key, value]) => {
          const isEmpty = value == null || value === "" || (Array.isArray(value) && value.length === 0);
          if (isEmpty) next.delete(key);
          else next.set(key, Array.isArray(value) ? value.join(",") : value);
        });
        return next;
      },
      { replace }
    );
  };

  // Local, immediately-responsive text for the search box. It debounces
  // into the URL (and from there into the fetch) so typing doesn't spam
  // browser history or fire a request per keystroke.
  const [searchInput, setSearchInput] = useState(search);

  // Keep the input in sync when the URL changes from outside typing —
  // e.g. the user hits back/forward, or clears filters, or shares a link.
  useEffect(() => {
    setSearchInput((current) => (current === search ? current : search));
  }, [search]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchInput !== search) updateParams({ q: searchInput }, { replace: true });
    }, 200);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  // Re-fetch whenever the URL's search/filter/sort state changes. Reset
  // pagination too, so a new filter always starts back at page one.
  useEffect(() => {
    setLoading(true);
    setError(null);
    setVisibleCount(PAGE_SIZE);
    const params = {};
    if (search) params.search = search;
    if (filters.communication.length) params.communication = filters.communication.join(",");
    if (filters.architecture.length) params.architecture = filters.architecture.join(",");
    if (filters.manufacturer.length) params.manufacturer = filters.manufacturer.join(",");
    if (filters.pkg.length) params.package = filters.pkg.join(",");
    if (filters.price.length) params.price = filters.price.join(",");
    params.sort = sort;
    fetchMicrocontrollers(params)
      .then(setMcs)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sort, JSON.stringify(filters)]);

  // Fetch the unfiltered catalog once, just to power the hero's total-count
  // stats, independent of whatever the user is currently searching for.
  useEffect(() => {
    fetchMicrocontrollers({})
      .then((all) => {
        setTotalCount(all.length);
        setManufacturerCount(new Set(all.map((mc) => mc.manufacturer)).size);
      })
      .catch(() => {});
    fetchFacets().then(setFacets).catch(() => {});
    fetchMeta().then((m) => setLastUpdated(m.lastUpdated)).catch(() => {});
  }, []);

  // If we've arrived at "/#catalog" from another page (e.g. the 404 page's
  // search/browse links), jump straight to the catalog section.
  useEffect(() => {
    if (window.location.hash === "#catalog") {
      document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  // Adapter so FilterPanel can keep using its existing `setFilters(prev => ...)`
  // callback API while the real state now lives in the URL.
  const setFilters = (updater) => {
    const next = typeof updater === "function" ? updater(filters) : updater;
    const updates = {};
    Object.entries(FILTER_PARAM_KEYS).forEach(([filterKey, paramKey]) => {
      updates[paramKey] = next[filterKey];
    });
    updateParams(updates);
  };

  const setSort = (value) => updateParams({ sort: value });

  const clearFilters = () => {
    const updates = {};
    Object.values(FILTER_PARAM_KEYS).forEach((paramKey) => {
      updates[paramKey] = [];
    });
    updateParams(updates);
  };

  const toggleProtocol = (p) => {
    const next = filters.communication.includes(p)
      ? filters.communication.filter((c) => c !== p)
      : [...filters.communication, p];
    updateParams({ communication: next });
  };

  const scrollToCatalog = (e) => {
    e.preventDefault();
    document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
  };

  const visibleMcs = mcs.slice(0, visibleCount);
  const hasMore = visibleCount < mcs.length;

  return (
    <div>
      {/* ===== HERO ===== */}
      <section className="relative min-h-[86vh] w-full overflow-hidden border-b border-white/5">
        {/* Background video — plays hero-bg.mp4, then chip-macro.mp4 right
            after it finishes, then wraps back to hero-bg.mp4 forever. */}
        <video
          ref={heroVideoRef}
          className="hero-video absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          playsInline
          src="/hero-bg.mp4"
        />
        <div className="absolute inset-0 hero-flare" />
        <div className="absolute inset-0 hero-vignette" />
        <div className="absolute inset-0 grid-overlay" />

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-10 items-center min-h-[86vh] py-16">
            {/* Left: copy + search */}
            <div className="lg:col-span-7 fade-up">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-8 h-px bg-white/30" />
                <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-trace">
                  // reference.catalog
                </span>
                <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-flare text-flare" />
              </div>

              <h1 className="font-wide font-bold uppercase leading-[0.95] tracking-wide text-[2.2rem] sm:text-4xl md:text-5xl lg:text-[3.6rem]">
                <span className="block chrome-text">Every Chip.</span>
                <span className="block text-muted">One Pinout Away.</span>
              </h1>

              <p className="mt-7 max-w-md font-body font-light text-muted text-base leading-relaxed">
                Specs, communication interfaces, and full pin-by-pin
                breakdowns — built for picking the right microcontroller
                before you commit a design to a PCB.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-5">
                <a
                  href="#catalog"
                  onClick={scrollToCatalog}
                  className="btn-outline inline-flex items-center gap-2 border border-white/25 px-7 py-3.5 font-mono text-xs uppercase tracking-[0.15em] text-silk transition-colors duration-300"
                >
                  <ChipGlyph />
                  Browse Catalog <span aria-hidden="true">→</span>
                </a>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 group"
                >
                  <span className="w-11 h-11 rounded-full border border-white/25 flex items-center justify-center group-hover:border-copper/70 transition-colors">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M7 17L17 7M17 7H8M17 7V16" />
                    </svg>
                  </span>
                  <span className="font-mono text-xs uppercase tracking-[0.15em] text-muted group-hover:text-silk transition-colors">
                    View Source
                  </span>
                </a>
              </div>

              {/* Search */}
              <div className="mt-10 max-w-md">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by name or manufacturer…"
                  className="w-full bg-surface/80 backdrop-blur border border-white/10 focus:border-flare/60
                             focus:shadow-[0_0_0_3px_rgba(56,189,248,0.12)]
                             focus:outline-none rounded-md px-4 py-2.5 text-sm font-mono
                             text-silk placeholder:text-muted transition-all"
                />

                {/* Quick protocol filters — mirrors real communication interfaces */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {QUICK_PROTOCOLS.map((p) => {
                    const active = filters.communication.includes(p);
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => toggleProtocol(p)}
                        aria-pressed={active}
                        className={`font-mono text-[10px] uppercase tracking-[0.15em] rounded-full px-3 py-1.5 border transition-all ${
                          active
                            ? "text-board bg-flare border-flare shadow-[0_0_16px_-2px_rgba(56,189,248,0.8)]"
                            : "text-muted border-white/10 hover:border-flare/50 hover:text-silk"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: HUD card with live catalog status */}
            <div className="lg:col-span-5 fade-up" style={{ animationDelay: ".15s" }}>
              <div className="hud-card p-7 max-w-md ml-auto">
                <div className="hud-corner tl" />
                <div className="hud-corner tr" />
                <div className="hud-corner bl" />
                <div className="hud-corner br" />

                <div className="flex items-center justify-between pb-5 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span
                      className={`pulse-dot w-1.5 h-1.5 rounded-full ${
                        error ? "bg-danger text-danger" : "bg-trace text-trace"
                      }`}
                    />
                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-silk/90">
                      {error ? "Backend Offline" : "Catalog Online"}
                    </span>
                  </div>
                  {lastUpdated && (
                    <Link
                      to="/changelog"
                      className="font-mono text-[10px] text-muted tracking-wider hover:text-flare transition-colors"
                    >
                      Updated {formatUpdatedDate(lastUpdated)}
                    </Link>
                  )}
                </div>

                <div className="py-6 space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2 font-mono text-[11px] uppercase tracking-[0.12em]">
                      <span className="text-muted">Catalog Coverage</span>
                      <span className="text-silk font-medium">
                        {totalCount ?? "…"} / {totalCount ?? "…"} Chips
                      </span>
                    </div>
                    <div className="tel-bar">
                      <div className="tel-bar-fill" style={{ width: "100%", animationDelay: ".3s" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2 font-mono text-[11px] uppercase tracking-[0.12em]">
                      <span className="text-muted">Pinout Accuracy</span>
                      <span className="text-silk font-medium">Datasheet-Verified</span>
                    </div>
                    <div className="tel-bar">
                      <div className="tel-bar-fill" style={{ width: "100%", animationDelay: ".5s" }} />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-5 border-t border-white/10 font-mono text-[11px] uppercase tracking-[0.12em]">
                  <span className="text-muted">
                    Results: <span className="text-silk/90">{loading ? "…" : mcs.length}</span>
                  </span>
                  <span className="text-trace">{loading ? "Loading" : "Ready"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom metrics bar */}
        <div className="relative z-10 border-t border-white/10">
          <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-4">
              <span className="text-xl" aria-hidden="true">🧩</span>
              <div>
                <div><Counter target={totalCount ?? 0} suffix="" /></div>
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted mt-1">
                  Microcontrollers Cataloged
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-4">
              <span className="text-xl" aria-hidden="true">🏭</span>
              <div>
                <div><Counter target={manufacturerCount ?? 0} suffix="+" /></div>
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted mt-1">
                  Manufacturers Covered
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-4">
              <span className="text-xl" aria-hidden="true">📌</span>
              <div>
                <div><Counter target={100} suffix="%" /></div>
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted mt-1">
                  Pins Mapped Per Chip
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TOOLKIT PANEL ===== */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <p className="font-mono text-xs text-trace tracking-[0.2em] uppercase mb-2">
          // toolkit
        </p>
        <h2 className="font-display text-2xl md:text-3xl font-semibold text-silk mb-10">
          Everything you need to pick a chip
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURE_PANELS.map((f) => {
            const Icon = f.icon;
            const cardInner = (
              <>
                <div className="hud-corner tl" />
                <div className="hud-corner tr" />
                <div className="hud-corner bl" />
                <div className="hud-corner br" />

                <div className="w-11 h-11 rounded-md border border-white/10 flex items-center justify-center text-flare mb-5 group-hover:border-flare/50 transition-colors">
                  <Icon size={18} />
                </div>
                <h3 className="font-display text-base font-semibold text-silk mb-1.5 group-hover:text-flare transition-colors">
                  {f.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed">{f.description}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-trace">
                  {f.cta} <span aria-hidden="true">→</span>
                </span>
              </>
            );

            return f.anchor ? (
              <a
                key={f.title}
                href="#catalog"
                onClick={scrollToCatalog}
                className="hud-card relative block p-6 group transition-transform duration-200 hover:-translate-y-0.5"
              >
                {cardInner}
              </a>
            ) : (
              <Link
                key={f.title}
                to={f.to}
                className="hud-card relative block p-6 group transition-transform duration-200 hover:-translate-y-0.5"
              >
                {cardInner}
              </Link>
            );
          })}
        </div>
      </section>

      {/* ===== CATALOG GRID ===== */}
      <section id="catalog" className="max-w-6xl mx-auto px-6 py-16 scroll-mt-20">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <p className="font-mono text-xs text-trace tracking-[0.2em] uppercase">
            // catalog.index
          </p>
          {lastUpdated && (
            <Link
              to="/changelog"
              className="font-mono text-[10px] uppercase tracking-wide text-muted hover:text-flare transition-colors"
            >
              Last updated {formatUpdatedDate(lastUpdated)} — view changelog
            </Link>
          )}
        </div>
        <h2 className="font-display text-2xl md:text-3xl font-semibold text-silk">
          The full lineup
        </h2>

        <div className="mt-8 space-y-8">
          <RecentlyViewedStrip />

          <FilterPanel
            facets={facets}
            filters={filters}
            setFilters={setFilters}
            sort={sort}
            setSort={setSort}
            resultCount={mcs.length}
            onClear={clearFilters}
          />

          <div>
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                  <ChipCardSkeleton key={i} />
                ))}
              </div>
            )}

            {!loading && error && (
              <p className="font-mono text-sm text-danger">
                {error} — is the backend running on port 5000?
              </p>
            )}

            {!loading && !error && mcs.length === 0 && (
              <p className="font-mono text-sm text-muted">
                No microcontrollers matched {search ? `"${search}"` : "these filters"}.{" "}
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-flare hover:text-flare/80 underline underline-offset-2"
                >
                  clear all filters
                </button>
              </p>
            )}

            {!loading && !error && mcs.length > 0 && (
              <>
                <div className="flex justify-end mb-4">
                  <ExportButton rows={mcs} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                  {visibleMcs.map((mc) => (
                    <ChipCard key={mc.slug} mc={mc} />
                  ))}
                </div>

                {hasMore && (
                  <div className="mt-10 flex flex-col items-center gap-2.5">
                    <p className="font-mono text-[11px] text-muted">
                      Showing {visibleMcs.length} of {mcs.length} chips
                    </p>
                    <button
                      type="button"
                      onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
                      className="btn-outline inline-flex items-center gap-2 border border-white/25 px-6 py-2.5
                                 font-mono text-xs uppercase tracking-[0.15em] text-silk transition-colors duration-300"
                    >
                      <ResistorGlyph />
                      Load More <span aria-hidden="true">↓</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
