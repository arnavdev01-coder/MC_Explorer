const BASE = "/api";

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
