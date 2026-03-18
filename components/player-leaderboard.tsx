"use client";

import Link from "next/link";
import { useState } from "react";

import { MetricLegend, MetricStrip, MobileMetricList } from "@/components/metric-strip";
import { HeadshotSprite, HelmetSprite } from "@/components/sprites";
import { POSITION_PAGE_CONFIG_MAP } from "@/lib/site-config";
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

function renderMetricValue(entry: PlayerRecord, key: PlayerMetricKey): number {
  return Number(entry[key] ?? 0);
}

function getSortButtonClass(active: boolean, align: "left" | "center" | "right") {
  const alignClassName =
    align === "left" ? "justify-start text-left" : align === "right" ? "justify-end text-right" : "justify-center";

  return `inline-flex min-h-8 items-center ${alignClassName} rounded px-1 text-[11px] font-bold uppercase tracking-[0.08em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${
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
          <ul className="mb-6 flex flex-wrap gap-x-3 gap-y-2 text-left sm:mb-8">
            {config.filters.map((filter) => {
              const active = filter.id === filterId;

              return (
                <li key={filter.id}>
                  <button
                    type="button"
                    data-testid={`filter-${filter.id}`}
                    onClick={() => setFilterId(filter.id)}
                    className={`relative min-h-10 rounded px-1 pb-0.5 font-bold transition ${
                      active
                        ? "border-transparent text-white"
                        : "border-white/65 text-white/65 hover:border-white hover:text-white"
                    } border-b-2`}
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

        <ol className="space-y-4 sm:space-y-3">
          <li className="hidden sm:grid sm:grid-cols-[52px_32px_32px_minmax(0,180px)_52px_minmax(0,1fr)] sm:items-center sm:border-b-4 sm:border-white/35 sm:pb-3 sm:text-white/65">
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
            <div />
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
          </li>

          {sortedEntries.map((entry) => {
            const teamSlug = getTeamSlugFromCode(entry.team);

            return (
              <li
                key={`${entry.team}-${entry.position}-${entry.name}`}
                data-testid="leaderboard-row"
                data-position={entry.position}
              >
                <article className="rounded-[20px] bg-white/[0.07] p-3 shadow-[0_0_0_1px_rgba(255,255,255,0.08)] sm:hidden">
                  <div className="flex items-start gap-3">
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <div className="flex shrink-0 items-center gap-2">
                        <Link
                          href={teamRoute(teamSlug)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/8"
                        >
                          <HelmetSprite team={teamSlug} />
                        </Link>
                        <HeadshotSprite team={teamSlug} position={entry.position as never} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-[18px] leading-[1.05] text-balance">{entry.name}</h3>
                        <h4 className="mt-1 text-[14px] font-medium text-white/65">
                          {entry.position} {entry.number}
                        </h4>
                        <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                          <div className="flex items-baseline gap-2">
                            <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-white/55">
                              Rating
                            </span>
                            <span className="text-[18px] font-bold tabular-nums text-white">
                              {String(entry[config.ratingKey] ?? "")}
                            </span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-white/55">
                              Rank
                            </span>
                            <span className="text-[18px] font-bold tabular-nums text-white">
                              {String(entry[config.rankingKey] ?? "")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <MobileMetricList
                      columns={config.columns}
                      getValue={(key) => renderMetricValue(entry, key)}
                    />
                  </div>
                </article>

                <div className="hidden sm:grid sm:grid-cols-[52px_32px_32px_minmax(0,180px)_52px_minmax(0,1fr)] sm:items-center">
                  <div className="text-center text-[18px] font-bold tabular-nums">
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

                  <div className="text-center text-[18px] font-bold tabular-nums">
                    {String(entry[config.ratingKey] ?? "")}
                  </div>

                  <MetricStrip columns={config.columns} getValue={(key) => renderMetricValue(entry, key)} className="ml-3 md:ml-4" />
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </>
  );
}
