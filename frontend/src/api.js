// In dev, Vite proxies "/api" to localhost:5000 (see vite.config.js).
// In production, set VITE_API_URL in Vercel's project settings to your
// deployed backend's URL, e.g. https://mc-explorer-backend.onrender.com
const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "/api";

export async function fetchMicrocontrollers(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE}/microcontrollers${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Failed to load microcontrollers");
  return res.json();
}

export async function fetchMicrocontroller(slug) {
  const res = await fetch(`${BASE}/microcontrollers/${slug}`);
  if (!res.ok) throw new Error("Microcontroller not found");
  return res.json();
}

export async function fetchFacets() {
  const res = await fetch(`${BASE}/facets`);
  if (!res.ok) throw new Error("Failed to load filters");
  return res.json();
}

export async function fetchMeta() {
  const res = await fetch(`${BASE}/meta`);
  if (!res.ok) throw new Error("Failed to load catalog metadata");
  return res.json();
}

export async function fetchChangelog() {
  const res = await fetch(`${BASE}/changelog`);
  if (!res.ok) throw new Error("Failed to load changelog");
  return res.json();
}
