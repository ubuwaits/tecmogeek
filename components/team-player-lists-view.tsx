"use client";

import Link from "next/link";
import { useState } from "react";

import { PlayerListHeaderLabel } from "@/components/player-list-header-label";
import {
  PlayerIdentityCell,
  PlayerListHeaderRow,
  PlayerListRow,
  PlayerListTable,
} from "@/components/player-list-table";
import { MetricLegend, MetricStrip } from "@/components/metric-strip";
import { SelectionTabs } from "@/components/selection-tabs";
import {
  DEFAULT_TEAM_SKILL_MODE,
  TEAM_SECTION_CONFIGS,
  TEAM_SKILL_MODE_CONFIG,
  TEAM_SKILL_MODES,
  TEAM_SKILL_RANGE,
} from "@/lib/teams/config";
import { getTeamReturnSpeedValues, sortEntriesByKey } from "@/lib/player-utils";
import { playerRoute } from "@/lib/routes";
import type {
  MetricColumn,
  PlayerMetricKey,
  PlayerRecord,
  TeamData,
  TeamSectionConfig,
  TeamSkillMode,
  TeamSlug,
} from "@/lib/types";

function TeamPlayerListHeader({
  rankingLabel,
  rankingTooltip,
  columns,
}: {
  rankingLabel: string;
  rankingTooltip: string;
  columns: readonly MetricColumn[];
}) {
  return (
    <PlayerListHeaderRow layout="team">
      <div className="text-[14px] font-bold">
        <PlayerListHeaderLabel
          label={rankingLabel}
          tooltip={rankingTooltip}
        />
      </div>
      <div />
      <div />
      <div className="text-[14px] font-bold">
        <PlayerListHeaderLabel
          label="Rating"
          tooltip="Out of 100%"
        />
      </div>
      <MetricLegend columns={columns} />
    </PlayerListHeaderRow>
  );
}

function TeamPlayerListEntry({
  player,
  spriteIndex,
  teamSlug,
  playerPage,
  columns,
  getMetricValue,
  rankingValue,
  ratingValue,
}: {
  player: PlayerRecord;
  spriteIndex: number;
  teamSlug: TeamSlug;
  playerPage: TeamSectionConfig["playerPage"];
  columns: readonly MetricColumn[];
  getMetricValue: (key: PlayerMetricKey) => number;
  rankingValue: string;
  ratingValue: string;
}) {
  return (
    <PlayerListRow layout="team">
      <div className="text-[18px] font-bold tabular-nums">{rankingValue}</div>
      <PlayerIdentityCell
        layout="team"
        team={teamSlug}
        spriteIndex={spriteIndex}
        name={player.name}
        position={player.position}
        number={player.number}
      />
      <div className="text-[18px] font-bold tabular-nums">
        <Link
          href={playerRoute(playerPage)}
          className="text-inherit no-underline transition-colors hover:text-(--pink)"
        >
          {ratingValue}
        </Link>
      </div>
      <MetricStrip columns={columns} getValue={getMetricValue} className="ml-3 md:ml-4" />
    </PlayerListRow>
  );
}

function PlayerListNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3 text-[14px] leading-[1.4] text-pretty text-white/65 sm:ml-[264px] sm:mt-2 sm:text-[16px] sm:leading-[1.2]">
      {children}
    </p>
  );
}

function TeamPositionPlayerList({
  team,
  section,
}: {
  team: TeamData;
  section: TeamSectionConfig;
}) {
  const players = team.players.slice(section.range[0], section.range[1] + 1);
  const teamSlug = team.short_name as TeamSlug;

  return (
    <div className="mb-12 sm:mb-16">
      <PlayerListTable testId={`team-table-scroll-${section.id}`}>
        <TeamPlayerListHeader
          rankingLabel={section.rankingLabel}
          rankingTooltip={section.rankingTooltip}
          columns={section.columns}
        />

        {players.map((player, index) => {
          const spriteIndex = section.range[0] + index;
          const rankingValue = String(player.ranking ?? "");
          const ratingValue = String(player.rating ?? "");

          return (
            <li key={`${section.id}-${player.name}`}>
              <TeamPlayerListEntry
                player={player}
                spriteIndex={spriteIndex}
                teamSlug={teamSlug}
                playerPage={section.playerPage}
                columns={section.columns}
                getMetricValue={(key) => Number(player[key] ?? 0)}
                rankingValue={rankingValue}
                ratingValue={ratingValue}
              />
            </li>
          );
        })}
      </PlayerListTable>

      <PlayerListNote>{section.note}</PlayerListNote>
    </div>
  );
}

function TeamSkillPlayerList({ team }: { team: TeamData }) {
  const [mode, setMode] = useState<TeamSkillMode>(DEFAULT_TEAM_SKILL_MODE);
  const modeConfig = TEAM_SKILL_MODE_CONFIG[mode];
  const skillPlayers = team.players
    .slice(TEAM_SKILL_RANGE[0], TEAM_SKILL_RANGE[1] + 1)
    .map((player, offset) => ({
      player,
      spriteIndex: TEAM_SKILL_RANGE[0] + offset,
    }));
  const sortedPlayers = sortEntriesByKey(
    skillPlayers.map((item) => item.player),
    modeConfig.rankingKey,
    "asc",
  ).map((player) => ({
    player,
    spriteIndex:
      skillPlayers.find((item) => item.player.name === player.name && item.player.position === player.position)
        ?.spriteIndex ?? TEAM_SKILL_RANGE[0],
  }));
  const returnSpeeds = getTeamReturnSpeedValues(team);
  const teamSlug = team.short_name as TeamSlug;

  function getModeMetricValue(player: PlayerRecord, key: PlayerMetricKey): number {
    if (key === "kick_return_maximum_speed") {
      return returnSpeeds.kickReturnMaximumSpeed;
    }

    if (key === "punt_return_maximum_speed") {
      return returnSpeeds.puntReturnMaximumSpeed;
    }

    return Number(player[key] ?? 0);
  }

  return (
    <div className="mb-12 sm:mb-16" data-testid="team-skill-section" data-mode={mode}>
      <SelectionTabs
        items={TEAM_SKILL_MODES}
        activeId={mode}
        onChange={(id) => setMode(id as TeamSkillMode)}
        tabTestIdPrefix="team-mode"
        mobileSelectLabel="Skill mode"
        mobileSelectTestId="team-mode-select"
      />

      <PlayerListTable testId="team-skill-table-scroll">
        <TeamPlayerListHeader
          rankingLabel="RB/WR/TE Ranking"
          rankingTooltip="Out of 280 RB, WR & TE"
          columns={modeConfig.columns}
        />

        {sortedPlayers.map(({ player, spriteIndex }) => {
          const rankingValue = String(player[modeConfig.rankingKey] ?? "");
          const ratingValue = String(player[modeConfig.ratingKey] ?? "");

          return (
            <li key={`${mode}-${player.name}`} data-testid="team-skill-row">
              <TeamPlayerListEntry
                player={player}
                spriteIndex={spriteIndex}
                teamSlug={teamSlug}
                playerPage={modeConfig.playerPage}
                columns={modeConfig.columns}
                getMetricValue={(key) => getModeMetricValue(player, key)}
                rankingValue={rankingValue}
                ratingValue={ratingValue}
              />
            </li>
          );
        })}
      </PlayerListTable>

      <PlayerListNote>{modeConfig.note}</PlayerListNote>
    </div>
  );
}

export function TeamPlayerListsView({ team }: { team: TeamData }) {
  return (
    <>
      <TeamPositionPlayerList team={team} section={TEAM_SECTION_CONFIGS[0]} />
      <TeamSkillPlayerList team={team} />
      {TEAM_SECTION_CONFIGS.slice(1).map((section) => (
        <TeamPositionPlayerList key={section.id} team={team} section={section} />
      ))}
    </>
  );
}
