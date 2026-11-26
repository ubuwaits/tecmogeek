import { rebuildPlayerRatings } from "./player-ratings.mjs";
import { readTeamRosters, writeTeamRosters } from "./roster-files.mts";

const scope = process.argv[2];
const rosters = readTeamRosters();
const teams = rebuildPlayerRatings([...rosters.values()], scope);
const slugs = [...rosters.keys()];
await writeTeamRosters(new Map(teams.map((team, i) => [slugs[i], team])));
console.log(`Rebuilt ${scope} player ratings for ${rosters.size} teams.`);
