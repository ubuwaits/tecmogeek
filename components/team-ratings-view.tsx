"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";

import { PlayerListHeaderLabel } from "@/components/player-list-header-label";
import { HelmetSprite } from "@/components/sprites";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { teamRoute } from "@/lib/routes";
import { getNextSortDirection } from "@/lib/sort-utils";
import type { SortDirection, TeamRatingRecord } from "@/lib/types";

type TeamRatingSortKey =
  | "overall_rating"
  | "offensive_rating"
  | "defensive_rating"
  | "running_offense"
  | "passing_offense"
  | "balanced_offense"
  | "dl_group"
  | "lb_group"
  | "secondary_group";

type TeamRatingColumn = {
  key: TeamRatingSortKey;
  label: string;
  tooltip: string;
  group?: "offense" | "defense";
};

const OFFENSE_PARENT_COLUMN: TeamRatingColumn = {
  key: "offensive_rating",
  label: "Off",
  tooltip: "Overall offensive rating",
};

const DEFENSE_PARENT_COLUMN: TeamRatingColumn = {
  key: "defensive_rating",
  label: "Def",
  tooltip: "Overall defensive rating",
};

const OFFENSE_SUB_COLUMNS: readonly TeamRatingColumn[] = [
  { key: "running_offense", label: "Run", tooltip: "Running offense rating", group: "offense" },
  { key: "passing_offense", label: "Pass", tooltip: "Passing offense rating", group: "offense" },
  { key: "balanced_offense", label: "Bal", tooltip: "Balanced offense rating", group: "offense" },
];

const DEFENSE_SUB_COLUMNS: readonly TeamRatingColumn[] = [
  { key: "dl_group", label: "DL", tooltip: "Defensive line group rating", group: "defense" },
  { key: "lb_group", label: "LB", tooltip: "Linebacker group rating", group: "defense" },
  { key: "secondary_group", label: "Sec", tooltip: "Secondary group rating", group: "defense" },
];

const TEAM_NAME_COLUMN_WIDTH = 240;
const RATING_COLUMN_WIDTH = 96;
const EXPANDED_GROUP_BACKGROUND_COLOR = "#165ec9";
const EXPANDED_GROUP_HORIZONTAL_INSET = 8;

type TeamRatingsViewProps = {
  teams: TeamRatingRecord[];
};

function hasSameOrder<T>(left: readonly T[], right: readonly T[]) {
  return left.length === right.length && left.every((entry, index) => entry === right[index]);
}

function formatRating(value: number) {
  return `${value.toFixed(1)}%`;
}

function getDisplayedRank(index: number, total: number, direction: SortDirection) {
  return direction === "desc" ? index + 1 : total - index;
}

function getSortValue(team: TeamRatingRecord, sortKey: TeamRatingSortKey) {
  switch (sortKey) {
    case "overall_rating":
    case "offensive_rating":
    case "defensive_rating":
      return team[sortKey];
    case "running_offense":
    case "passing_offense":
    case "balanced_offense":
    case "dl_group":
    case "lb_group":
    case "secondary_group":
      return team.components[sortKey];
  }
}

function sortTeamsByKey(
  teams: readonly TeamRatingRecord[],
  sortKey: TeamRatingSortKey,
  sortDirection: SortDirection,
) {
  return [...teams].sort((left, right) => {
    const ratingDifference =
      sortDirection === "desc"
        ? getSortValue(right, sortKey) - getSortValue(left, sortKey)
        : getSortValue(left, sortKey) - getSortValue(right, sortKey);

    if (ratingDifference !== 0) {
      return ratingDifference;
    }

    return left.full_name.localeCompare(right.full_name);
  });
}

function buildVisibleColumns(offenseExpanded: boolean, defenseExpanded: boolean): TeamRatingColumn[] {
  return [
    { key: "overall_rating", label: "Overall", tooltip: "Overall team rating" },
    OFFENSE_PARENT_COLUMN,
    ...(offenseExpanded ? OFFENSE_SUB_COLUMNS : []),
    DEFENSE_PARENT_COLUMN,
    ...(defenseExpanded ? DEFENSE_SUB_COLUMNS : []),
  ];
}

function getGridTemplateColumns(columnCount: number) {
  return `56px ${TEAM_NAME_COLUMN_WIDTH}px repeat(${columnCount}, ${RATING_COLUMN_WIDTH}px)`;
}

function getExpandedGroupPosition(
  column: TeamRatingColumn,
  offenseExpanded: boolean,
  defenseExpanded: boolean,
) {
  if (offenseExpanded) {
    if (column.key === OFFENSE_PARENT_COLUMN.key) {
      return "start";
    }

    if (column.key === OFFENSE_SUB_COLUMNS.at(-1)?.key) {
      return "end";
    }

    if (column.group === "offense") {
      return "middle";
    }
  }

  if (defenseExpanded) {
    if (column.key === DEFENSE_PARENT_COLUMN.key) {
      return "start";
    }

    if (column.key === DEFENSE_SUB_COLUMNS.at(-1)?.key) {
      return "end";
    }

    if (column.group === "defense") {
      return "middle";
    }
  }

  return null;
}

function getColumnCellClass(
  column: TeamRatingColumn,
  offenseExpanded: boolean,
  defenseExpanded: boolean,
) {
  const groupPosition = getExpandedGroupPosition(column, offenseExpanded, defenseExpanded);
  const isParentColumn = column.key === OFFENSE_PARENT_COLUMN.key || column.key === DEFENSE_PARENT_COLUMN.key;

  if (groupPosition === "start") {
    return "pl-4 pr-3";
  }

  if (groupPosition === "end") {
    return "pl-3 pr-4";
  }

  if (groupPosition === "middle") {
    return "px-3";
  }

  if (isParentColumn) {
    return "pl-4 pr-3";
  }

  return "";
}

function getExpandedGroupRange(
  visibleColumns: readonly TeamRatingColumn[],
  group: "offense" | "defense",
) {
  const parentColumn = group === "offense" ? OFFENSE_PARENT_COLUMN : DEFENSE_PARENT_COLUMN;
  const subColumns = group === "offense" ? OFFENSE_SUB_COLUMNS : DEFENSE_SUB_COLUMNS;
  const startColumnIndex = visibleColumns.findIndex((column) => column.key === parentColumn.key);
  const endColumnIndex = visibleColumns.findIndex((column) => column.key === subColumns[subColumns.length - 1]?.key);

  if (startColumnIndex === -1 || endColumnIndex === -1 || endColumnIndex < startColumnIndex) {
    return null;
  }

  const start = 56 + TEAM_NAME_COLUMN_WIDTH + (startColumnIndex * RATING_COLUMN_WIDTH) + EXPANDED_GROUP_HORIZONTAL_INSET;
  const end =
    56 +
    TEAM_NAME_COLUMN_WIDTH +
    ((endColumnIndex + 1) * RATING_COLUMN_WIDTH) -
    EXPANDED_GROUP_HORIZONTAL_INSET;

  return { start, end };
}

function getGroupedBackgroundStyle(
  visibleColumns: readonly TeamRatingColumn[],
  offenseExpanded: boolean,
  defenseExpanded: boolean,
): CSSProperties {
  const backgroundLayers = [
    offenseExpanded ? getExpandedGroupRange(visibleColumns, "offense") : null,
    defenseExpanded ? getExpandedGroupRange(visibleColumns, "defense") : null,
  ]
    .filter((range): range is NonNullable<ReturnType<typeof getExpandedGroupRange>> => Boolean(range))
    .map(
      (range) =>
        `linear-gradient(90deg, transparent ${range.start}px, ${EXPANDED_GROUP_BACKGROUND_COLOR} ${range.start}px, ${EXPANDED_GROUP_BACKGROUND_COLOR} ${range.end}px, transparent ${range.end}px)`,
    );

  return {
    ...(backgroundLayers.length > 0 ? { backgroundImage: backgroundLayers.join(",") } : {}),
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
  const [sortKey, setSortKey] = useState<TeamRatingSortKey>("overall_rating");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [offenseExpanded, setOffenseExpanded] = useState(false);
  const [defenseExpanded, setDefenseExpanded] = useState(false);
  const visibleColumns = buildVisibleColumns(offenseExpanded, defenseExpanded);
  const gridTemplateColumns = getGridTemplateColumns(visibleColumns.length);
  const groupedBackgroundStyle = getGroupedBackgroundStyle(
    visibleColumns,
    offenseExpanded,
    defenseExpanded,
  );
  const sortedTeams = sortTeamsByKey(teams, sortKey, sortDirection);

  function changeSort(key: TeamRatingSortKey, defaultDirection: SortDirection = "desc") {
    const descendingOrder = sortTeamsByKey(teams, key, "desc");
    const ascendingOrder = sortTeamsByKey(teams, key, "asc");
    const nextDefaultDirection = hasSameOrder(sortedTeams, descendingOrder)
      ? "asc"
      : hasSameOrder(sortedTeams, ascendingOrder)
        ? "desc"
        : defaultDirection;
    const nextDirection = getNextSortDirection({
      currentKey: sortKey,
      nextKey: key,
      currentDirection: sortDirection,
      defaultDirection: nextDefaultDirection,
    });

    setSortKey(key);
    setSortDirection(nextDirection);
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
            <div>
              <StaticHeaderLabel label="Team" />
            </div>
            {visibleColumns.map((column) => (
              <div
                key={column.key}
                className={`text-[14px] font-bold py-1.5 ${getColumnCellClass(column, offenseExpanded, defenseExpanded)}`}
              >
                {column.key === OFFENSE_PARENT_COLUMN.key ? (
                  <GroupHeaderControl
                    active={sortKey === column.key}
                    expanded={offenseExpanded}
                    label={column.label}
                    tooltip={column.tooltip}
                    toggleLabel="offense"
                    onSort={() => changeSort(column.key)}
                    onToggle={() => setOffenseExpanded((current) => !current)}
                  />
                ) : column.key === DEFENSE_PARENT_COLUMN.key ? (
                  <GroupHeaderControl
                    active={sortKey === column.key}
                    expanded={defenseExpanded}
                    label={column.label}
                    tooltip={column.tooltip}
                    toggleLabel="defense"
                    onSort={() => changeSort(column.key)}
                    onToggle={() => setDefenseExpanded((current) => !current)}
                  />
                ) : (
                  <PlayerListHeaderLabel
                    label={column.label}
                    tooltip={column.tooltip}
                    active={sortKey === column.key}
                    onClick={() => changeSort(column.key)}
                  />
                )}
              </div>
            ))}
          </li>

          {sortedTeams.map((team, index) => (
            <li key={team.team} data-testid="team-ratings-row">
              <div className="grid w-full items-center rounded-lg" style={{ gridTemplateColumns }}>
                <div className="text-[14px] font-bold tabular-nums">
                  {getDisplayedRank(index, sortedTeams.length, sortDirection)}
                </div>

                <div className="min-w-0">
                  <Link
                    href={teamRoute(team.team)}
                    className="flex min-h-11 items-center gap-3 rounded-lg px-2 py-2 text-inherit no-underline transition-colors hover:bg-white/6 hover:text-(--pink)"
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
                    className={`flex min-h-11 items-center text-[14px] font-bold tabular-nums ${getColumnCellClass(column, offenseExpanded, defenseExpanded)}`}
                  >
                    {formatRating(getSortValue(team, column.key))}
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
