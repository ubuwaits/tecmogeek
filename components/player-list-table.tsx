import Link from "next/link";
import type { Route } from "next";

import { HeadshotSprite, HelmetSprite } from "@/components/sprites";
import type { HeadshotPosition, TeamSlug } from "@/lib/types";

const PLAYER_LIST_GRID_CLASS = {
  player:
    "grid w-full grid-cols-[52px_252px_52px_minmax(520px,1fr)] items-center sm:grid-cols-[52px_minmax(0,252px)_52px_minmax(0,1fr)]",
  team:
    "grid w-full grid-cols-[52px_32px_180px_52px_minmax(520px,1fr)] items-center sm:grid-cols-[52px_32px_minmax(0,180px)_52px_minmax(0,1fr)]",
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
  return PLAYER_LIST_GRID_CLASS[layout];
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

export function PlayerIdentityCell(props: PlayerIdentityCellProps) {
  if (props.layout === "player") {
    return (
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex shrink-0 items-center gap-3">
          <Link href={props.helmetHref} className="flex items-center justify-center">
            <HelmetSprite team={props.team} />
          </Link>
          <HeadshotSprite team={props.team} position={props.headshotPosition as HeadshotPosition} />
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
