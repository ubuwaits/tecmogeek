"use client";

import { useState } from "react";

import { PlayerListSection } from "@/components/players/player-list-table";
import { SelectionTabs } from "@/components/ui/selection-tabs";
import { POSITION_PAGE_CONFIG_MAP } from "@/lib/players/config";
import { matchesPrefixes, rankingTooltip, sortEntriesByKey } from "@/lib/players/utils";
import { getNextSortState, type SortState } from "@/lib/shared/sort-state";
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
  const [sort, setSort] = useState<SortState<PlayerSortKey>>({ key: config.rankingKey, direction: "asc" });
  const [filterId, setFilterId] = useState(config.defaultFilterId ?? "all");

  const activeFilter = config.filters?.find((filter) => filter.id === filterId);
  const filteredEntries = activeFilter
    ? entries.filter((entry) => matchesPrefixes(entry.position, activeFilter.allowedPrefixes))
    : entries;
  const sortedEntries = sortEntriesByKey(filteredEntries, sort.key, sort.direction, config.rankingKey);
  const activeMetricKey = config.columns.find((column) => column.key === sort.key)?.key ?? null;

  function changeSort(key: PlayerSortKey, defaultDirection: SortDirection) {
    setSort(getNextSortState({
      current: sort,
      nextKey: key,
      defaultDirection,
      currentOrder: sortedEntries,
      orderFor: direction => sortEntriesByKey(filteredEntries, key, direction, config.rankingKey),
    }));
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
        rankingActive={sort.key === config.rankingKey}
        onRankingClick={() => changeSort(config.rankingKey, "asc")}
        ratingActive={sort.key === config.ratingKey}
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
