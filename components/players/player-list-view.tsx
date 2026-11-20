"use client";

import { useState } from "react";

import { PlayerListSection } from "@/components/players/player-list-table";
import { SelectionTabs } from "@/components/ui/selection-tabs";
import { POSITION_PAGE_CONFIG_MAP } from "@/lib/players/config";
import { matchesPrefixes, rankingTooltip, sortEntriesByKey } from "@/lib/players/utils";
import { getNextSortDirection } from "@/lib/shared/sort-direction";
import type {
  LeaderboardPlayer,
  PlayerSortKey,
  PositionSlug,
  SortDirection,
} from "@/lib/types";

type PlayerListViewProps = {
  slug: PositionSlug;
  entries: LeaderboardPlayer[];
};

export function PlayerListView({ slug, entries }: PlayerListViewProps) {
  const config = POSITION_PAGE_CONFIG_MAP[slug];
  const [sortKey, setSortKey] = useState<PlayerSortKey>(config.rankingKey);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [filterId, setFilterId] = useState(config.defaultFilterId ?? "all");

  const activeFilter = config.filters?.find((filter) => filter.id === filterId);
  const filteredEntries = activeFilter
    ? entries.filter((entry) => matchesPrefixes(entry.position, activeFilter.allowedPrefixes))
    : entries;
  const sortedEntries = sortEntriesByKey(filteredEntries, sortKey, sortDirection, config.rankingKey);
  const activeMetricKey = config.columns.find((column) => column.key === sortKey)?.key ?? null;

  function changeSort(key: PlayerSortKey, defaultDirection: SortDirection) {
    const nextDirection = getNextSortDirection({
      currentKey: sortKey,
      nextKey: key,
      currentDirection: sortDirection,
      defaultDirection,
      currentOrder: sortedEntries,
      orderFor: direction => sortEntriesByKey(filteredEntries, key, direction, config.rankingKey),
    });

    setSortKey(key);
    setSortDirection(nextDirection);
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
        rankingTooltip={rankingTooltip(entries.length, config.rankingGroupLabel)}
        rankingActive={sortKey === config.rankingKey}
        onRankingClick={() => changeSort(config.rankingKey, "asc")}
        ratingActive={sortKey === config.ratingKey}
        onRatingClick={() => changeSort(config.ratingKey, "desc")}
        activeMetricKey={activeMetricKey}
        onMetricClick={(key) => changeSort(key, "desc")}
        slug={slug}
        players={sortedEntries}
        rowTestId="leaderboard-row"
      />
    </div>
  );
}
