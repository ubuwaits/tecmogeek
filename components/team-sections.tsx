"use client";

import Link from "next/link";
import { useState } from "react";

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

function TeamMetricCell({
  value,
  weight,
  metricKey,
}: {
  value: number;
  weight: number;
  metricKey: PlayerMetricKey;
}) {
  return (
    <div
      data-metric-key={metricKey}
      className="min-w-0 border-[3px] border-white bg-white/25 px-1 py-2 text-center text-[12px] font-bold text-[#222]"
      style={{
        flexBasis: 0,
        flexGrow: weight,
        backgroundImage: `linear-gradient(to right, var(--pink) 0%, var(--pink) ${value}%, transparent ${value}%)`,
      }}
    >
      {value}
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
    <li className="grid grid-cols-[52px_32px_180px_52px_1fr] items-center border-b-4 border-white/35 pb-3 text-white/65">
      <div className="text-center text-[14px] font-bold">
        <TooltipLabel label={rankingLabel} tooltip={rankingTooltip} />
      </div>
      <div />
      <div />
      <div className="text-center text-[14px] font-bold">
        <TooltipLabel label="Rating" tooltip="Out of 100%" />
      </div>
      <div className="ml-4 flex gap-2">
        {columns.map((column) => (
          <div
            key={column.key}
            className="text-[14px]"
            style={{ flexBasis: 0, flexGrow: column.weight }}
          >
            <TooltipLabel label={column.label} tooltip={column.tooltip} />
          </div>
        ))}
      </div>
    </li>
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

  return (
    <div className="mb-16">
      <ol className="space-y-3">
        <TeamHeaderRow
          rankingLabel={section.rankingLabel}
          rankingTooltip={section.rankingTooltip}
          columns={section.columns}
        />

        {players.map((player, index) => {
          const spriteIndex = section.range[0] + index;

          return (
            <li
              key={`${section.id}-${player.name}`}
              className="grid grid-cols-[52px_32px_180px_52px_1fr] items-center"
            >
              <div className="text-center text-[18px] font-bold">{player.ranking}</div>
              <div className="flex items-center justify-center">
                <HeadshotSprite team={team.short_name as TeamSlug} index={spriteIndex} />
              </div>
              <div className="pl-3">
                <h3 className="text-[18px]">{player.name}</h3>
                <h4 className="text-[14px] font-medium text-white/65">
                  {player.position} {player.number}
                </h4>
              </div>
              <div className="text-center text-[18px] font-bold">
                <Link href={playerRoute(section.playerPage)} className="rounded px-2 py-0.5 hover:bg-white/20">
                  {player.rating}
                </Link>
              </div>
              <div className="ml-4 flex gap-2">
                {section.columns.map((column) => (
                  <TeamMetricCell
                    key={column.key}
                    metricKey={column.key}
                    value={Number(player[column.key] ?? 0)}
                    weight={column.weight}
                  />
                ))}
              </div>
            </li>
          );
        })}
      </ol>

      <p className="ml-[264px] mt-2 text-[16px] leading-[1.2] text-white/65">{section.note}</p>
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
    <div className="mb-16" data-testid="team-skill-section" data-mode={mode}>
      <ol className="space-y-3">
        <TeamHeaderRow
          rankingLabel="RB/WR/TE Ranking"
          rankingTooltip="Out of 280 RB, WR & TE"
          columns={modeConfig.columns}
        />

        <li>
          <ul className="mb-8 text-center">
            {Object.values(TEAM_SKILL_MODE_CONFIG).map((config) => {
              const active = config.id === mode;

              return (
                <li key={config.id} className="mr-3 inline-block">
                  <button
                    type="button"
                    data-testid={`team-mode-${config.id}`}
                    onClick={() => setMode(config.id)}
                    className={`relative border-b-2 pb-0.5 font-bold ${
                      active
                        ? "border-transparent text-white"
                        : "border-white/65 text-white/65 hover:border-white hover:text-white"
                    }`}
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

        {sortedPlayers.map(({ player, spriteIndex }) => (
          <li
            key={`${mode}-${player.name}`}
            data-testid="team-skill-row"
            className="grid grid-cols-[52px_32px_180px_52px_1fr] items-center"
          >
            <div className="text-center text-[18px] font-bold">
              {String(player[modeConfig.rankingKey] ?? "")}
            </div>
            <div className="flex items-center justify-center">
              <HeadshotSprite team={team.short_name as TeamSlug} index={spriteIndex} />
            </div>
            <div className="pl-3">
              <h3 className="text-[18px]">{player.name}</h3>
              <h4 className="text-[14px] font-medium text-white/65">
                {player.position} {player.number}
              </h4>
            </div>
            <div className="text-center text-[18px] font-bold">
              <Link href={playerRoute(modeConfig.playerPage)} className="rounded px-2 py-0.5 hover:bg-white/20">
                {String(player[modeConfig.ratingKey] ?? "")}
              </Link>
            </div>
            <div className="ml-4 flex gap-2">
              {modeConfig.columns.map((column) => (
                <TeamMetricCell
                  key={column.key}
                  metricKey={column.key}
                  value={getModeMetricValue(player, column.key)}
                  weight={column.weight}
                />
              ))}
            </div>
          </li>
        ))}
      </ol>

      <p className="ml-[264px] mt-2 text-[16px] leading-[1.2] text-white/65">{modeConfig.note}</p>
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
