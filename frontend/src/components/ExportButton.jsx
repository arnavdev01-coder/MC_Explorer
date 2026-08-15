import { useEffect, useRef, useState } from "react";
import { exportResultsAsCsv, exportResultsAsJson } from "../lib/exportResults";

// Small format-picker dropdown that exports whatever result set is
// currently passed in (i.e. the filtered/sorted view, not just the
// paginated slice on screen) as CSV or JSON.
export default function ExportButton({ rows, disabled }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const handleExport = (fn) => {
    fn(rows);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        aria-expanded={open}
        className="btn-outline inline-flex items-center gap-2 border border-white/25 px-4 py-1.5
                   font-mono text-[10px] uppercase tracking-[0.15em] text-silk transition-colors duration-300
                   disabled:opacity-30 disabled:pointer-events-none"
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
          <path d="M12 3v12m0 0l-4-4m4 4l4-4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Export results ({rows.length})
      </button>

      {open && (
        <div
          className="absolute right-0 z-20 mt-2 w-40 bg-surface border border-white/10 rounded-md
                     shadow-[0_12px_30px_-8px_rgba(0,0,0,0.6)] overflow-hidden"
        >
          <button
            type="button"
            onClick={() => handleExport(exportResultsAsCsv)}
            className="w-full text-left px-3.5 py-2.5 font-mono text-[11px] uppercase tracking-wide text-silk hover:bg-white/5 transition-colors"
          >
            Download CSV
          </button>
          <button
            type="button"
            onClick={() => handleExport(exportResultsAsJson)}
            className="w-full text-left px-3.5 py-2.5 font-mono text-[11px] uppercase tracking-wide text-silk hover:bg-white/5 transition-colors border-t border-white/5"
          >
            Download JSON
          </button>
        </div>
      )}
    </div>
  );
}
