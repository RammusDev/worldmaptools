# Worldmaptools · Atlas Studio

**Version: v1.0.1** · [繁體中文](../README.md) · [Changelog](../CHANGELOG.md) · [Data licensing policy](DATA_LICENSES.md)

An interactive world map for coloring countries and administrative regions, placing symbols, and exploring subdivisions.

## Run locally

Install Node.js 20 or newer, then run `npm start`. Open http://127.0.0.1:4173 . No npm dependencies or build step are required. Use HTTP rather than opening the HTML file directly. Set `PORT` to change the port.

## Editing

- In Paint mode, click to apply a color. In Symbols mode, click to place a symbol; first use asks for its description.
- Double-click to split a region. Merge unmarked areas returns the blank remainder to the parent while retaining independently marked regions.
- Use the wheel, zoom controls and dragging to navigate.
- Click a legend entry to reuse its marking. The pencil edits its description; × deletes the legend entry and clears matching markings across the map.
- Undo supports up to 25 recent operations in the current session. Export/import transfers JSON map files.
- Switch Traditional Chinese / English in the top-right selector. Authored legend descriptions are never translated.
- Focus a region and press Enter to apply a marking, or Shift+Enter to split. Click detection waits approximately 260 ms to distinguish double-clicks.

The top-left panel counts editable, painted and unpainted regions. When fewer than ten are unpainted, clickable names navigate to them without painting. A symbol alone does not count as a painted region.

## Data and limitations

Subdivisions load on demand from geoBoundaries gbOpen, up to ADM5. Data coverage, dates and administrative definitions vary. Germany supports states, government districts and independent cities/counties, including separate Munich city/county features. Taiwan stops at county/city level. China and Taiwan are separate editing roots; China geometries exclude Taiwan and its county/city boundaries, including Kinmen and Matsu. France and Norway have corrected lookup codes while retaining legacy save identifiers. The France dataset currently includes 13 metropolitan regions.

Parent membership is partly inferred using representative points because datasets do not share consistent parent identifiers. Boundaries from different years may not align. The county/city stopping rule is a heuristic rather than a complete worldwide administrative ontology. Country names and Taiwan county/city names are localized; other subdivisions retain source names.

Map edits and language preferences stay in browser localStorage, with no cross-browser or cross-origin synchronization. Export backups regularly. Undo history is session-only. Map file format `version: 1` is distinct from application release `v1.0.0`.

There is no backend or account system. Administrative data requests require internet connectivity; Leaflet and geometry code are bundled and fonts use the system. Deploy `dist/` on a static host, with access settings chosen separately by the owner. Private Sites deployment settings and personal map saves are excluded from this GitHub project.

The Data sources & licenses dialog provides provider/version/license records, boundary and provenance downloads, and machine-readable alteration methods. Boundary downloads exclude colors, symbols and authored legend descriptions. Unknown or unsupported data licenses are blocked pending review. See the data policy and the deployed `sources.html` page.

## Tests and performance

Run `npm test`. Tests cover country codes, China/Taiwan isolation, partial merge, legend behavior, localization, statistics and incremental rendering. Test GeoJSON fixtures contain public boundary data.

Merged remainders cache their geometry. Painting reuses Leaflet layers and changes styles instead of rebuilding the map. Optional comparison: `node tests/performance.cjs MAP_JSON RUSSIA_ADM1_GEOJSON`.

## Sources and licensing

World boundaries: Natural Earth via datasets/geo-countries. Administrative boundaries: geoBoundaries gbOpen, subject to individual source licenses and vintages. See the main README, `dist/data-sources.json` and `dist/taiwan-source.json`. Leaflet 1.9.4 uses BSD-2-Clause. Geometry code is a reproducible subset of Turf 7.2.0; individual module/dependency licenses and hashes are recorded in `dist/licenses/`. Third-party code and data retain their own licenses. No blanket open-source license has been assigned to project-owned code in this release.
