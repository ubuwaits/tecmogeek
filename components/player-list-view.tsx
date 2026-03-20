"use client";

import { useState } from "react";

import {
  PlayerIdentityCell,
  PlayerListHeaderRow,
  PlayerListRow,
  PlayerListTable,
} from "@/components/player-list-table";
import { MetricLegend, MetricStrip } from "@/components/metric-strip";
import { PlayerListHeaderLabel } from "@/components/player-list-header-label";
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

  function changeSort(key: PlayerSortKey, direction: SortDirection) {
    setSortKey(key);
    setSortDirection(direction);
  }

  return (
    <>
      <header className="mb-8 sm:mb-12">
        <h1 className="font-(family-name:--font-tecmo) text-[24px] leading-snug uppercase text-balance sm:text-[32px]">
          {config.title}
        </h1>
        <p className="mt-3 max-w-[48rem] text-[15px] font-medium text-pretty text-white/65 sm:mt-2 sm:text-[16px]">
          {config.note}
        </p>
      </header>

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

        <PlayerListTable testId="player-table-scroll">
          <PlayerListHeaderRow layout="player">
            <div className="text-center text-[14px] font-bold">
              <PlayerListHeaderLabel
                label="Ranking"
                tooltip={config.rankingTooltip}
                onClick={() => changeSort(config.rankingKey, "asc")}
                active={sortKey === config.rankingKey}
              />
            </div>
            <div />
            <div className="text-center text-[14px] font-bold">
              <PlayerListHeaderLabel
                label="Rating"
                tooltip="Out of 100%"
                onClick={() => changeSort(config.ratingKey, "desc")}
                active={sortKey === config.ratingKey}
              />
            </div>

            <MetricLegend
              columns={config.columns}
              activeKey={activeMetricKey}
              onColumnClick={(key) => changeSort(key, "desc")}
            />
          </PlayerListHeaderRow>

          {sortedEntries.map((entry) => {
            const teamSlug = getTeamSlugFromCode(entry.team);

            return (
              <li
                key={`${entry.team}-${entry.position}-${entry.name}`}
                data-testid="leaderboard-row"
                data-position={entry.position}
              >
                <PlayerListRow layout="player">
                  <div className="text-center text-[18px] font-bold tabular-nums">
                    {String(entry[config.rankingKey] ?? "")}
                  </div>

                  <PlayerIdentityCell
                    layout="player"
                    team={teamSlug}
                    helmetHref={teamRoute(teamSlug)}
                    headshotPosition={entry.position}
                    name={entry.name}
                    position={entry.position}
                    number={entry.number}
                  />

                  <div className="text-center text-[18px] font-bold tabular-nums">
                    {String(entry[config.ratingKey] ?? "")}
                  </div>

                  <MetricStrip
                    columns={config.columns}
                    getValue={(key) => renderMetricValue(entry, key)}
                    className="ml-3 md:ml-4"
                  />
                </PlayerListRow>
              </li>
            );
          })}
        </PlayerListTable>
      </div>
    </>
  );
}
