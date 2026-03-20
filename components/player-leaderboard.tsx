"use client";

import Link from "next/link";
import { useState } from "react";

import { HorizontalScrollTable } from "@/components/horizontal-scroll-table";
import { MetricLegend, MetricStrip } from "@/components/metric-strip";
import { SkillTabs } from "@/components/skill-tabs";
import { HeadshotSprite, HelmetSprite } from "@/components/sprites";
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

type PlayerLeaderboardProps = {
  slug: PositionSlug;
  entries: PlayerRecord[];
};

function PlayerTableHeaderRow({ children }: { children: React.ReactNode }) {
  return (
    <li className="grid w-full grid-cols-[52px_252px_52px_minmax(520px,1fr)] items-center border-b-4 border-white/35 pb-3 text-white/65 sm:grid-cols-[52px_minmax(0,252px)_52px_minmax(0,1fr)]">
      {children}
    </li>
  );
}

function PlayerTableRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid w-full grid-cols-[52px_252px_52px_minmax(520px,1fr)] items-center sm:grid-cols-[52px_minmax(0,252px)_52px_minmax(0,1fr)]">
      {children}
    </div>
  );
}

function renderMetricValue(entry: PlayerRecord, key: PlayerMetricKey): number {
  return Number(entry[key] ?? 0);
}

function getSortButtonClass(active: boolean, align: "left" | "center" | "right") {
  return `inline-flex min-h-8 items-center ${
    align === "left" ? "justify-start text-left" : align === "right" ? "justify-end text-right" : "justify-center"
  } rounded px-1 text-[11px] font-bold uppercase tracking-[0.08em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${
    active ? "text-white" : "text-white/72 hover:text-white"
  }`;
}

export function PlayerLeaderboard({ slug, entries }: PlayerLeaderboardProps) {
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
        <h1 className="font-(family-name:--font-tecmo) text-[26px] leading-[0.92] uppercase text-balance sm:text-[32px]">
          {config.title}
        </h1>
        <p className="mt-3 max-w-[48rem] text-[15px] font-medium text-pretty text-white/65 sm:mt-2 sm:text-[16px]">
          {config.note}
        </p>
      </header>

      <div className="mb-14 sm:mb-16">
        {config.filters?.length ? (
          <SkillTabs
            items={config.filters}
            activeId={filterId}
            onChange={setFilterId}
            tabTestIdPrefix="filter"
            mobileSelectLabel="Player filter"
            mobileSelectTestId="player-filter-select"
          />
        ) : null}

        <HorizontalScrollTable testId="player-table-scroll">
          <PlayerTableHeaderRow>
              <div className="text-center text-[14px] font-bold">
                <button
                  type="button"
                  onClick={() => changeSort(config.rankingKey, "asc")}
                  className={getSortButtonClass(sortKey === config.rankingKey, "center")}
                >
                  Ranking
                </button>
              </div>
              <div />
              <div className="text-center text-[14px] font-bold">
                <button
                  type="button"
                  onClick={() => changeSort(config.ratingKey, "desc")}
                  className={getSortButtonClass(sortKey === config.ratingKey, "center")}
                >
                  Rating
                </button>
              </div>

              <MetricLegend
                columns={config.columns}
                activeKey={activeMetricKey}
                onColumnClick={(key) => changeSort(key, "desc")}
              />
          </PlayerTableHeaderRow>

          {sortedEntries.map((entry) => {
            const teamSlug = getTeamSlugFromCode(entry.team);

            return (
              <li
                key={`${entry.team}-${entry.position}-${entry.name}`}
                data-testid="leaderboard-row"
                data-position={entry.position}
              >
                <PlayerTableRow>
                    <div className="text-center text-[18px] font-bold tabular-nums">
                      {String(entry[config.rankingKey] ?? "")}
                    </div>

                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex shrink-0 items-center gap-3">
                        <Link href={teamRoute(teamSlug)} className="flex items-center justify-center">
                          <HelmetSprite team={teamSlug} />
                        </Link>
                        <HeadshotSprite team={teamSlug} position={entry.position as never} />
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-[18px] leading-[1.05] text-balance sm:leading-normal">
                          {entry.name}
                        </h3>
                        <h4 className="text-[14px] font-medium text-white/65">
                          {entry.position} {entry.number}
                        </h4>
                      </div>
                    </div>

                    <div className="text-center text-[18px] font-bold tabular-nums">
                      {String(entry[config.ratingKey] ?? "")}
                    </div>

                    <MetricStrip
                      columns={config.columns}
                      getValue={(key) => renderMetricValue(entry, key)}
                      className="ml-3 md:ml-4"
                    />
                </PlayerTableRow>
              </li>
            );
          })}
        </HorizontalScrollTable>
      </div>
    </>
  );
}
