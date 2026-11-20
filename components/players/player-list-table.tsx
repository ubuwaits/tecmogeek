import Link from "next/link";
import type { Route } from "next";
import { playerRoute, teamRoute } from "@/lib/site/routes";
import { POSITION_PAGE_CONFIG_MAP } from "@/lib/players/config";

import { MetricLegend, MetricStrip } from "@/components/players/metric-strip";
import { PlayerListHeaderLabel } from "@/components/ui/player-list-header-label";
import { HeadshotSprite, HelmetSprite } from "@/components/ui/sprites";
import type { LeaderboardPlayer, MetricColumn, PlayerMetricKey, PlayerRecord, PositionSlug, TeamSlug } from "@/lib/types";

const PLAYER_LIST_GRID_CLASS = {
  player: {
    row: "grid w-full grid-cols-[44px_224px_52px_minmax(520px,1fr)] items-center sm:grid-cols-[44px_minmax(0,224px)_52px_minmax(0,1fr)]",
    note: "",
  },
  team: {
    row: "grid w-full grid-cols-[44px_32px_156px_52px_minmax(520px,1fr)] items-center sm:grid-cols-[44px_32px_minmax(0,156px)_52px_minmax(0,1fr)]",
    note: "sm:grid sm:grid-cols-[44px_32px_minmax(0,156px)_52px_minmax(0,1fr)]",
  },
} as const;

type PlayerListLayout = keyof typeof PLAYER_LIST_GRID_CLASS;

type PlayerListTableProps = {
  children: React.ReactNode;
  testId?: string;
};

type PlayerListRowProps = {
  children: React.ReactNode;
  layout: PlayerListLayout;
};

type PlayerListTableHeaderProps = {
  layout: PlayerListLayout;
  rankingLabel: string;
  rankingTooltip?: string;
  rankingActive?: boolean;
  onRankingClick?: () => void;
  ratingLabel?: string;
  ratingTooltip?: string;
  ratingActive?: boolean;
  onRatingClick?: () => void;
  columns: readonly MetricColumn[];
  activeMetricKey?: PlayerMetricKey | null;
  onMetricClick?: (key: PlayerMetricKey) => void;
};

type PlayerListSectionProps = Omit<PlayerListTableHeaderProps, "layout" | "columns"> & {
  slug: PositionSlug;
  testId: string;
  rowTestId?: string;
} & (
  | { layout: "player"; players: readonly LeaderboardPlayer[] }
  | { layout: "team"; players: readonly PlayerRecord[]; teamSlug: TeamSlug }
);

function getGridClass(layout: PlayerListLayout): string {
  return PLAYER_LIST_GRID_CLASS[layout].row;
}

export function getPlayerListNoteGridClass(layout: PlayerListLayout): string {
  return PLAYER_LIST_GRID_CLASS[layout].note;
}

function PlayerListTable({ children, testId }: PlayerListTableProps) {
  return (
    <div className="overflow-x-auto overscroll-x-contain pb-2" data-testid={testId}>
      <ol className="w-max min-w-full space-y-4 sm:w-full sm:min-w-0 sm:space-y-3">
        {children}
      </ol>
    </div>
  );
}

function PlayerListHeaderRow({ children, layout }: PlayerListRowProps) {
  return (
    <li className={`${getGridClass(layout)} border-b-4 border-white/35 pb-3 text-white/65`}>
      {children}
    </li>
  );
}

function PlayerListRow({ children, layout }: PlayerListRowProps) {
  return <div className={getGridClass(layout)}>{children}</div>;
}

function PlayerListHeaderCell({
  label,
  tooltip,
  active = false,
  onClick,
}: {
  label: string;
  tooltip?: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <div className="text-[14px] font-bold">
      <PlayerListHeaderLabel
        label={label}
        tooltip={tooltip}
        active={active}
        onClick={onClick}
      />
    </div>
  );
}

function PlayerListValueCell({ children }: { children: React.ReactNode }) {
  return <div className="text-[14px] font-bold tabular-nums">{children}</div>;
}

function PlayerListRatingLink({ children, href }: { children: React.ReactNode; href: Route }) {
  return (
    <Link href={href} className="text-inherit no-underline transition-colors hover:text-(--pink)">
      {children}
    </Link>
  );
}

function PlayerListTableHeader({
  layout,
  rankingLabel,
  rankingTooltip,
  rankingActive = false,
  onRankingClick,
  ratingLabel = "Rating",
  ratingTooltip = "Out of 100%",
  ratingActive = false,
  onRatingClick,
  columns,
  activeMetricKey,
  onMetricClick,
}: PlayerListTableHeaderProps) {
  const spacerCount = layout === "team" ? 2 : 1;

  return (
    <PlayerListHeaderRow layout={layout}>
      <PlayerListHeaderCell
        label={rankingLabel}
        tooltip={rankingTooltip}
        active={rankingActive}
        onClick={onRankingClick}
      />
      {Array.from({ length: spacerCount }, (_, index) => (
        <div key={index} />
      ))}
      <PlayerListHeaderCell
        label={ratingLabel}
        tooltip={ratingTooltip}
        active={ratingActive}
        onClick={onRatingClick}
      />
      <MetricLegend
        columns={columns}
        activeKey={activeMetricKey}
        onColumnClick={onMetricClick}
      />
    </PlayerListHeaderRow>
  );
}

export function PlayerListSection(props: PlayerListSectionProps) {
  const { layout, slug, testId, rowTestId } = props;
  const { rankingKey, ratingKey, columns } = POSITION_PAGE_CONFIG_MAP[slug];
  const ratingHref = layout === "team" ? playerRoute(slug) : undefined;

  function renderPlayer(player: PlayerRecord, team: TeamSlug) {
    const rating = player[ratingKey];
    return (
      <li
        key={`${team}-${player.position}-${player.name}`}
        className="[contain-intrinsic-size:2.5rem] [content-visibility:auto]"
        data-testid={rowTestId}
        data-position={layout === "player" ? player.position : undefined}
      >
        <PlayerListRow layout={layout}>
          <PlayerListValueCell>{player[rankingKey]}</PlayerListValueCell>
          <PlayerIdentityCell layout={layout} team={team} player={player} />
          <PlayerListValueCell>
            {ratingHref ? <PlayerListRatingLink href={ratingHref}>{rating}</PlayerListRatingLink> : rating}
          </PlayerListValueCell>
          <MetricStrip columns={columns} getValue={key => Number(player[key] ?? 0)} className="ml-3 md:ml-4" />
        </PlayerListRow>
      </li>
    );
  }

  return (
    <PlayerListTable testId={testId}>
      <PlayerListTableHeader {...props} columns={columns} />
      {props.layout === "team"
        ? props.players.map(player => renderPlayer(player, props.teamSlug))
        : props.players.map(player => renderPlayer(player, player.teamSlug))}
    </PlayerListTable>
  );
}

function PlayerIdentityCell({ layout, team, player }: {
  layout: PlayerListLayout;
  team: TeamSlug;
  player: PlayerRecord;
}) {
  if (layout === "player") {
    return (
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex shrink-0 items-center gap-3">
          <Link href={teamRoute(team)} className="flex items-center justify-center">
            <HelmetSprite team={team} />
          </Link>
          <HeadshotSprite team={team} position={player.position} />
        </div>

        <div className="min-w-0">
          <h3 className="mt-1 text-[14px] font-medium leading-none text-balance">{player.name}</h3>
          <h4 className="text-[14px] font-medium text-white/65">
            {player.position} {player.number}
          </h4>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-center">
        <HeadshotSprite team={team} position={player.position} />
      </div>

      <div className="pl-3">
        <h3 className="mt-1 text-[14px] font-medium leading-none text-balance">{player.name}</h3>
        <h4 className="text-[14px] font-medium text-white/65">
          {player.position} {player.number}
        </h4>
      </div>
    </>
  );
}
