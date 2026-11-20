# Team rating model

A team rating measures the strength of a static Tecmo Super Bowl lineup using the player ratings on the roster. It assumes the starters are available throughout the game and evaluates the same personnel regardless of playbook or down and distance.

## Gameplay assumptions

- **Offensive skill positions are interchangeable.** A rostered RB, WR, or TE can fill any of the five offensive skill slots. The model chooses a lineup for each of three game plans (running, passing, and balanced) and keeps those assignments fixed within that plan.
- **The running tight end plays a support role.** When assigning a candidate group, the model gives first choice at `TE1` to players with hitting power of at least 75. If the group has no such player, its best receiver fills the slot. This leaves the other four slots for ballcarriers.
- **Balanced play favors passing.** The model assumes passing is generally more effective in Tecmo. It fills the receiving slots first and gives passing three quarters of the balanced skill score. [Lineup selector](../scripts/rebuild/offensive-lineups.mts) · [Lineup verifier](../scripts/verify/lineups/lineups.mjs)
- **Depth matters at quarterback and on returns.** The starter and backup both contribute to the quarterback score used in passing and balanced offense. Kick and punt returns each use the top two returners, and the return unit contributes to all three offensive ratings. Defense uses eleven fixed starters, each with equal weight. [Team rating generator](../scripts/rebuild/team-ratings.ts) · [Component and selected-player verifier](../scripts/verify/teams/components.mjs)

## Published rounding

To preserve published scores, the generator applies `toFixed(3)` only when storing the computed JavaScript number, which can fall on either side of an exact decimal midpoint. [Rounding verifier](../scripts/verify/teams/rounding.mjs)
