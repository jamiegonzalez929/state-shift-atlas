import { buildChartRows, buildOverview, enrichAreas, filterAreas, formatPopulation, formatSignedNumber } from "./lib/data.js";

const state = {
  areas: [],
  selectedSlug: null,
  metric: "percentChange",
  includeTerritories: true,
  query: ""
};

const metricLabels = {
  percentChange: "Percent change",
  numericChange: "Numeric change",
  rankShift: "Population rank shift",
  population2020: "2020 population"
};

async function init() {
  const response = await fetch("./data/population-change-2010-2020.json");
  const rawAreas = await response.json();

  state.areas = enrichAreas(rawAreas);
  state.selectedSlug = "utah";

  wireControls();
  render();
}

function wireControls() {
  const metricSelect = document.querySelector("#metric-select");
  const territoryToggle = document.querySelector("#territory-toggle");
  const searchInput = document.querySelector("#search-input");

  metricSelect.addEventListener("change", (event) => {
    state.metric = event.target.value;
    render();
  });

  territoryToggle.addEventListener("change", (event) => {
    state.includeTerritories = event.target.checked;
    render();
  });

  searchInput.addEventListener("input", (event) => {
    state.query = event.target.value;
    render();
  });
}

function render() {
  const filteredAreas = filterAreas(state.areas, {
    includeTerritories: state.includeTerritories,
    query: state.query
  });
  const chartRows = buildChartRows(filteredAreas, state.metric);
  const overview = buildOverview(state.areas);
  const selectedArea =
    filteredAreas.find((area) => area.slug === state.selectedSlug) ??
    chartRows[0] ??
    null;

  state.selectedSlug = selectedArea?.slug ?? state.selectedSlug;

  renderOverview(overview);
  renderChart(chartRows);
  renderDetails(selectedArea);
  renderRankMoves(filteredAreas);
}

function renderOverview(overview) {
  document.querySelector("#overview-cards").innerHTML = `
    <article class="stat-card">
      <span class="eyebrow">Fastest growth</span>
      <strong>${overview.topPercentGrowth.name}</strong>
      <span>${formatSignedNumber(overview.topPercentGrowth.percentChange, "%")}</span>
    </article>
    <article class="stat-card">
      <span class="eyebrow">Largest numeric gain</span>
      <strong>${overview.topNumericGrowth.name}</strong>
      <span>${formatSignedNumber(overview.topNumericGrowth.numericChange)}</span>
    </article>
    <article class="stat-card">
      <span class="eyebrow">Biggest rank climb</span>
      <strong>${overview.biggestRankClimb.name}</strong>
      <span>${formatSignedNumber(overview.biggestRankClimb.rankShift, " places")}</span>
    </article>
    <article class="stat-card">
      <span class="eyebrow">Steepest decline</span>
      <strong>${overview.steepestDecline.name}</strong>
      <span>${formatSignedNumber(overview.steepestDecline.percentChange, "%")}</span>
    </article>
  `;
}

function renderChart(rows) {
  const chart = document.querySelector("#chart-rows");
  const metricLabel = metricLabels[state.metric];

  document.querySelector("#chart-title").textContent = `${metricLabel} by area`;

  if (rows.length === 0) {
    chart.innerHTML = `<p class="empty-state">No matching areas for the current search and filter.</p>`;
    return;
  }

  chart.innerHTML = rows
    .map((area) => {
      const negative = area.value < 0 ? "is-negative" : "";
      const selected = area.slug === state.selectedSlug ? "is-selected" : "";
      const label = valueLabel(area);

      return `
        <button class="chart-row ${negative} ${selected}" data-slug="${area.slug}" type="button">
          <span class="chart-row__name">
            <strong>${area.name}</strong>
            <small>${area.code}</small>
          </span>
          <span class="chart-row__bar-wrap">
            <span class="chart-row__bar" style="width: ${area.widthPercent.toFixed(1)}%"></span>
          </span>
          <span class="chart-row__value">${label}</span>
        </button>
      `;
    })
    .join("");

  chart.querySelectorAll(".chart-row").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedSlug = button.dataset.slug;
      render();
    });
  });
}

function renderDetails(area) {
  if (!area) {
    document.querySelector("#detail-panel").innerHTML = `
      <header class="detail-panel__header">
        <div>
          <span class="eyebrow">Selected area</span>
          <h2>No match</h2>
        </div>
      </header>
      <p class="empty-state">Adjust the search text or include all areas to inspect details again.</p>
    `;
    return;
  }

  const rankShiftText =
    area.rankShift === null
      ? "Not ranked in apportionment"
      : `${formatSignedNumber(area.rankShift, " places")} between 2010 and 2020`;

  document.querySelector("#detail-panel").innerHTML = `
    <header class="detail-panel__header">
      <div>
        <span class="eyebrow">Selected area</span>
        <h2>${area.name}</h2>
      </div>
      <span class="detail-chip">${area.code}</span>
    </header>
    <div class="detail-grid">
      <div>
        <span class="eyebrow">2020 population</span>
        <strong>${formatPopulation(area.residentPopulation2020)}</strong>
      </div>
      <div>
        <span class="eyebrow">2010 population</span>
        <strong>${formatPopulation(area.residentPopulation2010)}</strong>
      </div>
      <div>
        <span class="eyebrow">Numeric change</span>
        <strong>${formatSignedNumber(area.numericChange)}</strong>
      </div>
      <div>
        <span class="eyebrow">Percent change</span>
        <strong>${formatSignedNumber(area.percentChange, "%")}</strong>
      </div>
      <div class="detail-grid__wide">
        <span class="eyebrow">Population rank movement</span>
        <strong>${rankShiftText}</strong>
      </div>
    </div>
  `;
}

function renderRankMoves(filteredAreas) {
  const items = filteredAreas
    .filter((area) => area.rankShift !== null)
    .sort((left, right) => Math.abs(right.rankShift) - Math.abs(left.rankShift) || left.name.localeCompare(right.name))
    .slice(0, 8);

  if (items.length === 0) {
    document.querySelector("#rank-list").innerHTML =
      `<li class="empty-state">No ranked states match the current filters.</li>`;
    return;
  }

  document.querySelector("#rank-list").innerHTML = items
    .map(
      (area) => `
        <li>
          <button class="rank-move" data-slug="${area.slug}" type="button">
            <span>
              <strong>${area.name}</strong>
              <small>${area.populationRank2010} -> ${area.populationRank2020}</small>
            </span>
            <span>${formatSignedNumber(area.rankShift, " places")}</span>
          </button>
        </li>
      `
    )
    .join("");

  document.querySelectorAll(".rank-move").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedSlug = button.dataset.slug;
      render();
    });
  });
}

function valueLabel(area) {
  switch (state.metric) {
    case "numericChange":
      return formatSignedNumber(area.numericChange);
    case "rankShift":
      return area.rankShift === null ? "n/a" : formatSignedNumber(area.rankShift, " places");
    case "population2020":
      return formatPopulation(area.residentPopulation2020);
    case "percentChange":
    default:
      return formatSignedNumber(area.percentChange, "%");
  }
}

init();
