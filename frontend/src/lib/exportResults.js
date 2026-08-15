// Export the current (filtered/sorted) catalog view as a CSV or JSON file
// download. Deliberately dependency-free — small enough not to need a
// CSV library, and the field set is fixed/known ahead of time.

const EXPORT_COLUMNS = [
  { key: "name", label: "Name" },
  { key: "manufacturer", label: "Manufacturer" },
  { key: "architecture", label: "Architecture" },
  { key: "bit_width", label: "Bit width" },
  { key: "clock_speed", label: "Clock speed" },
  { key: "io_pins_count", label: "I/O pins" },
  { key: "package_type", label: "Package" },
  { key: "price_range", label: "Price range" },
  { key: "price_bucket", label: "Price bucket" },
  { key: "communication", label: "Communication" },
  { key: "short_description", label: "Description" },
  { key: "slug", label: "Slug" },
];

function csvCell(value) {
  const str = Array.isArray(value) ? value.join("; ") : value ?? "";
  const needsQuoting = /[",\n]/.test(String(str));
  const escaped = String(str).replace(/"/g, '""');
  return needsQuoting ? `"${escaped}"` : escaped;
}

function toCsv(rows) {
  const header = EXPORT_COLUMNS.map((c) => csvCell(c.label)).join(",");
  const lines = rows.map((row) =>
    EXPORT_COLUMNS.map((c) => csvCell(row[c.key])).join(",")
  );
  return [header, ...lines].join("\r\n");
}

function toJson(rows) {
  const slim = rows.map((row) => {
    const out = {};
    EXPORT_COLUMNS.forEach((c) => (out[c.key] = row[c.key]));
    return out;
  });
  return JSON.stringify(slim, null, 2);
}

function download(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function timestamp() {
  return new Date().toISOString().slice(0, 10);
}

export function exportResultsAsCsv(rows) {
  download(`mc-explorer-results-${timestamp()}.csv`, toCsv(rows), "text/csv;charset=utf-8;");
}

export function exportResultsAsJson(rows) {
  download(`mc-explorer-results-${timestamp()}.json`, toJson(rows), "application/json;charset=utf-8;");
}
