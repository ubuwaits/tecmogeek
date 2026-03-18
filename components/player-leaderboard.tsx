"use client";

import Link from "next/link";
import { useState } from "react";

import { HeadshotSprite, HelmetSprite } from "@/components/sprites";
import { TooltipLabel } from "@/components/tooltip-label";
import { POSITION_PAGE_CONFIG_MAP } from "@/lib/site-config";
import { sortEntriesByKey, getTeamSlugFromCode, matchesPrefixes } from "@/lib/player-utils";
import { teamRoute } from "@/lib/routes";
import type { PlayerMetricKey, PlayerRecord, PlayerSortKey, PositionSlug, SortDirection } from "@/lib/types";

type PlayerLeaderboardProps = {
  slug: PositionSlug;
  entries: PlayerRecord[];
};

function renderMetricValue(entry: PlayerRecord, key: PlayerMetricKey): number {
  return Number(entry[key] ?? 0);
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

  function changeSort(key: PlayerSortKey, direction: SortDirection) {
    setSortKey(key);
    setSortDirection(direction);
  }

  return (
    <>
      <header className="mb-12">
        <h1 className="font-[family-name:var(--font-tecmo)] text-[32px] leading-none uppercase">
          {config.title}
        </h1>
        <p className="mt-2 text-[16px] font-medium text-white/65">{config.note}</p>
      </header>

      <div className="mb-16">
        {config.filters?.length ? (
          <ul className="mb-8 text-left">
            {config.filters.map((filter) => {
              const active = filter.id === filterId;

              return (
                <li key={filter.id} className="mr-3 inline-block">
                  <button
                    type="button"
                    data-testid={`filter-${filter.id}`}
                    onClick={() => setFilterId(filter.id)}
                    className={`relative border-b-2 pb-0.5 font-bold ${
                      active
                        ? "border-transparent text-white"
                        : "border-white/65 text-white/65 hover:border-white hover:text-white"
                    }`}
                  >
                    {filter.label}
                    {active ? (
                      <span className="absolute left-1/2 top-full mt-1 h-0 w-0 -translate-x-1/2 border-x-[8px] border-t-[8px] border-x-transparent border-t-white" />
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}

        <ol className="space-y-3">
          <li className="grid grid-cols-[52px_32px_32px_180px_52px_1fr] items-center border-b-4 border-white/35 pb-3 text-white/65">
            <div className="text-center text-[14px] font-bold">
              <TooltipLabel
                label="Ranking"
                tooltip={config.rankingTooltip}
                onClick={() => changeSort(config.rankingKey, "asc")}
                active={sortKey === config.rankingKey}
              />
            </div>
            <div />
            <div />
            <div />
            <div className="text-center text-[14px] font-bold">
              <TooltipLabel
                label="Rating"
                tooltip="Out of 100%"
                onClick={() => changeSort(config.ratingKey, "desc")}
                active={sortKey === config.ratingKey}
              />
            </div>

            <div className="ml-4 flex gap-2">
              {config.columns.map((column) => (
                <div
                  key={column.key}
                  className="text-[14px]"
                  style={{ flexBasis: 0, flexGrow: column.weight }}
                >
                  <TooltipLabel
                    label={column.label}
                    tooltip={column.tooltip}
                    onClick={() => changeSort(column.key, "desc")}
                    active={sortKey === column.key}
                  />
                </div>
              ))}
            </div>
          </li>

          {sortedEntries.map((entry) => {
            const teamSlug = getTeamSlugFromCode(entry.team);

            return (
              <li
                key={`${entry.team}-${entry.position}-${entry.name}`}
                data-testid="leaderboard-row"
                data-position={entry.position}
                className="grid grid-cols-[52px_32px_32px_180px_52px_1fr] items-center"
              >
                <div className="text-center text-[18px] font-bold">
                  {String(entry[config.rankingKey] ?? "")}
                </div>

                <Link href={teamRoute(teamSlug)} className="flex items-center justify-center">
                  <HelmetSprite team={teamSlug} />
                </Link>

                <div className="flex items-center justify-center">
                  <HeadshotSprite team={teamSlug} position={entry.position as never} />
                </div>

                <div className="pl-3">
                  <h3 className="text-[18px]">{entry.name}</h3>
                  <h4 className="text-[14px] font-medium text-white/65">
                    {entry.position} {entry.number}
                  </h4>
                </div>

                <div className="text-center text-[18px] font-bold">
                  {String(entry[config.ratingKey] ?? "")}
                </div>

                <div className="ml-4 flex gap-2">
                  {config.columns.map((column) => {
                    const value = renderMetricValue(entry, column.key);

                    return (
                      <div
                        key={column.key}
                        data-metric-key={column.key}
                        className="min-w-0 border-[3px] border-white bg-white/25 px-1 py-2 text-center text-[12px] font-bold text-[#222]"
                        style={{
                          flexBasis: 0,
                          flexGrow: column.weight,
                          backgroundImage: `linear-gradient(to right, var(--pink) 0%, var(--pink) ${value}%, transparent ${value}%)`,
                        }}
                      >
                        {value}
                      </div>
                    );
                  })}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </>
  );
}
