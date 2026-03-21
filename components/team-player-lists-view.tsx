"use client";

import { useState } from "react";

import {
  PlayerListSection,
  getPlayerListNoteGridClass,
  type PlayerListSectionRow,
} from "@/components/player-list-table";
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
  PlayerMetricKey,
  PlayerRecord,
  TeamData,
  TeamSectionConfig,
  TeamSkillMode,
  TeamSlug,
} from "@/lib/types";

function PlayerListNote({ children }: { children: React.ReactNode }) {
  return (
    <div className={getPlayerListNoteGridClass("team")}>
      <p className="text-[12px] sm:text-[14px] leading-normal text-pretty text-white/65 sm:col-start-5 sm:ml-3 md:ml-4">
        {children}
      </p>
    </div>
  );
}

function buildTeamRows({
  players,
  teamSlug,
  playerPage,
  getRankingValue,
  getRatingValue,
  getMetricValue,
  rowTestId,
}: {
  players: readonly { player: PlayerRecord; spriteIndex: number }[];
  teamSlug: TeamSlug;
  playerPage: TeamSectionConfig["playerPage"];
  getRankingValue: (player: PlayerRecord) => React.ReactNode;
  getRatingValue: (player: PlayerRecord) => React.ReactNode;
  getMetricValue: (player: PlayerRecord, key: PlayerMetricKey) => number;
  rowTestId?: string;
}): PlayerListSectionRow[] {
  return players.map(({ player, spriteIndex }) => ({
    key: `${playerPage}-${player.position}-${player.name}`,
    rankingValue: getRankingValue(player),
    identityProps: {
      layout: "team",
      team: teamSlug,
      spriteIndex,
      name: player.name,
      position: player.position,
      number: player.number,
    },
    ratingValue: getRatingValue(player),
    ratingHref: playerRoute(playerPage),
    getMetricValue: (key) => getMetricValue(player, key),
    itemData: rowTestId ? { "data-testid": rowTestId } : undefined,
  }));
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
  const rows = buildTeamRows({
    players: players.map((player, index) => ({
      player,
      spriteIndex: section.range[0] + index,
    })),
    teamSlug,
    playerPage: section.playerPage,
    getRankingValue: (player) => String(player.ranking ?? ""),
    getRatingValue: (player) => String(player.rating ?? ""),
    getMetricValue: (player, key) => Number(player[key] ?? 0),
  });

  return (
    <div className="mb-12 sm:mb-16">
      <PlayerListSection
        testId={`team-table-scroll-${section.id}`}
        layout="team"
        rankingLabel={section.rankingLabel}
        rankingTooltip={section.rankingTooltip}
        columns={section.columns}
        rows={rows}
      />

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

  const rows = buildTeamRows({
    players: sortedPlayers,
    teamSlug,
    playerPage: modeConfig.playerPage,
    getRankingValue: (player) => String(player[modeConfig.rankingKey] ?? ""),
    getRatingValue: (player) => String(player[modeConfig.ratingKey] ?? ""),
    getMetricValue: getModeMetricValue,
    rowTestId: "team-skill-row",
  });

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

      <PlayerListSection
        testId="team-skill-table-scroll"
        layout="team"
        rankingLabel="RB/WR/TE Ranking"
        rankingTooltip="Out of 280 RB, WR & TE"
        columns={modeConfig.columns}
        rows={rows}
      />

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
