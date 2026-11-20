import { rateOffense } from "./offensive-ratings.mjs";
import { rateDefense } from "./defensive-ratings.mjs";
import { readTeamRosters, writeTeamRosters } from "./roster-files.mts";
import { buildTeamRatings, writeTeamRatingsFile } from "./team-ratings.ts";

const rosters = readTeamRosters();
const teams = [...rosters.values()];
rateOffense(teams);
rateDefense(teams);
const ratings = buildTeamRatings(rosters);
await writeTeamRosters(rosters);
writeTeamRatingsFile(ratings);
console.log(`Rebuilt player and team ratings for ${teams.length} teams.`);
