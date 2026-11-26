"use client";

import Link from "next/link";
import { useState } from "react";

import { PlayerListHeaderLabel } from "@/components/ui/player-list-header-label";
import { HelmetSprite } from "@/components/ui/sprites";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { teamRoute } from "@/lib/site/routes";
import { getNextSortState, type SortState } from "@/lib/shared/sort-state";
import {
  formatTeamRating,
  getRankedTeamRows,
  getTeamRatingSortValue,
  sortTeamRatingsByKey,
  type TeamRatingSortKey,
} from "@/lib/teams/ratings";
import type { SortDirection, TeamRatingRecord } from "@/lib/types";

type TeamRatingColumn = {
  key: TeamRatingSortKey;
  label: string;
  tooltip: string;
};

type Group = "offense" | "defense";
type VisibleColumn = TeamRatingColumn & { padding: string; toggle?: Group };

const COLUMN_GROUPS: readonly {
  group: Group;
  parent: TeamRatingColumn;
  children: readonly TeamRatingColumn[];
}[] = [
  {
    group: "offense",
    parent: { key: "offensive_rating", label: "Off", tooltip: "Overall offensive rating" },
    children: [
      { key: "running_offense", label: "Run", tooltip: "Running offense rating" },
      { key: "passing_offense", label: "Pass", tooltip: "Passing offense rating" },
      { key: "balanced_offense", label: "Bal", tooltip: "Balanced offense rating" },
    ],
  },
  {
    group: "defense",
    parent: { key: "defensive_rating", label: "Def", tooltip: "Overall defensive rating" },
    children: [
      { key: "dl_group", label: "DL", tooltip: "Defensive line group rating" },
      { key: "lb_group", label: "LB", tooltip: "Linebacker group rating" },
      { key: "secondary_group", label: "Sec", tooltip: "Secondary group rating" },
    ],
  },
];

const RANK_COLUMN_WIDTH = 56;
const TEAM_NAME_COLUMN_WIDTH = 256;
const RATING_COLUMN_WIDTH = 96;
const EXPANDED_GROUP_BACKGROUND_COLOR = "#165ec9";
const EXPANDED_GROUP_HORIZONTAL_INSET = 8;

type TeamRatingsViewProps = {
  teams: TeamRatingRecord[];
};

function buildTableLayout(expanded: Record<Group, boolean>) {
  const visibleColumns: VisibleColumn[] = [
    { key: "overall_rating", label: "Overall", tooltip: "Overall team rating", padding: "" },
  ];
  const backgrounds: string[] = [];
  const ratingOffset = RANK_COLUMN_WIDTH + TEAM_NAME_COLUMN_WIDTH;

  for (const { group, parent, children } of COLUMN_GROUPS) {
    const first = visibleColumns.length;
    visibleColumns.push({ ...parent, padding: "pl-4 pr-3", toggle: group });
    if (!expanded[group]) continue;

    children.forEach((column, index) => {
      visibleColumns.push({ ...column, padding: index === children.length - 1 ? "pl-3 pr-4" : "px-3" });
    });
    const start = ratingOffset + first * RATING_COLUMN_WIDTH + EXPANDED_GROUP_HORIZONTAL_INSET;
    const end = ratingOffset + visibleColumns.length * RATING_COLUMN_WIDTH - EXPANDED_GROUP_HORIZONTAL_INSET;
    backgrounds.push(`linear-gradient(90deg, transparent ${start}px, ${EXPANDED_GROUP_BACKGROUND_COLOR} ${start}px, ${EXPANDED_GROUP_BACKGROUND_COLOR} ${end}px, transparent ${end}px)`);
  }

  return {
    visibleColumns,
    gridTemplateColumns: `${RANK_COLUMN_WIDTH}px ${TEAM_NAME_COLUMN_WIDTH}px repeat(${visibleColumns.length}, ${RATING_COLUMN_WIDTH}px)`,
    groupedBackgroundStyle: { backgroundImage: backgrounds.join(",") || undefined },
  };
}

function StaticHeaderLabel({ label }: { label: string }) {
  return (
    <div className="flex min-h-8 w-full items-end justify-start">
      <span className="inline-flex whitespace-nowrap pb-0 text-[11px] font-bold uppercase leading-none tracking-[0.08em] text-white/72">
        {label}
      </span>
    </div>
  );
}

function GroupToggleButton({
  expanded,
  label,
  onClick,
}: {
  expanded: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-expanded={expanded}
      aria-label={expanded ? `Hide ${label} sub-ratings` : `Show ${label} sub-ratings`}
      title={expanded ? `Hide ${label} sub-ratings` : `Show ${label} sub-ratings`}
      onClick={onClick}
      className="inline-flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-sm bg-white/8 text-white/72 shadow-[0_0_0_1px_rgba(255,255,255,0.08)] transition-[background-color,color,transform,box-shadow] duration-150 hover:bg-white/12 hover:text-white hover:shadow-[0_0_0_1px_rgba(255,255,255,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
    >
      <span className={`block translate-x-px text-[11px] leading-none transition-transform duration-150 ${expanded ? "rotate-90" : ""}`}>
        ▸
      </span>
    </button>
  );
}

function GroupHeaderControl({
  active,
  expanded,
  label,
  tooltip,
  toggleLabel,
  onSort,
  onToggle,
}: {
  active: boolean;
  expanded: boolean;
  label: string;
  tooltip: string;
  toggleLabel: string;
  onSort: () => void;
  onToggle: () => void;
}) {
  return (
    <div className="flex min-h-8 items-end justify-start gap-1.5">
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <button type="button" onClick={onSort} className="inline-flex cursor-pointer items-end self-end">
            <span
              className={`inline-flex items-end whitespace-nowrap border-b border-dotted border-white/30 pb-0 text-[11px] font-bold uppercase leading-none tracking-[0.08em] transition-colors ${
                active ? "text-white" : "text-white/72 hover:text-white"
              }`}
            >
              {label}
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>

      <GroupToggleButton
        expanded={expanded}
        label={toggleLabel}
        onClick={onToggle}
      />
    </div>
  );
}

export function TeamRatingsView({ teams }: TeamRatingsViewProps) {
  const [sort, setSort] = useState<SortState<TeamRatingSortKey>>({ key: "overall_rating", direction: "desc" });
  const [expanded, setExpanded] = useState({ offense: false, defense: false });
  const { visibleColumns, gridTemplateColumns, groupedBackgroundStyle } = buildTableLayout(expanded);
  const rankedRows = getRankedTeamRows(teams, sort.key, sort.direction);

  function toggleGroup(group: Group) {
    setExpanded(current => ({ ...current, [group]: !current[group] }));
  }

  function changeSort(key: TeamRatingSortKey, defaultDirection: SortDirection = "desc") {
    setSort(getNextSortState({
      current: sort,
      nextKey: key,
      defaultDirection,
      currentOrder: rankedRows.map(row => row.team),
      orderFor: direction => sortTeamRatingsByKey(teams, key, direction),
    }));
  }

  return (
    <div className="mb-14 sm:mb-16">
      <div className="overflow-x-auto overscroll-x-contain pb-2" data-testid="team-ratings-table-scroll">
        <ol className="w-max min-w-full space-y-4 sm:space-y-3" style={groupedBackgroundStyle}>
          <li
            className="grid w-full items-center border-b-4 border-white/35 pb-3 text-white/65"
            style={{ gridTemplateColumns }}
          >
            <div>
              <StaticHeaderLabel label="Rank" />
            </div>
            <div className="pr-4">
              <StaticHeaderLabel label="Team" />
            </div>
            {visibleColumns.map(({ toggle, ...column }) => (
              <div
                key={column.key}
                className={`text-[14px] font-bold py-1.5 ${column.padding}`}
              >
                {toggle ? (
                  <GroupHeaderControl
                    active={sort.key === column.key}
                    expanded={expanded[toggle]}
                    label={column.label}
                    tooltip={column.tooltip}
                    toggleLabel={toggle}
                    onSort={() => changeSort(column.key)}
                    onToggle={() => toggleGroup(toggle)}
                  />
                ) : (
                  <PlayerListHeaderLabel
                    label={column.label}
                    tooltip={column.tooltip}
                    active={sort.key === column.key}
                    onClick={() => changeSort(column.key)}
                  />
                )}
              </div>
            ))}
          </li>

          {rankedRows.map(({ team, rank }) => (
            <li key={team.team} data-testid="team-ratings-row">
              <div className="grid w-full items-center rounded-lg" style={{ gridTemplateColumns }}>
                <div className="text-[14px] font-bold tabular-nums">
                  {rank}
                </div>

                <div className="min-w-0 pr-4">
                  <Link
                    href={teamRoute(team.team)}
                    className="flex w-full min-h-11 items-center gap-3 rounded-lg px-2 py-2 text-inherit no-underline transition-colors hover:bg-white/6 hover:text-(--pink)"
                  >
                    <span className="flex shrink-0 items-center justify-center">
                      <HelmetSprite team={team.team} />
                    </span>

                    <div className="min-w-0">
                      <h3 className="text-[14px] font-medium leading-none text-balance">{team.full_name}</h3>
                    </div>
                  </Link>
                </div>

                {visibleColumns.map((column) => (
                  <div
                    key={column.key}
                    className={`flex min-h-11 items-center text-[14px] font-bold tabular-nums ${column.padding}`}
                  >
                    {formatTeamRating(getTeamRatingSortValue(team, column.key))}
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
