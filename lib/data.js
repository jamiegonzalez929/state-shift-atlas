export function enrichAreas(rawAreas) {
  return rawAreas.map((area) => {
    const rankShift =
      area.populationRank2010 && area.populationRank2020
        ? area.populationRank2010 - area.populationRank2020
        : null;

    return {
      ...area,
      growthDirection:
        area.numericChange > 0 ? "growth" : area.numericChange < 0 ? "decline" : "flat",
      rankShift,
      absolutePercentChange: Math.abs(area.percentChange),
      populationChangePer1000:
        Math.round((area.numericChange / area.residentPopulation2010) * 1000 * 10) / 10
    };
  });
}

export function filterAreas(areas, { includeTerritories = true, query = "" } = {}) {
  const normalizedQuery = query.trim().toLowerCase();

  return areas.filter((area) => {
    if (!includeTerritories && !area.isState) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    return (
      area.name.toLowerCase().includes(normalizedQuery) ||
      area.code.toLowerCase().includes(normalizedQuery)
    );
  });
}

export function sortAreas(areas, metric = "percentChange") {
  const sorters = {
    percentChange: (left, right) => right.percentChange - left.percentChange,
    numericChange: (left, right) => right.numericChange - left.numericChange,
    rankShift: (left, right) => (right.rankShift ?? -Infinity) - (left.rankShift ?? -Infinity),
    population2020:
      (left, right) => right.residentPopulation2020 - left.residentPopulation2020
  };

  const sorter = sorters[metric] ?? sorters.percentChange;
  return [...areas].sort((left, right) => sorter(left, right) || left.name.localeCompare(right.name));
}

export function buildOverview(areas) {
  const statesOnly = areas.filter((area) => area.isState);
  const sortedByPercent = sortAreas(statesOnly, "percentChange");
  const sortedByNumeric = sortAreas(statesOnly, "numericChange");
  const sortedByRankShift = sortAreas(statesOnly.filter((area) => area.rankShift !== null), "rankShift");
  const decliners = [...statesOnly]
    .filter((area) => area.numericChange < 0)
    .sort((left, right) => left.numericChange - right.numericChange);

  return {
    totalAreas: areas.length,
    totalStates: statesOnly.length,
    topPercentGrowth: sortedByPercent[0],
    topNumericGrowth: sortedByNumeric[0],
    biggestRankClimb: sortedByRankShift[0],
    steepestDecline: decliners[0]
  };
}

export function buildChartRows(areas, metric) {
  const maxValue = Math.max(...areas.map((area) => Math.abs(metricValue(area, metric))), 0);

  return sortAreas(areas, metric).map((area) => ({
    ...area,
    metric,
    value: metricValue(area, metric),
    widthPercent: maxValue === 0 ? 0 : (Math.abs(metricValue(area, metric)) / maxValue) * 100
  }));
}

export function metricValue(area, metric) {
  switch (metric) {
    case "numericChange":
      return area.numericChange;
    case "rankShift":
      return area.rankShift ?? 0;
    case "population2020":
      return area.residentPopulation2020;
    case "percentChange":
    default:
      return area.percentChange;
  }
}

export function formatPopulation(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatSignedNumber(value, suffix = "") {
  const formatter = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: suffix === "%" ? 1 : 0,
    minimumFractionDigits: suffix === "%" && !Number.isInteger(value) ? 1 : 0
  });

  if (value > 0) {
    return `+${formatter.format(value)}${suffix}`;
  }

  return `${formatter.format(value)}${suffix}`;
}
