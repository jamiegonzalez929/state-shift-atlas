# Data Source Notes

## Primary Source

This project uses the U.S. Census Bureau table:

- Table E. Numeric and Percent Change in Resident Population of the 50 States, the District of Columbia, and Puerto Rico: 2020 Census and 2010 Census
- Source page: `https://www.census.gov/data/tables/2020/dec/2020-apportionment-data.html`
- Spreadsheet used during extraction: `https://www2.census.gov/programs-surveys/decennial/2020/data/apportionment/apportionment-2020-tableE.xlsx`

## Included Areas

- The 50 states
- District of Columbia
- Puerto Rico

Regional summary rows in the spreadsheet were excluded because the app is built around area-level comparison.

## Included Fields

Each bundled record includes:

- area name
- postal code
- slug
- state flag
- 2020 resident population
- 2010 resident population
- numeric change
- percent change
- 2020 population rank
- 2010 population rank
- numeric-change rank
- percent-change rank

## Normalization Notes

- `rankShift` is computed in the app as `populationRank2010 - populationRank2020`
- Positive `rankShift` means a state moved up toward a larger-population rank by 2020
- D.C. and Puerto Rico are kept in the dataset, but rank-based views treat their rank movement as unavailable because the Census table marks those values as not applicable
- Percent values are stored as one-decimal numbers to match the source table

## Local Reproducibility

The published repo bundles the extracted JSON directly so the app works offline and on GitHub Pages without any build step or network dependency beyond loading the static files.
