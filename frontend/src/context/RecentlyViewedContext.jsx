import { createContext, useContext, useMemo, useState, useCallback, useEffect } from "react";

const RecentlyViewedContext = createContext(null);
const STORAGE_KEY = "mc-explorer:recently-viewed";
const MAX_RECENT = 8;

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function RecentlyViewedProvider({ children }) {
  // Most-recently-viewed first. Stores the same lightweight summary
  // shape used elsewhere (slug, name, manufacturer, architecture).
  const [items, setItems] = useState(loadInitial);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Fail soft — see FavoritesContext for the same tradeoff.
    }
  }, [items]);

  const addView = useCallback((mc) => {
    setItems((prev) => {
      const deduped = prev.filter((it) => it.slug !== mc.slug);
      return [mc, ...deduped].slice(0, MAX_RECENT);
    });
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(() => ({ items, addView, clear }), [items, addView, clear]);

  return <RecentlyViewedContext.Provider value={value}>{children}</RecentlyViewedContext.Provider>;
}

export function useRecentlyViewed() {
  const ctx = useContext(RecentlyViewedContext);
  if (!ctx) throw new Error("useRecentlyViewed must be used within a RecentlyViewedProvider");
  return ctx;
}
