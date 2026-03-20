"use client";

import { useState } from "react";

import { PlayerListSection } from "@/components/player-list-table";
import { SelectionTabs } from "@/components/selection-tabs";
import { POSITION_PAGE_CONFIG_MAP } from "@/lib/players/config";
import { getTeamSlugFromCode, matchesPrefixes, sortEntriesByKey } from "@/lib/player-utils";
import { teamRoute } from "@/lib/routes";
import type {
  PlayerMetricKey,
  PlayerRecord,
  PlayerSortKey,
  PositionSlug,
  SortDirection,
} from "@/lib/types";

type PlayerListViewProps = {
  slug: PositionSlug;
  entries: PlayerRecord[];
};

function renderMetricValue(entry: PlayerRecord, key: PlayerMetricKey): number {
  return Number(entry[key] ?? 0);
}

export function PlayerListView({ slug, entries }: PlayerListViewProps) {
  const config = POSITION_PAGE_CONFIG_MAP[slug];
  const [sortKey, setSortKey] = useState<PlayerSortKey>(config.rankingKey);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [filterId, setFilterId] = useState(config.defaultFilterId ?? "all");

  const activeFilter = config.filters?.find((filter) => filter.id === filterId);
  const filteredEntries = activeFilter
    ? entries.filter((entry) => matchesPrefixes(entry.position, activeFilter.allowedPrefixes))
    : entries;
  const sortedEntries = sortEntriesByKey(filteredEntries, sortKey, sortDirection);
  const activeMetricKey = config.columns.find((column) => column.key === sortKey)?.key ?? null;
  const rows = sortedEntries.map((entry) => {
    const teamSlug = getTeamSlugFromCode(entry.team);

    return {
      key: `${entry.team}-${entry.position}-${entry.name}`,
      rankingValue: String(entry[config.rankingKey] ?? ""),
      identityProps: {
        layout: "player" as const,
        team: teamSlug,
        helmetHref: teamRoute(teamSlug),
        headshotPosition: entry.position,
        name: entry.name,
        position: entry.position,
        number: entry.number,
      },
      ratingValue: String(entry[config.ratingKey] ?? ""),
      getMetricValue: (key: PlayerMetricKey) => renderMetricValue(entry, key),
      itemData: {
        "data-testid": "leaderboard-row",
        "data-position": entry.position,
      },
    };
  });

  function changeSort(key: PlayerSortKey, direction: SortDirection) {
    setSortKey(key);
    setSortDirection(direction);
  }

  return (
    <div className="mb-14 sm:mb-16">
      {config.filters?.length ? (
        <SelectionTabs
          items={config.filters}
          activeId={filterId}
          onChange={setFilterId}
          tabTestIdPrefix="filter"
          mobileSelectLabel="Player filter"
          mobileSelectTestId="player-filter-select"
        />
      ) : null}

      <PlayerListSection
        testId="player-table-scroll"
        layout="player"
        rankingLabel="Ranking"
        rankingTooltip={config.rankingTooltip}
        rankingActive={sortKey === config.rankingKey}
        onRankingClick={() => changeSort(config.rankingKey, "asc")}
        ratingActive={sortKey === config.ratingKey}
        onRatingClick={() => changeSort(config.ratingKey, "desc")}
        columns={config.columns}
        activeMetricKey={activeMetricKey}
        onMetricClick={(key) => changeSort(key, "desc")}
        rows={rows}
      />
    </div>
  );
}
