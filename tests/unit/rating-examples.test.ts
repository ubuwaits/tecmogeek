import { expect, it } from "vitest";
import { ratingExamples } from "@/lib/players/rating-examples";
import { leaderboard } from "../helpers/leaderboards";

it("formats Rice's edited running speed of 50 out of 63 as a four-place multiplier", () => {
  const receivers = leaderboard("receivers").map(player =>
    player.teamSlug === "49ers" && player.name === "Jerry Rice" ? { ...player, running_speed: 50 } : player);
  const [rice] = ratingExamples(receivers);

  expect(rice.receiving.terms[0]).toBe("10 × 0.7937");
  expect(rice.rushing.terms[0]).toBe("10 × 0.7937");
  expect(rice.receiving.rating).toBe("89.34");
  expect(rice.rushing.rating).toBe("82.34");
});
