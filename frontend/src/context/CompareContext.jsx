import { createContext, useContext, useMemo, useState, useCallback } from "react";

const CompareContext = createContext(null);
const MAX_COMPARE = 2;

export function CompareProvider({ children }) {
  // Store the lightweight summary object (slug, name, manufacturer,
  // architecture) that ChipCard already has on hand — full spec/pin
  // data is fetched fresh on the Compare page itself.
  const [items, setItems] = useState([]);

  const isSelected = useCallback((slug) => items.some((it) => it.slug === slug), [items]);

  const toggle = useCallback((mc) => {
    setItems((prev) => {
      const exists = prev.some((it) => it.slug === mc.slug);
      if (exists) return prev.filter((it) => it.slug !== mc.slug);
      if (prev.length >= MAX_COMPARE) {
        // Slot is full — swap out the oldest pick rather than blocking
        // the user, so picking a 3rd chip always "just works."
        return [...prev.slice(1), mc];
      }
      return [...prev, mc];
    });
  }, []);

  const remove = useCallback((slug) => {
    setItems((prev) => prev.filter((it) => it.slug !== slug));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({ items, isSelected, toggle, remove, clear, max: MAX_COMPARE }),
    [items, isSelected, toggle, remove, clear]
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within a CompareProvider");
  return ctx;
}
