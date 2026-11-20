import type { TeamGroup } from "@/lib/types";

export const TEAM_GROUPS: readonly TeamGroup[] = [
  { title: "AFC East", teams: ["bills", "colts", "dolphins", "patriots", "jets"] },
  { title: "AFC Central", teams: ["bengals", "browns", "oilers", "steelers"] },
  { title: "AFC West", teams: ["broncos", "chiefs", "raiders", "chargers", "seahawks"] },
  { title: "NFC East", teams: ["redskins", "giants", "eagles", "cardinals", "cowboys"] },
  { title: "NFC Central", teams: ["bears", "lions", "packers", "vikings", "buccaneers"] },
  { title: "NFC West", teams: ["49ers", "rams", "saints", "falcons"] },
] as const satisfies readonly TeamGroup[];
