import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext";
import { fetchMicrocontroller } from "../api";
import ChipCard from "../components/ChipCard";
import ChipCardSkeleton from "../components/ChipCardSkeleton";
import { ChipGlyph } from "../components/icons";

export default function Favorites() {
  const { items, clear } = useFavorites();
  const [cards, setCards] = useState({});
  const [loading, setLoading] = useState(true);

  // Favorites are stored as lightweight summaries; ChipCard wants the
  // same summary shape it already renders in the catalog grid
  // (manufacturer, architecture, communication, clock_speed, etc.), so
  // fetch full detail for each favorite once and reuse ChipCard as-is.
  useEffect(() => {
    if (items.length === 0) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all(
      items.map((it) =>
        fetchMicrocontroller(it.slug).catch(() => null) // stale slug — skip quietly
      )
    ).then((results) => {
      if (cancelled) return;
      const map = {};
      results.forEach((mc) => mc && (map[mc.slug] = mc));
      setCards(map);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <p className="font-mono text-xs text-trace tracking-[0.2em] uppercase mb-3">// favorites</p>
        <h1 className="font-display text-2xl font-semibold text-silk">No favorites yet</h1>
        <p className="text-muted mt-3 leading-relaxed">
          Hit the star on any chip in the catalog to save it here for quick access later.
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

  const validCards = items.map((it) => cards[it.slug]).filter(Boolean);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div>
          <p className="font-mono text-xs text-trace tracking-[0.2em] uppercase mb-2">// favorites</p>
          <h1 className="font-display text-2xl md:text-3xl font-semibold text-silk">
            Your saved chips
          </h1>
        </div>
        <button
          type="button"
          onClick={clear}
          className="font-mono text-[11px] uppercase tracking-wide text-muted hover:text-danger transition-colors"
        >
          Clear all
        </button>
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
          {items.map((it) => (
            <ChipCardSkeleton key={it.slug} />
          ))}
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
          {validCards.map((mc) => (
            <ChipCard key={mc.slug} mc={mc} />
          ))}
        </div>
      )}
    </div>
  );
}
