import { expect, it } from "vitest";
import { exactPlayerRating } from "../../scripts/verify/players/rating-spec.mjs";

it("rounds the sum of weighted attributes half up when a positional maximum is zero", () => {
  const maxima = { maximum_speed: 100, passing_speed: 100, pass_control: 0, avoid_pass_block: 100 };
  const qb = { maximum_speed: 1, passing_speed: 1, pass_control: 0 };
  // The first two attributes contribute 0.45 points. Each Avoid Pass Block unit adds 0.05.
  const ratings = [0, 1, 2].map(avoid_pass_block =>
    exactPlayerRating({ ...qb, avoid_pass_block }, "qb", maxima));
  expect(ratings).toEqual([0, 1, 1]);
});
