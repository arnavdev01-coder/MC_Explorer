import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

// Reused both as the catch-all 404 route and, with different copy, as the
// "no chip at this slug" state on the Detail page — so a broken link always
// lands somewhere useful instead of a dead end.
export default function NotFound({
  eyebrow = "// 404.not_found",
  title = "This trace goes nowhere.",
  description = "The page you're looking for doesn't exist, or the link is out of date.",
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/?q=${encodeURIComponent(q)}#catalog` : "/#catalog");
  };

  return (
    <div className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 grid-overlay" aria-hidden="true" />
      <div className="absolute inset-0 hero-vignette" aria-hidden="true" />

      <div className="relative z-10 max-w-md w-full mx-auto px-6 py-20 text-center fade-up">
        <div className="flex items-center justify-center gap-3 mb-6">
          <span className="w-8 h-px bg-white/30" />
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-trace">
            {eyebrow}
          </span>
          <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-danger text-danger" />
        </div>

        <h1 className="font-wide font-bold uppercase leading-[0.95] tracking-wide text-3xl md:text-4xl chrome-text">
          {title}
        </h1>
        <p className="mt-4 text-muted leading-relaxed">{description}</p>

        <form onSubmit={handleSearch} className="mt-8 flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or manufacturer…"
            aria-label="Search the catalog"
            className="flex-1 bg-surface/80 backdrop-blur border border-white/10 focus:border-flare/60
                       focus:shadow-[0_0_0_3px_rgba(56,189,248,0.12)]
                       focus:outline-none rounded-md px-4 py-2.5 text-sm font-mono
                       text-silk placeholder:text-muted transition-all"
          />
          <button
            type="submit"
            className="btn-glass shrink-0 rounded-md px-4 py-2.5 font-mono text-xs uppercase tracking-[0.15em] text-silk"
          >
            Search
          </button>
        </form>

        <div className="mt-6">
          <Link
            to="/"
            className="btn-outline inline-flex items-center gap-2 border border-white/25 px-7 py-3.5
                       font-mono text-xs uppercase tracking-[0.15em] text-silk transition-colors duration-300"
          >
            Browse Catalog <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
