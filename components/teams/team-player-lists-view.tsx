"use client";

import { useState } from "react";

import {
  PlayerListSection,
  getPlayerListNoteGridClass,
} from "@/components/players/player-list-table";
import { SelectionTabs } from "@/components/ui/selection-tabs";
import {
  DEFAULT_TEAM_SKILL_MODE,
  TEAM_SECTION_CONFIGS,
  TEAM_SKILL_MODE_CONFIG,
  TEAM_SKILL_MODES,
} from "@/lib/teams/config";
import { eligibleForPosition } from "@/lib/players/positions.mts";
import { rankingTooltip, sortEntriesByKey } from "@/lib/players/utils";
import type {
  PositionSlug,
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

type TeamRosterProps = { team: TeamData; teamSlug: TeamSlug; counts: Record<PositionSlug, number> };

function TeamPositionPlayerList({
  team,
  teamSlug,
  section,
  counts,
}: TeamRosterProps & {
  section: TeamSectionConfig;
}) {
  const players = team.players.filter(player => eligibleForPosition(player, section.playerPage));

  return (
    <div className="mb-12 sm:mb-16">
      <PlayerListSection
        testId={`team-table-scroll-${section.id}`}
        layout="team"
        rankingLabel={section.rankingLabel}
        rankingTooltip={rankingTooltip(counts[section.playerPage], section.rankingGroupLabel)}
        slug={section.playerPage}
        players={players}
        teamSlug={teamSlug}
      />

      <PlayerListNote>{section.note}</PlayerListNote>
    </div>
  );
}

function TeamSkillPlayerList({ team, teamSlug, counts }: TeamRosterProps) {
  const [mode, setMode] = useState<TeamSkillMode>(DEFAULT_TEAM_SKILL_MODE);
  const modeConfig = TEAM_SKILL_MODE_CONFIG[mode];
  const skillPlayers = team.players.filter(player => eligibleForPosition(player, modeConfig.playerPage));
  const sortedPlayers = sortEntriesByKey(skillPlayers, modeConfig.rankingKey, "asc", modeConfig.rankingKey);
  const rankingLabel = `${modeConfig.label} Ranking`;

  return (
    <div className="mb-12 sm:mb-16" data-testid="team-skill-section" data-mode={mode}>
      <SelectionTabs
        items={TEAM_SKILL_MODES}
        activeId={mode}
        onChange={setMode}
        tabTestIdPrefix="team-mode"
        mobileSelectLabel="Skill mode"
        mobileSelectTestId="team-mode-select"
      />

      <PlayerListSection
        testId="team-skill-table-scroll"
        layout="team"
        rankingLabel={rankingLabel}
        rankingTooltip={rankingTooltip(counts[modeConfig.playerPage], "RB, WR & TE")}
        slug={modeConfig.playerPage}
        players={sortedPlayers}
        teamSlug={teamSlug}
        rowTestId="team-skill-row"
      />

      <PlayerListNote>{modeConfig.note}</PlayerListNote>
    </div>
  );
}

export function TeamPlayerListsView(props: TeamRosterProps) {
  return (
    <>
      <TeamPositionPlayerList {...props} section={TEAM_SECTION_CONFIGS[0]} />
      <TeamSkillPlayerList {...props} />
      {TEAM_SECTION_CONFIGS.slice(1).map((section) => (
        <TeamPositionPlayerList key={section.id} {...props} section={section} />
      ))}
    </>
  );
}
