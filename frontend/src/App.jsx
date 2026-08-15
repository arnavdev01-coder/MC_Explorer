import { useEffect, useState } from "react";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import Detail from "./pages/Detail";
import Compare from "./pages/Compare";
import Favorites from "./pages/Favorites";
import Changelog from "./pages/Changelog";
import NotFound from "./pages/NotFound";
import CompareBar from "./components/CompareBar";
import { useCompare } from "./context/CompareContext";
import { useFavorites } from "./context/FavoritesContext";
import { fetchMicrocontrollers } from "./api";
import { ChipGlyph, ResistorGlyph, CapacitorGlyph } from "./components/icons";

// Small IC-package logo mark: a chip body with pin nubs on all four
// sides, echoing the ChipCard treatment used throughout the catalog.
function ChipMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" className="chip-mark shrink-0">
      <rect x="6" y="6" width="14" height="14" rx="1.5" stroke="#38BDF8" strokeWidth="1.4" />
      <circle cx="9.3" cy="9.3" r="1.1" fill="#22D3EE" />
      {[6, 10, 14, 18].map((y) => (
        <rect key={`l${y}`} x="1.5" y={y - 0.75} width="3.5" height="1.5" fill="#00B8FF" />
      ))}
      {[6, 10, 14, 18].map((y) => (
        <rect key={`r${y}`} x="21" y={y - 0.75} width="3.5" height="1.5" fill="#00B8FF" />
      ))}
      {[6, 10, 14, 18].map((x) => (
        <rect key={`t${x}`} x={x - 0.75} y="1.5" width="1.5" height="3.5" fill="#00B8FF" />
      ))}
      {[6, 10, 14, 18].map((x) => (
        <rect key={`b${x}`} x={x - 0.75} y="21" width="1.5" height="3.5" fill="#00B8FF" />
      ))}
    </svg>
  );
}

export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [slugs, setSlugs] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { items: compareItems } = useCompare();
  const { items: favoriteItems } = useFavorites();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    fetchMicrocontrollers({})
      .then((all) => setSlugs(all.map((mc) => mc.slug)))
      .catch(() => {});
  }, []);

  // Close the mobile drawer on route change.
  useEffect(() => setMenuOpen(false), [location.pathname]);

  const goRandom = () => {
    if (slugs.length === 0) return;
    const pick = slugs[Math.floor(Math.random() * slugs.length)];
    navigate(`/mc/${pick}`);
  };

  const scrollToCatalog = (e) => {
    if (location.pathname !== "/") return; // let the Link navigate normally
    e.preventDefault();
    document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Ambient PCB texture behind every route */}
      <div className="circuit-field" aria-hidden="true" />

      <header className={`site-header sticky top-0 z-50 ${scrolled ? "is-scrolled" : ""}`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <ChipMark />
            <span className="font-wide font-bold text-silk tracking-[0.2em] text-sm uppercase">
              MC Explorer
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="/#catalog" onClick={scrollToCatalog} className="site-nav-link font-mono text-xs uppercase tracking-[0.15em]">
              Catalog
            </a>
            <button
              type="button"
              onClick={goRandom}
              disabled={slugs.length === 0}
              className="site-nav-link font-mono text-xs uppercase tracking-[0.15em] disabled:opacity-40 flex items-center gap-1.5"
            >
              <ResistorGlyph className="text-copper/80" />
              Random Chip
            </button>
            <Link to="/compare" className="site-nav-link font-mono text-xs uppercase tracking-[0.15em] flex items-center gap-1.5">
              <CapacitorGlyph className="text-copper/80" />
              Compare
              {compareItems.length > 0 && (
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-flare text-board text-[9px] font-bold">
                  {compareItems.length}
                </span>
              )}
            </Link>
            <Link to="/favorites" className="site-nav-link font-mono text-xs uppercase tracking-[0.15em] flex items-center gap-1.5">
              Favorites
              {favoriteItems.length > 0 && (
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-flare text-board text-[9px] font-bold">
                  {favoriteItems.length}
                </span>
              )}
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="site-nav-link font-mono text-xs uppercase tracking-[0.15em]"
            >
              Source
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <a
              href="/#catalog"
              onClick={scrollToCatalog}
              className="btn-glass inline-flex items-center gap-2 rounded-full px-5 py-2 font-mono text-xs uppercase tracking-[0.15em] text-silk"
            >
              <ChipGlyph />
              Browse Catalog <span aria-hidden="true">→</span>
            </a>
          </div>

          {/* Mobile menu toggle */}
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((v) => !v)}
            className={`md:hidden relative w-9 h-9 flex items-center justify-center border border-white/15 rounded-md ${menuOpen ? "burger-open" : ""}`}
          >
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
              <rect className="burger-line burger-line-1" x="0" y="0" width="18" height="1.6" rx="0.8" fill="#E8E6DE" />
              <rect className="burger-line burger-line-2" x="0" y="6.2" width="18" height="1.6" rx="0.8" fill="#E8E6DE" />
              <rect className="burger-line burger-line-3" x="0" y="12.4" width="18" height="1.6" rx="0.8" fill="#E8E6DE" />
            </svg>
          </button>
        </div>

        {/* Mobile drawer */}
        <div className={`mobile-drawer md:hidden border-t border-white/5 ${menuOpen ? "open" : ""}`}>
          <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col gap-5">
            <a href="/#catalog" onClick={(e) => { scrollToCatalog(e); setMenuOpen(false); }} className="site-nav-link font-mono text-xs uppercase tracking-[0.15em]">
              Catalog
            </a>
            <button
              type="button"
              onClick={() => { goRandom(); setMenuOpen(false); }}
              disabled={slugs.length === 0}
              className="text-left site-nav-link font-mono text-xs uppercase tracking-[0.15em] disabled:opacity-40 flex items-center gap-1.5"
            >
              <ResistorGlyph className="text-copper/80" />
              Random Chip
            </button>
            <Link
              to="/compare"
              onClick={() => setMenuOpen(false)}
              className="site-nav-link font-mono text-xs uppercase tracking-[0.15em] flex items-center gap-1.5"
            >
              <CapacitorGlyph className="text-copper/80" />
              Compare
              {compareItems.length > 0 && (
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-flare text-board text-[9px] font-bold">
                  {compareItems.length}
                </span>
              )}
            </Link>
            <Link
              to="/favorites"
              onClick={() => setMenuOpen(false)}
              className="site-nav-link font-mono text-xs uppercase tracking-[0.15em] flex items-center gap-1.5"
            >
              Favorites
              {favoriteItems.length > 0 && (
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-flare text-board text-[9px] font-bold">
                  {favoriteItems.length}
                </span>
              )}
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="site-nav-link font-mono text-xs uppercase tracking-[0.15em]"
            >
              Source
            </a>
            <a
              href="/#catalog"
              onClick={(e) => { scrollToCatalog(e); setMenuOpen(false); }}
              className="btn-glass inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 font-mono text-xs uppercase tracking-[0.15em] text-silk"
            >
              <ChipGlyph />
              Browse Catalog <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mc/:slug" element={<Detail />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/changelog" element={<Changelog />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <CompareBar />

      <footer className="border-t border-white/5 mt-16 relative">
        <div className="trace-runner" aria-hidden="true" />
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <ChipMark />
            <div>
              <p className="font-wide font-bold text-silk tracking-[0.2em] text-xs uppercase">MC Explorer</p>
              <p className="font-mono text-[11px] text-muted mt-1">
                Built for comparing microcontrollers before you commit to a design.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/changelog" className="site-nav-link font-mono text-xs uppercase tracking-[0.15em]">
              Changelog
            </Link>
            <div className="flex items-center gap-1.5" aria-hidden="true">
              {Array.from({ length: 8 }).map((_, i) => (
                <span key={i} className="pin-nub" style={{ background: i % 2 === 0 ? "#22D3EE" : "#38BDF8", opacity: 0.5 }} />
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
