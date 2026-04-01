import test from "node:test";
import assert from "node:assert/strict";

import dataset from "../data/population-change-2010-2020.json" with { type: "json" };
import { buildChartRows, buildOverview, enrichAreas, filterAreas, sortAreas } from "../lib/data.js";

const areas = enrichAreas(dataset);

test("enrichAreas computes rank shifts for ranked states", () => {
  const utah = areas.find((area) => area.code === "UT");
  const dc = areas.find((area) => area.code === "DC");

  assert.equal(utah.rankShift, 4);
  assert.equal(dc.rankShift, null);
});

test("buildOverview reports the expected headline leaders", () => {
  const overview = buildOverview(areas);

  assert.equal(overview.totalAreas, 52);
  assert.equal(overview.totalStates, 50);
  assert.equal(overview.topPercentGrowth.name, "Utah");
  assert.equal(overview.topNumericGrowth.name, "Texas");
  assert.equal(overview.steepestDecline.name, "West Virginia");
});

test("filterAreas excludes non-states when requested and supports search", () => {
  const statesOnly = filterAreas(areas, { includeTerritories: false });
  const virginiaMatch = filterAreas(areas, { includeTerritories: true, query: "virginia" });

  assert.equal(statesOnly.length, 50);
  assert.deepEqual(
    virginiaMatch.map((area) => area.code),
    ["VA", "WV"]
  );
});

test("sortAreas and buildChartRows keep the chart sorted by the selected metric", () => {
  const sorted = sortAreas(areas.filter((area) => area.isState), "percentChange");
  const rows = buildChartRows(areas.filter((area) => area.isState), "percentChange");

  assert.equal(sorted[0].name, "Utah");
  assert.equal(rows[0].name, "Utah");
  assert.equal(rows.at(-1).name, "West Virginia");
  assert.equal(rows[0].widthPercent, 100);
});
