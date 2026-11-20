import { rateOffense } from "./offensive-ratings.mjs";
import { rateDefense } from "./defensive-ratings.mjs";
import { readTeamRosters, writeTeamRosters } from "./roster-files.mts";

const rosters = readTeamRosters();
const teams = [...rosters.values()];
rateOffense(teams);
rateDefense(teams);
await writeTeamRosters(rosters);
console.log(`Rebuilt player ratings for ${teams.length} teams.`);
