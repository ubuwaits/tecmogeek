import { rebuildPlayerRatings } from "./player-ratings.mjs";
import { readTeamRosters, writeTeamRosters } from "./roster-files.mts";

const scope = process.argv[2];
const rosters = readTeamRosters();
await writeTeamRosters(rebuildPlayerRatings(rosters, scope));
console.log(`Rebuilt ${scope} player ratings for ${rosters.size} teams.`);
