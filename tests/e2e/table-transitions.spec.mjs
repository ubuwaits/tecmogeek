import { expect, test } from "@playwright/test";
import { createRequire } from "node:module";
import { positions, teamRatingRecords, readRosterPlayers } from "../../scripts/verify/roster-data.mjs";

const { POSITION_PAGES } = createRequire(import.meta.url)("../../lib/players/config.ts");
const groups = { offense: ["Run", "Pass", "Bal"], defense: ["DL", "LB", "Sec"] };
const teamFields = {
  Overall: "overall_rating", Off: "offensive_rating", Def: "defensive_rating",
  Run: "running_offense", Pass: "passing_offense", Bal: "balanced_offense",
  DL: "dl_group", LB: "lb_group", Sec: "secondary_group",
};
const teams = teamRatingRecords();
const players = teams.flatMap(({ team }) => readRosterPlayers(team + ".json"));
function model(config) {
  const team = !config;
  const columns = team ? teamFields : Object.fromEntries([
    ["Ranking", config.rankingKey], ["Rating", config.ratingKey], ...config.columns.map(c => [c.label, c.key]),
  ]);
  const rows = team ? teams : players.filter(player => positions[config.slug].test(player.position))
    .sort((a, b) => a[config.rankingKey] - b[config.rankingKey]);
  const ids = rows.map(row => team ? row.team : row.teamSlug + "/" + row.position);
  const orders = new Map();
  const initial = { column: team ? "Overall" : "Ranking", asc: !team, filter: "all", offense: false, defense: false };
  function order({ column, asc, filter }) {
    const key = [column, asc, filter].join("/");
    if (!orders.has(key)) {
      const indices = rows.map((_, i) => i).filter(i => filter === "all" ||
        (filter === "only-rb" ? /^RB/ : /^(WR|TE)/).test(rows[i].position));
      const value = row => parseFloat(row[columns[column]] ?? row.components?.[columns[column]]);
      indices.sort((a, b) => {
        const delta = value(rows[a]) - value(rows[b]);
        if (delta) return asc ? delta : -delta;
        if (team) return rows[a].full_name.localeCompare(rows[b].full_name, "en");
        const ranks = rows[a][config.rankingKey] - rows[b][config.rankingKey];
        return asc ? -ranks : ranks;
      });
      orders.set(key, indices.map(i => ids[i]).join(","));
    }
    return orders.get(key);
  }
  function actions(state) {
    const visible = Object.keys(columns).filter(c => !team ||
      Object.entries(groups).every(([group, labels]) => state[group] || !labels.includes(c)));
    return [...visible, ...(team ? Object.keys(groups) : (config.filters ?? []).map(f => f.id))];
  }
  function next(state, action) {
    if (action in groups) return { ...state, [action]: !state[action] };
    if (!(action in columns)) return { ...state, filter: action };
    const target = { ...state, column: action };
    if (action === state.column) return { ...target, asc: !state.asc };
    const current = order(state);
    const desc = order({ ...target, asc: false }), asc = order({ ...target, asc: true });
    return { ...target, asc: current === desc || (current !== asc && action === "Ranking") };
  }
  return { initial, order, actions, next, columns };
}

// Enumerate the reachable graph, then exercise every edge in the real browser.
// Shortest paths connect the current UI state to the next untested action.
function graph(machine) {
  const states = new Map();
  function visit(state) {
    const key = JSON.stringify(state);
    if (states.has(key)) return states.get(key);
    const node = { state, edges: [] };
    states.set(key, node);
    for (const action of machine.actions(state)) {
      node.edges.push({ action, to: visit(machine.next(state, action)), tested: false });
    }
    return node;
  }
  const start = visit(machine.initial);
  return { start, states };
}
function pathToUntested(start) {
  const queue = [[start, []]], seen = new Set([start]);
  for (const [node, path] of queue) {
    const pending = node.edges.find(edge => !edge.tested);
    if (pending) return [...path, pending];
    for (const edge of node.edges) {
      if (seen.has(edge.to)) continue;
      seen.add(edge.to);
      queue.push([edge.to, [...path, edge]]);
    }
  }
  return [];
}

for (const config of [null, ...POSITION_PAGES]) {
  test(`${config?.slug ?? "teams"} reachable table transitions`, async ({ page }) => {
    test.setTimeout(240_000);
    const machine = model(config);
    const { start, states } = graph(machine);
    let node = start;
    await page.goto(config ? `/players/${config.slug}/` : "/teams/");
    const table = page.getByTestId(config ? "player-table-scroll" : "team-ratings-table-scroll");
    const rows = page.getByTestId(config ? "leaderboard-row" : "team-ratings-row");
    async function check(state) {
      const actual = await rows.evaluateAll(elements => elements.map(row => {
        const team = row.querySelector("a").pathname.split("/")[2];
        return row.dataset.position ? team + "/" + row.dataset.position : team;
      }).join(","));
      expect(actual, JSON.stringify(state)).toBe(machine.order(state));
      const headers = await table.locator("ol > li:first-child button:not([aria-expanded])").allTextContents();
      expect(headers.sort()).toEqual(machine.actions(state).filter(a => a in machine.columns).sort());
      if (config?.filters) await expect(page.getByTestId("filter-" + state.filter)).toHaveAttribute("aria-selected", "true");
    }
    await check(node.state);
    let count = 0;
    for (let path = pathToUntested(node); path.length; path = pathToUntested(node)) {
      for (const edge of path) {
        const action = edge.action;
        const button = action in groups
          ? table.getByRole("button", { name: new RegExp(action + " sub-ratings") })
          : action in machine.columns ? table.getByRole("button", { name: action, exact: true }) : page.getByTestId("filter-" + action);
        await button.click({ force: true });
        node = edge.to;
        await check(node.state);
        if (!edge.tested) count++;
        edge.tested = true;
      }
    }
    for (const state of states.values()) expect(state.edges.every(edge => edge.tested)).toBe(true);
    console.log(`${config?.slug ?? "teams"}: ${states.size} states, ${count} transitions`);
  });
}

test("expanded rating highlights align with their header cells", async ({ page }) => {
  await page.goto("/teams/");
  const table = page.getByTestId("team-ratings-table-scroll");
  for (const group of ["offense", "defense"]) {
    await table.getByRole("button", { name: `Show ${group} sub-ratings` }).click();
  }
  const layout = await table.locator("ol").evaluate(list => {
    const left = list.getBoundingClientRect().left;
    const cells = [...list.firstElementChild.children];
    const bounds = label => cells.find(cell => cell.querySelector("button")?.textContent === label)
      .getBoundingClientRect();
    return {
      stops: [...getComputedStyle(list).backgroundImage.matchAll(/([\d.]+)px/g)].map(match => Number(match[1])),
      groups: [["Off", "Bal"], ["Def", "Sec"]].map(([first, last]) => [
        bounds(first).left - left + 8, bounds(last).right - left - 8,
      ]),
    };
  });
  expect(layout.stops).toEqual(layout.groups.flatMap(([start, end]) => [start, start, end, end]));
});
