import { OFFENSIVE_HP_SCORE_MAP, RECEIVING_COLUMNS, RUSHING_COLUMNS } from "./metrics";
import { attributeMaxima, attributeScore, weightedScore } from "./rating.mts";
import type { LeaderboardPlayer, MetricColumn } from "@/lib/types";

export function ratingExamples(skillPlayers: readonly LeaderboardPlayer[]) {
  const maxima = attributeMaxima(skillPlayers, [...RECEIVING_COLUMNS, ...RUSHING_COLUMNS]);
  return [
    { team: "49ers", name: "Jerry Rice", surname: "Rice" },
    { team: "raiders", name: "Bo Jackson", surname: "Jackson" },
  ].map(({ team, name, surname }) => {
    const player = skillPlayers.find(p => p.teamSlug === team && p.name === name);
    if (!player) throw new Error(`Missing rating example player: ${team}/${name}`);
    function calculation(columns: readonly MetricColumn[], entry: LeaderboardPlayer) {
      const terms = columns.map(({ key, weight }) => {
        const percent = attributeScore(entry, key, maxima, OFFENSIVE_HP_SCORE_MAP);
        return `${weight} × ${Number(percent.toFixed(2)) / 100}`;
      });
      const rating = weightedScore(entry, columns, maxima, OFFENSIVE_HP_SCORE_MAP).toFixed(2);
      return { player: surname, terms, rating };
    }
    const rows = RECEIVING_COLUMNS.map(({ key, tooltip }) => {
      const score = attributeScore(player, key, maxima, OFFENSIVE_HP_SCORE_MAP);
      return [tooltip, String(player[key]), score.toFixed(key === "hitting_power" ? 0 : 2) + "%"];
    });
    return { surname, rows, receiving: calculation(RECEIVING_COLUMNS, player), rushing: calculation(RUSHING_COLUMNS, player) };
  });
}
