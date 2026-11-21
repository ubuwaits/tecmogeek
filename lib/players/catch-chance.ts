// The player screen displays these values for the game's 16 skill levels.
const displayedSkills = [6, 13, 19, 25, 31, 38, 44, 50, 56, 63, 69, 75, 81, 88, 94, 100];

function skillLevel(value: number) {
  const level = displayedSkills.indexOf(value);
  if (level < 0) throw new Error(`Unknown NES skill value: ${value}`);
  return level;
}

export function catchChance(passControl: number, receptions: number, interceptions?: number) {
  // Pass Control and Receptions use the same lookup table, starting at 61.
  let strength = 122 + 2 * (skillLevel(passControl) + skillLevel(receptions));
  let threshold = 79;
  if (interceptions !== undefined) {
    strength -= 51 + 2 * skillLevel(interceptions);
    threshold = 80;
  }

  // The game sets the high bit of the random byte and compares the high byte of the product.
  let catches = 0;
  for (let roll = 128; roll <= 255; roll++) {
    if (Math.floor(strength * roll / 256) >= threshold) catches++;
  }
  return 100 * catches / 128;
}
