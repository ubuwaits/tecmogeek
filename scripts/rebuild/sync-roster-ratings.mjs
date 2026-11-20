import { formatTeamFile, getPlayerKey, getTeamFileNames, readJson, writeFile } from "./roster-files.mts";

export async function syncRosterRatings(groups) {
  const trackedGroups = groups.map(group => ({ ...group, seen: new Set() }));
  const files = [];

  for (const fileName of getTeamFileNames()) {
    const team = await readJson(fileName);
    for (const player of team.players) {
      const group = trackedGroups.find(group => group.matches(player.position));
      if (!group) continue;

      const key = getPlayerKey(player);
      const update = group.updates.get(key);
      if (!update) {
        throw new Error(`Missing ${group.name} update for ${key} in ${fileName}.`);
      }
      Object.assign(player, update);
      group.seen.add(key);
    }
    files.push({ fileName, team });
  }

  for (const { name, updates, seen } of trackedGroups) {
    if (seen.size !== updates.size) {
      throw new Error(`Updated ${seen.size} ${name} players in team files, expected ${updates.size}.`);
    }
  }
  for (const { fileName, team } of files) {
    await writeFile(fileName, formatTeamFile(team));
  }
}
