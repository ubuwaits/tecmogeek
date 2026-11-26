export function snapshotDifferences(expected, actual) {
  const differences = [];
  for (const [file, bytes] of expected) {
    if (!actual.has(file)) differences.push(`missing data/${file}`);
    else if (!actual.get(file).equals(bytes)) differences.push(`changed data/${file}`);
  }
  for (const file of actual.keys()) {
    if (!expected.has(file)) differences.push(`unexpected data/${file}`);
  }
  return differences;
}
