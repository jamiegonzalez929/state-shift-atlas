# State Shift Atlas

State Shift Atlas is a small static explorer for how resident population changed across the 50 states, the District of Columbia, and Puerto Rico between the 2010 Census and the 2020 Census.

## Why It Exists

The decennial Census is one of the clearest ways to see long-run population movement in the United States, but the raw tables are dense. This project turns Census Table E into a local, offline-friendly visualization that makes it easier to compare percent growth, absolute gains, and population-rank movement.

## Features

- Offline-friendly static site with no third-party APIs
- Bundled Census dataset for the 50 states, D.C., and Puerto Rico
- Sortable explorer for percent change, numeric change, rank shift, and 2020 population
- Search by area name or postal code
- Toggle to include or exclude D.C. and Puerto Rico
- Detail panel for the selected area
- Headline cards for the biggest movers
- Automated tests for the shared data-processing layer

## Tech Stack

- HTML
- CSS
- Vanilla JavaScript with ES modules
- Node.js built-in test runner

## Setup

From the repo root:

```bash
npm test
```

No install step is required because the project uses only the local Node runtime and Python's built-in static server.

## How To Run

Serve the repo root locally:

```bash
npm start
```

Then open `http://localhost:4173`.

You can also use:

```bash
python3 -m http.server 4173
```

## How To Test

Run the automated test suite from the repo root:

```bash
npm test
```

## Example Usage

1. Open the explorer in a browser.
2. Leave the default metric on percent change to see the fastest-growing areas.
3. Switch to numeric change to compare raw resident gains.
4. Search for a specific state like `Arizona` or `AZ`.
5. Click an area in the chart or rank-movement list to inspect its detail panel.

## Project Structure

- `index.html`: the static page shell
- `app.js`: UI logic and rendering
- `styles.css`: visual design and responsive layout
- `lib/data.js`: shared data transformations and formatting
- `data/population-change-2010-2020.json`: bundled Census data
- `tests/data.test.js`: automated tests
- `docs/data-source.md`: source and transformation notes

## Data Source

This project is based on the U.S. Census Bureau's "Table E. Numeric and Percent Change in Resident Population of the 50 States, the District of Columbia, and Puerto Rico: 2020 Census and 2010 Census."

See [docs/data-source.md](./docs/data-source.md) for the exact source URL and normalization details.

## Limitations

- The app focuses on the 2010 to 2020 Census interval only.
- It does not include county-level, metro-level, or yearly Census estimates.
- Rank movement applies only to the 50 states because the apportionment ranking in Table E excludes D.C. and Puerto Rico.
- The UI is intentionally no-build and lightweight, so it does not include richer transitions or downloadable exports.

## Next Ideas

- Add a small-multiples regional view using Census regions or divisions
- Add annotations for apportionment seat changes
- Add a downloadable CSV export of the currently filtered view
- Compare decennial Census totals against annual post-2020 estimates
