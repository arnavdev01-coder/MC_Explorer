import { createContext, useContext, useMemo, useState, useCallback, useEffect } from "react";

const FavoritesContext = createContext(null);
const STORAGE_KEY = "mc-explorer:favorites";

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // Corrupt/unavailable storage (private browsing, quota, bad JSON) —
    // fail soft and just start empty rather than breaking the app.
    return [];
  }
}

export function FavoritesProvider({ children }) {
  // Store the lightweight summary object (slug, name, manufacturer,
  // architecture) — same shape CompareContext keeps — so the Favorites
  // page can render immediately without a fetch per chip.
  const [items, setItems] = useState(loadInitial);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage full or unavailable — favorites just won't persist
      // this session, which is a fine degradation.
    }
  }, [items]);

  const isFavorite = useCallback((slug) => items.some((it) => it.slug === slug), [items]);

  const toggle = useCallback((mc) => {
    setItems((prev) => {
      const exists = prev.some((it) => it.slug === mc.slug);
      if (exists) return prev.filter((it) => it.slug !== mc.slug);
      return [...prev, mc];
    });
  }, []);

  const remove = useCallback((slug) => {
    setItems((prev) => prev.filter((it) => it.slug !== slug));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({ items, isFavorite, toggle, remove, clear }),
    [items, isFavorite, toggle, remove, clear]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within a FavoritesProvider");
  return ctx;
}
