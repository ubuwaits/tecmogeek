import Image from "next/image";
import { Fragment, type ComponentProps } from "react";
import type { ratingExamples } from "@/lib/players/rating-examples";


import { POSITION_PAGE_CONFIG_MAP } from "@/lib/players/config";
import { DEFENSIVE_HP_SCORE_MAP, OFFENSIVE_HP_SCORE_MAP, OFFENSIVE_LINE_HP_SCORE_MAP } from "@/lib/players/metrics";
import type { PositionSlug } from "@/lib/types";

const NES_SOURCE = "https://github.com/bruddog/Tecmo_Super_Bowl_NES_Disassembly/blob/f3bae0e1913ba532a5ace158d86d905ecf787008";
const FIELD_LOGIC = NES_SOURCE + "/Bank21_22_play_commands_on_field_logic.asm";
const PLAY_SCRIPTS = NES_SOURCE + "/Bank5_6_off_def_play_data.asm";

function AboutLink(props: ComponentProps<"a">) {
  return <a {...props} target="_blank" rel="noopener noreferrer" />;
}

function RatingsTable({
  headings = ["Attribute", "Value"],
  rows,
}: {
  headings?: readonly string[];
  rows: readonly (readonly (string | number)[])[];
}) {
  return (
    <table className="max-w-md tabular-nums">
      <thead>
        <tr>
          {headings.map((heading) => <th key={heading} scope="col">{heading}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.map(([label, ...values]) => (
          <tr key={label}>
            <th scope="row" className="font-normal">{label}</th>
            {values.map((value, index) => <td key={index}>{value}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function WeightTable({ slug }: { slug: PositionSlug }) {
  const rows = POSITION_PAGE_CONFIG_MAP[slug].columns.map(({ tooltip, weight }) => [tooltip, weight + "%"]);
  return <RatingsTable headings={["Attribute", "Weight"]} rows={rows} />;
}

function HittingPowerTable({ scores, showLowerBand = false }: {
  scores: Record<number, number>;
  showLowerBand?: boolean;
}) {
  const rows = Object.entries(scores).map(([value, score]) => [value, score + "%"]);
  if (showLowerBand) rows.unshift(["Below " + Math.min(...Object.keys(scores).map(Number)), "0%"]);
  return <RatingsTable headings={["Hitting Power", "Score"]} rows={rows} />;
}

function RatingCalculation({
  player,
  rating,
  terms,
}: {
  player: string;
  rating: string;
  terms: readonly string[];
}) {
  return (
    <div className="not-prose my-5 border-l-2 border-white/35 pl-4">
      <p className="mb-2 font-semibold">{player}: {rating}%</p>
      <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[14px] leading-relaxed tabular-nums sm:text-[16px]">
        {terms.map((term, index) => (
          <span key={index} className="inline-flex gap-2 whitespace-nowrap">
            {index > 0 ? <span>+</span> : null}
            <span>{term}</span>
          </span>
        ))}
        <span className="whitespace-nowrap">≈ {rating}%</span>
      </p>
    </div>
  );
}

export function AboutRatingsContent({ examples }: { examples: ReturnType<typeof ratingExamples> }) {
  return (
    <article className="prose prose-invert max-w-none text-white">
      <h1 className="mb-0 font-(family-name:--font-tecmo) text-[23px] leading-snug uppercase text-balance sm:text-[36px] sm:leading-10">
        How player ratings are calculated
      </h1>

      <section data-testid="ratings-content-player">
        <h2>
          Step one: Forget about attributes that don&apos;t matter
        </h2>

        <p>
          These tables list attributes excluded from the ratings. Some have the same value for every player at a position. RBs, WRs, and TEs share a group because each can play the other two positions.
        </p>
        <p>
          If you want to learn more about attributes and how they affect player performance, I highly recommend <AboutLink href="http://www.gamefaqs.com/nes/587686-tecmo-super-bowl/faqs/44195" className="font-bold"> this guide</AboutLink>.
        </p>

        <h3>QB</h3>
        <RatingsTable
          rows={[
            ["Running Speed", "25"],
            ["Rushing Power", "69"],
            ["Hitting Power", "13"],
            ["Accuracy of Passing", "unused for pass placement"],
          ]}
        />

        <p>
          The game ignores Accuracy of Passing. Pass Control determines how likely a throw is to be on target.{" "}
          <AboutLink href={NES_SOURCE + "/Bank25_leaders_player_data_pro_bowl_abbrev.asm#L1702-L1705"}>QB attribute bars</AboutLink>
          {" · "}<AboutLink href={FIELD_LOGIC + "#L5972-L5975"}>Pass Control lookup</AboutLink>
          {" · "}<AboutLink href={FIELD_LOGIC + "#L4545-L4572"}>Throw to a moving receiver</AboutLink>
          {" · "}<AboutLink href={FIELD_LOGIC + "#L4622-L4633"}>Throw to a stationary receiver</AboutLink>
        </p>

        <h3>RB/WR/TE</h3>
        <RatingsTable
          rows={[
            ["Rushing Power", "69 (Even Okoye, who has a listed Rushing Power of 75)"],
          ]}
        />

        <h3>Kick Returners</h3>
        <RatingsTable
          rows={[
            ["Receptions", "not used"],
          ]}
        />

        <p>
          On a kickoff, the right tackle&apos;s field slot runs the return. The game shows the selected returner&apos;s name, then reloads Maximum Speed from the starter in that field slot. That gives every kick returner on the team the right tackle&apos;s Maximum Speed.{" "}
          <AboutLink href={NES_SOURCE + "/Bank3_formation_metatile_data.asm#L6-L17"}>Kickoff formation</AboutLink>
          {" · "}<AboutLink href={PLAY_SCRIPTS + "#L117-L123"}>Kick return commands</AboutLink>
          {" · "}<AboutLink href={FIELD_LOGIC + "#L4222-L4232"}>Returner name and control</AboutLink>
        </p>

        <h3>Punt Returners</h3>
        <RatingsTable
          rows={[
            ["Ball Control", "44"],
            ["Receptions", "not used"],
          ]}
        />

        <p>
          On a punt, the same speed lookup runs in the strong safety&apos;s field slot. A team can change its punt returner and still get the strong safety&apos;s Maximum Speed.{" "}
          <AboutLink href={NES_SOURCE + "/constants_variables/roster_positions_starter_ids.asm#L49-L78"}>Offensive and defensive slot order</AboutLink>
          {" · "}<AboutLink href={NES_SOURCE + "/Bank4_def_spec_play_pointers_data.asm#L3129-L3141"}>Punt return formation</AboutLink>
          {" · "}<AboutLink href={PLAY_SCRIPTS + "#L5305-L5309"}>Punt return commands</AboutLink>
          {" · "}<AboutLink href={FIELD_LOGIC + "#L3139-L3168"}>Maximum Speed lookup for both returns</AboutLink>
        </p>

        <h3>OL</h3>
        <RatingsTable
          rows={[
            ["Running Speed", "25"],
            ["Rushing Power", "69"],
          ]}
        />

        <h3>DL/LB/C/S</h3>
        <RatingsTable
          rows={[
            ["Quickness", "not used"],
          ]}
        />

        <h3>K</h3>
        <RatingsTable
          rows={[
            ["Running Speed", "56"],
            ["Rushing Power", "81"],
            ["Maximum Speed", "81"],
            ["Hitting Power", "31"],
            ["Avoid Kick Block", "not used"],
          ]}
        />
        <p>
          On field goals and extra points, the game reads the kicker&apos;s Avoid Kick Block rating but saves it at the wrong index. If a defender gets close enough, the block check reads zero, the weakest entry in the table. A random draw then decides whether the kick is blocked.{" "}
          <AboutLink href={FIELD_LOGIC + "#L3722-L3742"}>Kicker skill read and store</AboutLink>
          {" · "}<AboutLink href={FIELD_LOGIC + "#L3839-L3854"}>Block check</AboutLink>
          {" · "}<AboutLink href={FIELD_LOGIC + "#L11459-L11460"}>Block thresholds</AboutLink>
        </p>

        <h3>P</h3>
        <RatingsTable
          rows={[
            ["Running Speed", "25"],
            ["Rushing Power", "56"],
            ["Maximum Speed", "44"],
            ["Hitting Power", "31"],
            ["Avoid Kick Block", "not used because punts cannot be blocked"],
          ]}
        />

        <h2>
          Step two: Calculate a score for attributes that do matter
        </h2>
        <p>
          Next, for most attributes that remain, I assign a score based on the highest value for a player at that position.
        </p>
        <p>
          For example, the highest Maximum Speed for a QB is 56, which belongs to QB Eagles. So he scores 100% on that attribute. The highest Pass Control is 81, shared by both Montana and QB Bills, who again both get 100%. Since QB Eagles has Pass Control of 69, he receives an 85% (69/81 * 100) for that attribute.
        </p>

        <h2>
          Step three: Weight each attribute to determine a total score
        </h2>
        <p>
          Once each attribute score is calculated, they are averaged to give a final score. However, rather than treating all scores as equal, I weight each score based on its importance for determining the performance of the player at that position.
        </p>
        <p>
          For instance, Maximum Speed is the largest part of both rusher and receiver ratings, while Receptions still has a major role for receivers.
        </p>
        <p>Below are the weightings of attributes for players at each position.</p>

        <figure className="my-6">
          <Image
            src="/images/about/ranking-explain.png"
            alt="Example of attribute score weights for a rusher."
            width={603}
            height={281}
            sizes="(max-width: 640px) calc(100vw - 2rem), 603px"
            unoptimized
            className="h-auto w-full max-w-150.75 rounded-sm"
          />
          <figcaption className="mt-1 text-[13px] text-white/90 sm:text-[14px]">
            When player attributes are shown, the width of the bars corresponds to the weight that attribute has in determining the total player score. Above are the attribute scores and weightings for a rusher.
          </figcaption>
        </figure>

        <h3>QB</h3>
        <WeightTable slug="qb" />

        <h3>Rushers (all RB, WR, TE receive a rusher rating)</h3>
        <WeightTable slug="rushers" />

        <h3>Receivers (all RB, WR, TE receive a receiver rating)</h3>
        <WeightTable slug="receivers" />

        <h3>Kick Returners (all RB, WR, TE receive a kick returner rating)</h3>
        <WeightTable slug="kick-returners" />

        <h3>Punt Returners (all RB, WR, TE receive a punt returner rating)</h3>
        <WeightTable slug="punt-returners" />

        <h3>A note about hitting power for RBs, WRs and TEs</h3>
        <p>Hitting Power uses these score bands for rusher, receiver and returner ratings:</p>
        <HittingPowerTable scores={OFFENSIVE_HP_SCORE_MAP} showLowerBand />
        <p>
          Rankings still use higher raw hitting power as the tiebreak when two offensive players have the same displayed rating.
        </p>

        <h3>OL</h3>
        <WeightTable slug="ol" />
        <p>OL Hitting Power uses these score bands:</p>
        <HittingPowerTable scores={OFFENSIVE_LINE_HP_SCORE_MAP} />

        <h3>DL</h3>
        <WeightTable slug="dl" />

        <h3>LB</h3>
        <WeightTable slug="lb" />

        <h3>CB/S</h3>
        <WeightTable slug="cb-s" />
        <p>
          Defensive Hitting Power uses these score bands for DL, LB and CB/S ratings:
        </p>
        <HittingPowerTable scores={DEFENSIVE_HP_SCORE_MAP} />

        <h3>K</h3>
        <WeightTable slug="k" />

        <h3>P</h3>
        <WeightTable slug="p" />

        <h2>
          Example: ratings for Jerry Rice and Bo Jackson
        </h2>
        <p>
          Let&apos;s take a closer look at how this scoring system works for two players: Jerry Rice
          and Bo Jackson.
        </p>
        <p>First, here are the attributes and scores for each player.</p>
        <p>(Reminder: most scores compare the player value to the highest player value in that group. Hitting Power uses the score bands listed above.)</p>

        {examples.map(({ surname, rows }) => (
          <Fragment key={surname}>
            <h3>{surname}</h3>
            <RatingsTable headings={["Attribute", "Value", "Score"]} rows={rows} />
          </Fragment>
        ))}

        <p>
          For RB, WR and TE ratings, Hitting Power below 75 receives no Hitting Power score.
        </p>

        <p>Here are the ratings for each player as a receiver:</p>

        {examples.map(example => <RatingCalculation key={example.surname} {...example.receiving} />)}

        <p>
          No surprises here, as Jerry Rice is the best receiver in the game. While Bo Jackson&apos;s speed counts for a lot, his poor Receptions hurts him as a receiver.
        </p>

        <p>Now here are their rusher ratings:</p>

        {examples.map(example => <RatingCalculation key={example.surname} {...example.rushing} />)}

        <p>Jackson is the best rusher in the game, with Rice a close second.</p>

        <h2>
          Step four: Use rating to assign a ranking
        </h2>
        <p>
          For each player, I show their rating as well as ranking. The rating shows their actual performance at that position compared to every other player, and ranking shows how many players are above or below them once those ratings are ordered. For RB, WR, TE, OL and defensive players, ties in the displayed rating are broken by higher Hitting Power.
        </p>
        <p>
          The rating system isn&apos;t perfect, but it&apos;s a useful tool for ranking players against each other and getting a relative sense of their ability.
        </p>
      </section>
    </article>
  );
}
