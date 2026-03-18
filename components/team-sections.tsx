"use client";

import Link from "next/link";
import { useState } from "react";

import { MetricLegend, MetricStrip, MobileMetricList } from "@/components/metric-strip";
import { HeadshotSprite } from "@/components/sprites";
import { TooltipLabel } from "@/components/tooltip-label";
import {
  DEFAULT_TEAM_SKILL_MODE,
  TEAM_SECTION_CONFIGS,
  TEAM_SKILL_MODE_CONFIG,
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
    <>
      <li className="hidden sm:grid sm:grid-cols-[52px_32px_minmax(0,180px)_52px_minmax(0,1fr)] sm:items-center sm:border-b-4 sm:border-white/35 sm:pb-3 sm:text-white/65">
        <div className="text-center text-[14px] font-bold">
          <TooltipLabel label={rankingLabel} tooltip={rankingTooltip} />
        </div>
        <div />
        <div />
        <div className="text-center text-[14px] font-bold">
          <TooltipLabel label="Rating" tooltip="Out of 100%" />
        </div>

        <MetricLegend columns={columns} />
      </li>
    </>
  );
}

function TeamPlayerCard({
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
    <article className="rounded-[20px] bg-white/[0.07] p-3 shadow-[0_0_0_1px_rgba(255,255,255,0.08)] sm:hidden">
      <div className="flex items-start gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/8">
            <HeadshotSprite team={teamSlug} index={spriteIndex} />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-[18px] leading-[1.05] text-balance">{player.name}</h3>
            <h4 className="mt-1 text-[14px] font-medium text-white/65">
              {player.position} {player.number}
            </h4>
            <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <Link href={playerRoute(playerPage)} className="flex items-baseline gap-2 rounded px-1 py-0.5 hover:bg-white/10">
                <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-white/55">
                  Rating
                </span>
                <span className="text-[18px] font-bold tabular-nums text-white">{ratingValue}</span>
              </Link>
              <div className="flex items-baseline gap-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-white/55">
                  Rank
                </span>
                <span className="text-[18px] font-bold tabular-nums text-white">{rankingValue}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <MobileMetricList columns={columns} getValue={getMetricValue} />
      </div>
    </article>
  );
}

function TeamDesktopRow({
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
    <div className="hidden sm:grid sm:grid-cols-[52px_32px_minmax(0,180px)_52px_minmax(0,1fr)] sm:items-center">
      <div className="text-center text-[18px] font-bold tabular-nums">{rankingValue}</div>
      <div className="flex items-center justify-center">
        <HeadshotSprite team={teamSlug} index={spriteIndex} />
      </div>
      <div className="pl-3">
        <h3 className="text-[18px]">{player.name}</h3>
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
    </div>
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
      <ol className="space-y-4 sm:space-y-3">
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
              <TeamPlayerCard
                player={player}
                spriteIndex={spriteIndex}
                teamSlug={teamSlug}
                playerPage={section.playerPage}
                columns={section.columns}
                getMetricValue={(key) => Number(player[key] ?? 0)}
                rankingValue={rankingValue}
                ratingValue={ratingValue}
              />
              <TeamDesktopRow
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
      </ol>

      <p className="mt-3 max-w-[42rem] text-[14px] leading-[1.4] text-pretty text-white/65 sm:ml-[264px] sm:mt-2 sm:text-[16px] sm:leading-[1.2]">
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
      <ol className="space-y-4 sm:space-y-3">
        <TeamHeaderRow
          rankingLabel="RB/WR/TE Ranking"
          rankingTooltip="Out of 280 RB, WR & TE"
          columns={modeConfig.columns}
        />

        <li>
          <ul className="mb-4 flex flex-wrap gap-x-3 gap-y-2 text-left sm:mb-8 sm:justify-center">
            {Object.values(TEAM_SKILL_MODE_CONFIG).map((config) => {
              const active = config.id === mode;

              return (
                <li key={config.id}>
                  <button
                    type="button"
                    data-testid={`team-mode-${config.id}`}
                    onClick={() => setMode(config.id)}
                    className={`relative min-h-10 rounded px-1 pb-0.5 font-bold transition ${
                      active
                        ? "border-transparent text-white"
                        : "border-white/65 text-white/65 hover:border-white hover:text-white"
                    } border-b-2`}
                  >
                    {config.label}
                    {active ? (
                      <span className="absolute left-1/2 top-full mt-1 h-0 w-0 -translate-x-1/2 border-x-[8px] border-t-[8px] border-x-transparent border-t-white" />
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </li>

        {sortedPlayers.map(({ player, spriteIndex }) => {
          const rankingValue = String(player[modeConfig.rankingKey] ?? "");
          const ratingValue = String(player[modeConfig.ratingKey] ?? "");

          return (
            <li key={`${mode}-${player.name}`} data-testid="team-skill-row">
              <TeamPlayerCard
                player={player}
                spriteIndex={spriteIndex}
                teamSlug={teamSlug}
                playerPage={modeConfig.playerPage}
                columns={modeConfig.columns}
                getMetricValue={(key) => getModeMetricValue(player, key)}
                rankingValue={rankingValue}
                ratingValue={ratingValue}
              />
              <TeamDesktopRow
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
      </ol>

      <p className="mt-3 max-w-[42rem] text-[14px] leading-[1.4] text-pretty text-white/65 sm:ml-[264px] sm:mt-2 sm:text-[16px] sm:leading-[1.2]">
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
