import type { Metadata, ResolvingMetadata } from "next";
import { CatchMatchups } from "@/components/about/catch-matchups";
import { pageMetadata } from "@/lib/site/metadata";
import { passCatchRoute } from "@/lib/site/routes";
import { getTeamRosters } from "@/lib/teams/data";
import { catchTeam } from "@/lib/players/catch-matchups";

const source = "https://github.com/bruddog/Tecmo_Super_Bowl_NES_Disassembly/blob/f3bae0e1913ba532a5ace158d86d905ecf787008/Bank21_22_play_commands_on_field_logic.asm";

export async function generateMetadata(_: PageProps<"/about/pass-catch-chances">, parent: ResolvingMetadata): Promise<Metadata> {
  return pageMetadata(parent, "Pass Catch Chances", passCatchRoute);
}

export default async function PassCatchPage() {
  const teams = (await getTeamRosters()).map(team => catchTeam(team.slug, team));

  return (
    <article data-page-theme="text" className="mx-auto mt-4 max-w-screen-2xl sm:mt-6">
      <h1 className="font-(family-name:--font-tecmo) text-[23px] uppercase leading-snug sm:text-[36px]">Pass Catch Chances</h1>
      <p className="my-4 max-w-175">If the ball reaches the receiver, how likely is he to catch it? Compare an open receiver with the same receiver covered by one defender.</p>
      <CatchMatchups teams={teams} />
      <p className="mt-6 max-w-175 text-sm leading-relaxed">
        These odds use the quarterback’s Pass Control, the receiver’s Receptions, and the covering defender’s Pass Interceptions.
        They assume normal condition, no CPU boosts, and an on-field pass within the receiver’s reach.
        If the quarterback throws beyond the receiver’s reach, the receiver has a 0% chance to catch it there.
      </p>
      <p className="mt-3 max-w-175 text-sm leading-relaxed">
        Multiply the defenders’ catch percentages in the receiver’s row to estimate his chance in double or triple coverage.
        For the exact odds, each percentage after the first must come from the throws that got past the earlier defenders.
        That percentage can differ from the single-coverage column because the game’s successive random rolls are linked.
      </p>
      <p className="mt-3 max-w-175 text-sm leading-relaxed">
        Jerry Rice catches 57.8% of Joe Montana’s passes against Bruce Smith alone.
        Half of those passes get past Leonard Smith, so Rice’s chance against both is <strong>57.8% × 0.50 = 28.9%</strong>.
        Of the passes that get past both Smiths, 54.7% also get past Darryl Talley.
        With all three defenders, Rice’s chance is <strong>28.9% × 0.547 ≈ 15.8%</strong>.{" "}
        <a className="underline" href={source + "#L5454-L5464"} target="_blank" rel="noopener noreferrer">Receiver reach</a>
        {" · "}<a className="underline" href={source + "#L5504-L5547"} target="_blank" rel="noopener noreferrer">Defenders at the ball</a>
        {" · "}<a className="underline" href={source + "#L5675-L5757"} target="_blank" rel="noopener noreferrer">Player skill calculation</a>
        {" · "}<a className="underline" href={source.replace("Bank21_22_play_commands_on_field_logic.asm", "Bank31_fixed_bank.asm") + "#L4383-L4412"} target="_blank" rel="noopener noreferrer">Random rolls</a>
      </p>
    </article>
  );
}
