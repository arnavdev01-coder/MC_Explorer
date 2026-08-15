import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchChangelog } from "../api";

function formatDate(iso) {
  try {
    return new Date(`${iso}T00:00:00Z`).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });
  } catch {
    return iso;
  }
}

export default function Changelog() {
  const [entries, setEntries] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchChangelog().then(setEntries).catch((e) => setError(e.message));
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <Link to="/" className="site-nav-link font-mono text-xs">
        ← back to catalog
      </Link>

      <p className="font-mono text-xs text-trace tracking-[0.2em] uppercase mt-8 mb-2">
        // catalog.changelog
      </p>
      <h1 className="font-display text-2xl md:text-3xl font-semibold text-silk">
        What's changed
      </h1>
      <p className="text-muted mt-3 max-w-xl leading-relaxed">
        Dated record of catalog additions, corrections, and feature updates.
      </p>

      {error && (
        <p className="font-mono text-sm text-danger mt-8">
          {error} — is the backend running on port 5000?
        </p>
      )}

      {!error && !entries && (
        <p className="font-mono text-sm text-muted mt-8">Loading changelog…</p>
      )}

      {entries && entries.length === 0 && (
        <p className="font-mono text-sm text-muted mt-8">No entries yet.</p>
      )}

      {entries && entries.length > 0 && (
        <ol className="mt-10 space-y-8">
          {entries.map((entry, i) => (
            <li key={entry.date + i} className="relative pl-6 border-l border-white/10">
              <span className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-flare shadow-[0_0_10px_-1px_rgba(56,189,248,0.9)]" />
              <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-trace">
                {formatDate(entry.date)}
              </p>
              <h2 className="font-display text-base font-semibold text-silk mt-1.5">
                {entry.summary}
              </h2>
              {entry.changes?.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {entry.changes.map((c, j) => (
                    <li key={j} className="text-sm text-muted leading-relaxed flex gap-2">
                      <span className="text-flare shrink-0" aria-hidden="true">·</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
