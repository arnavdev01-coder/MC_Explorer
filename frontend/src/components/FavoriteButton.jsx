import { useFavorites } from "../context/FavoritesContext";

// Star toggle for favoriting a chip. `mc` only needs the lightweight
// summary fields (slug, name, manufacturer, architecture) — the same
// shape CompareContext/RecentlyViewedContext already pass around.
export default function FavoriteButton({ mc, iconOnly = false, className = "" }) {
  const { isFavorite, toggle } = useFavorites();
  const active = isFavorite(mc.slug);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggle({ slug: mc.slug, name: mc.name, manufacturer: mc.manufacturer, architecture: mc.architecture });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={active}
      aria-label={active ? `Remove ${mc.name} from favorites` : `Add ${mc.name} to favorites`}
      title={active ? "Remove from favorites" : "Add to favorites"}
      className={`inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide
                  rounded px-2 py-1 border transition-all ${
                    active
                      ? "text-flare bg-flare/10 border-flare/40"
                      : "text-muted border-white/10 hover:border-flare/50 hover:text-silk"
                  } ${className}`}
    >
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        className="shrink-0"
      >
        <path d="M12 3.5l2.76 5.59 6.17.9-4.46 4.35 1.05 6.14L12 17.6l-5.52 2.9 1.05-6.14L3.07 10l6.17-.9L12 3.5z" />
      </svg>
      {!iconOnly && <span>{active ? "Favorited" : "Favorite"}</span>}
    </button>
  );
}
