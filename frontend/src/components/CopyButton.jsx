import { useState } from "react";

// Small icon button that copies `text` to the clipboard and shows a
// brief "Copied" confirmation (checkmark + trace-teal color). Falls
// back to an offscreen-textarea copy for non-secure/older contexts
// where navigator.clipboard isn't available.
export default function CopyButton({ text, label = "Copy", className = "", iconOnly = false }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!text) return;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // Clipboard permission denied or unavailable — fail silently,
      // the button just won't flip to the "Copied" state.
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Copied to clipboard" : label}
      title={copied ? "Copied!" : label}
      className={`inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide
                  rounded px-1.5 py-1 -mx-1.5 -my-1 transition-colors duration-150
                  ${copied ? "text-trace" : "text-muted hover:text-silk hover:bg-white/5"} ${className}`}
    >
      {copied ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
          <rect x="9" y="9" width="11" height="11" rx="1.5" />
          <path d="M5 15V5a2 2 0 0 1 2-2h10" />
        </svg>
      )}
      {!iconOnly && <span>{copied ? "Copied" : label}</span>}
    </button>
  );
}
