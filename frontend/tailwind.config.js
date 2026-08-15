/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        board: "#050914",       // deep navy-black background
        surface: "#0B1424",     // panel
        surface2: "#101D34",    // raised panel
        copper: "#00B8FF",      // primary accent - neon blue (kept key name for compat)
        copperLight: "#5ED4FF",
        trace: "#22D3EE",       // secondary accent - cyan trace
        flare: "#38BDF8",       // tertiary accent - "energized" circuit blue
        flareDeep: "#2563EB",
        violet: "#8B5CF6",      // flare tail on gradients/glow
        silk: "#E8EEF7",        // silkscreen white text
        muted: "#7F93B3",       // muted labels
        danger: "#FB7185",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
        wide: ["'Syncopate'", "sans-serif"],
      },
      backgroundImage: {
        traces:
          "linear-gradient(90deg, transparent 0%, rgba(0,184,255,0.08) 50%, transparent 100%)",
      },
    },
  },
  plugins: [],
};
