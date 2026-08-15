// Hand-maintained changelog for the catalog. Add a new entry (newest first)
// whenever chips are added/updated/removed or a data error is corrected —
// this is what powers the "last updated" badge and the /changelog page.
//
// `date` must be an ISO date string (YYYY-MM-DD) so it sorts and formats
// predictably on the frontend.

const CHANGELOG = [
  {
    date: "2026-08-14",
    summary: "Filters are now shareable links, catalog pagination, accessibility fixes.",
    changes: [
      "Search, filters, and sort now sync to the URL — filtered views are bookmarkable and shareable, and browser back/forward works as expected.",
      "Added \"Load more\" pagination to the catalog grid instead of rendering every match at once.",
      "Fixed missing aria-pressed state on filter pills for screen readers.",
      "Added favicon, Open Graph, and Twitter card metadata.",
    ],
  },
  {
    date: "2026-07-02",
    summary: "Compare tool and pinout diagrams added.",
    changes: [
      "Added side-by-side chip comparison with a persistent compare bar.",
      "Added interactive visual pinout diagrams alongside the pin table on every chip page.",
      "Added copy-to-clipboard buttons for datasheet links and pin names.",
    ],
  },
  {
    date: "2026-05-18",
    summary: "Initial public catalog launch.",
    changes: [
      "Launched MC Explorer with the full microcontroller catalog, faceted filtering, and per-chip detail pages.",
    ],
  },
];

export default CHANGELOG;
