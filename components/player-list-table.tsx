import Link from "next/link";
import type { Route } from "next";

import { MetricLegend, MetricStrip } from "@/components/metric-strip";
import { PlayerListHeaderLabel } from "@/components/player-list-header-label";
import { HeadshotSprite, HelmetSprite } from "@/components/sprites";
import type { MetricColumn, PlayerMetricKey, TeamSlug } from "@/lib/types";

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

type PlayerListMetricsRowProps = {
  layout: PlayerListLayout;
  rankingValue: React.ReactNode;
  identity: React.ReactNode;
  ratingValue: React.ReactNode;
  columns: readonly MetricColumn[];
  getMetricValue: (key: PlayerMetricKey) => number;
};

export type PlayerListSectionRow = {
  key: string;
  rankingValue: React.ReactNode;
  identityProps: PlayerIdentityCellProps;
  ratingValue: React.ReactNode;
  ratingHref?: Route;
  getMetricValue: (key: PlayerMetricKey) => number;
  itemData?: Partial<Record<`data-${string}`, string>>;
};

type PlayerListSectionProps = PlayerListTableHeaderProps & {
  testId?: string;
  rows: readonly PlayerListSectionRow[];
};

type PlayerIdentityCellProps =
  | {
      layout: "player";
      team: TeamSlug;
      helmetHref: Route;
      headshotPosition: string;
      name: string;
      position: string;
      number: string;
    }
  | {
      layout: "team";
      team: TeamSlug;
      spriteIndex: number;
      name: string;
      position: string;
      number: string;
    };

function getGridClass(layout: PlayerListLayout): string {
  return PLAYER_LIST_GRID_CLASS[layout].row;
}

export function getPlayerListNoteGridClass(layout: PlayerListLayout): string {
  return PLAYER_LIST_GRID_CLASS[layout].note;
}

export function PlayerListTable({ children, testId }: PlayerListTableProps) {
  return (
    <div className="overflow-x-auto overscroll-x-contain pb-2" data-testid={testId}>
      <ol className="w-max min-w-full space-y-4 sm:w-full sm:min-w-0 sm:space-y-3">
        {children}
      </ol>
    </div>
  );
}

export function PlayerListHeaderRow({ children, layout }: PlayerListRowProps) {
  return (
    <li className={`${getGridClass(layout)} border-b-4 border-white/35 pb-3 text-white/65`}>
      {children}
    </li>
  );
}

export function PlayerListRow({ children, layout }: PlayerListRowProps) {
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

export function PlayerListTableHeader({
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

export function PlayerListMetricsRow({
  layout,
  rankingValue,
  identity,
  ratingValue,
  columns,
  getMetricValue,
}: PlayerListMetricsRowProps) {
  return (
    <PlayerListRow layout={layout}>
      <PlayerListValueCell>{rankingValue}</PlayerListValueCell>
      {identity}
      <PlayerListValueCell>{ratingValue}</PlayerListValueCell>
      <MetricStrip columns={columns} getValue={getMetricValue} className="ml-3 md:ml-4" />
    </PlayerListRow>
  );
}

export function PlayerListSection({
  testId,
  rows,
  ...headerProps
}: PlayerListSectionProps) {
  return (
    <PlayerListTable testId={testId}>
      <PlayerListTableHeader {...headerProps} />

      {rows.map(({ key, identityProps, ratingHref, ratingValue, itemData, ...row }) => (
        <li key={key} {...itemData}>
          <PlayerListMetricsRow
            layout={headerProps.layout}
            rankingValue={row.rankingValue}
            identity={<PlayerIdentityCell {...identityProps} />}
            ratingValue={
              ratingHref ? (
                <PlayerListRatingLink href={ratingHref}>{ratingValue}</PlayerListRatingLink>
              ) : (
                ratingValue
              )
            }
            columns={headerProps.columns}
            getMetricValue={row.getMetricValue}
          />
        </li>
      ))}
    </PlayerListTable>
  );
}

export function PlayerIdentityCell(props: PlayerIdentityCellProps) {
  if (props.layout === "player") {
    return (
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex shrink-0 items-center gap-3">
          <Link href={props.helmetHref} className="flex items-center justify-center">
            <HelmetSprite team={props.team} />
          </Link>
          <HeadshotSprite team={props.team} position={props.headshotPosition} />
        </div>

        <div className="min-w-0">
          <h3 className="mt-1 text-[14px] font-medium leading-none text-balance">{props.name}</h3>
          <h4 className="text-[14px] font-medium text-white/65">
            {props.position} {props.number}
          </h4>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-center">
        <HeadshotSprite team={props.team} index={props.spriteIndex} />
      </div>

      <div className="pl-3">
        <h3 className="mt-1 text-[14px] font-medium leading-none text-balance">{props.name}</h3>
        <h4 className="text-[14px] font-medium text-white/65">
          {props.position} {props.number}
        </h4>
      </div>
    </>
  );
}
