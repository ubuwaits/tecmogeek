"use client";

import Link from "next/link";
import { useState } from "react";

import { HorizontalScrollTable } from "@/components/horizontal-scroll-table";
import { MetricLegend, MetricStrip } from "@/components/metric-strip";
import { SkillTabs } from "@/components/skill-tabs";
import { HeadshotSprite } from "@/components/sprites";
import { TooltipLabel } from "@/components/tooltip-label";
import {
  DEFAULT_TEAM_SKILL_MODE,
  TEAM_SECTION_CONFIGS,
  TEAM_SKILL_MODE_CONFIG,
  TEAM_SKILL_MODES,
  TEAM_SKILL_RANGE,
} from "@/lib/site-config";
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

function TeamTableHeaderRow({ children }: { children: React.ReactNode }) {
  return (
    <li className="grid w-full grid-cols-[52px_32px_180px_52px_minmax(520px,1fr)] items-center border-b-4 border-white/35 pb-3 text-white/65 sm:grid-cols-[52px_32px_minmax(0,180px)_52px_minmax(0,1fr)]">
      {children}
    </li>
  );
}

function TeamTableRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid w-full grid-cols-[52px_32px_180px_52px_minmax(520px,1fr)] items-center sm:grid-cols-[52px_32px_minmax(0,180px)_52px_minmax(0,1fr)]">
      {children}
    </div>
  );
}

function TeamHeaderRow({
  rankingLabel,
  rankingTooltip,
  columns,
}: {
  rankingLabel: string;
  rankingTooltip: string;
  columns: readonly MetricColumn[];
}) {
  return (
    <TeamTableHeaderRow>
      <div className="text-center text-[14px] font-bold">
        <TooltipLabel label={rankingLabel} tooltip={rankingTooltip} />
      </div>
      <div />
      <div />
      <div className="text-center text-[14px] font-bold">
        <TooltipLabel label="Rating" tooltip="Out of 100%" />
      </div>

      <MetricLegend columns={columns} />
    </TeamTableHeaderRow>
  );
}

function TeamPlayerRow({
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
    <TeamTableRow>
      <div className="text-center text-[18px] font-bold tabular-nums">{rankingValue}</div>
      <div className="flex items-center justify-center">
        <HeadshotSprite team={teamSlug} index={spriteIndex} />
      </div>
      <div className="pl-3">
        <h3 className="text-[18px] leading-[1.05] text-balance sm:leading-normal">{player.name}</h3>
        <h4 className="text-[14px] font-medium text-white/65">
          {player.position} {player.number}
        </h4>
      </div>
      <div className="text-center text-[18px] font-bold tabular-nums">
        <Link href={playerRoute(playerPage)} className="rounded px-2 py-0.5 hover:bg-white/20">
          {ratingValue}
        </Link>
      </div>
      <MetricStrip columns={columns} getValue={getMetricValue} className="ml-3 md:ml-4" />
    </TeamTableRow>
  );
}

function TeamStaticSection({
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
      <HorizontalScrollTable testId={`team-table-scroll-${section.id}`}>
        <TeamHeaderRow
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
              <TeamPlayerRow
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
      </HorizontalScrollTable>

      <p className="mt-3 text-[14px] leading-[1.4] text-pretty text-white/65 sm:ml-[264px] sm:mt-2 sm:text-[16px] sm:leading-[1.2]">
        {section.note}
      </p>
    </div>
  );
}

export function TeamSkillSection({ team }: { team: TeamData }) {
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
      <SkillTabs
        items={TEAM_SKILL_MODES}
        activeId={mode}
        onChange={(id) => setMode(id as TeamSkillMode)}
        tabTestIdPrefix="team-mode"
        mobileSelectLabel="Skill mode"
        mobileSelectTestId="team-mode-select"
      />

      <HorizontalScrollTable testId="team-skill-table-scroll">
        <TeamHeaderRow
          rankingLabel="RB/WR/TE Ranking"
          rankingTooltip="Out of 280 RB, WR & TE"
          columns={modeConfig.columns}
        />

        {sortedPlayers.map(({ player, spriteIndex }) => {
          const rankingValue = String(player[modeConfig.rankingKey] ?? "");
          const ratingValue = String(player[modeConfig.ratingKey] ?? "");

          return (
            <li key={`${mode}-${player.name}`} data-testid="team-skill-row">
              <TeamPlayerRow
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
      </HorizontalScrollTable>

      <p className="mt-3 text-[14px] leading-[1.4] text-pretty text-white/65 sm:ml-[264px] sm:mt-2 sm:text-[16px] sm:leading-[1.2]">
        {modeConfig.note}
      </p>
    </div>
  );
}

export function TeamSections({ team }: { team: TeamData }) {
  return (
    <>
      <TeamStaticSection team={team} section={TEAM_SECTION_CONFIGS[0]} />
      <TeamSkillSection team={team} />
      {TEAM_SECTION_CONFIGS.slice(1).map((section) => (
        <TeamStaticSection key={section.id} team={team} section={section} />
      ))}
    </>
  );
}
