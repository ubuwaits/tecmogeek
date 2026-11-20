import { rebuildPlayerRatings } from "./player-ratings.mjs";
import { readTeamRosters, writeTeamRosters } from "./roster-files.mts";

const scope = process.argv[2];
const rosters = readTeamRosters();
rebuildPlayerRatings([...rosters.values()], scope);
await writeTeamRosters(rosters);
console.log(`Rebuilt ${scope} player ratings for ${rosters.size} teams.`);
