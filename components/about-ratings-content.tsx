"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { SelectionTabs, type SelectionTabItem } from "@/components/selection-tabs";

const RATING_TOPIC_TABS: readonly SelectionTabItem[] = [
  { id: "player", label: "Player Ratings" },
  { id: "team", label: "Team Ratings" },
];

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
    <div className="not-prose my-5 border-l-2 border-neutral-200 pl-4">
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

export function AboutRatingsContent() {
  const [activeTopic, setActiveTopic] = useState("player");

  return (
    <article className="prose prose-neutral max-w-none prose-a:no-underline prose-a:text-(--blue) prose-headings:text-[#3a3a3a] prose-strong:text-[#3a3a3a]">
      <h1 className="mb-0 font-(family-name:--font-tecmo) text-[23px] leading-snug uppercase text-balance sm:text-[36px] sm:leading-[40px]">
        How player and team ratings are calculated
      </h1>

      <div className="not-prose my-6">
        <SelectionTabs
          items={RATING_TOPIC_TABS}
          activeId={activeTopic}
          onChange={setActiveTopic}
          tabTestIdPrefix="ratings-topic"
          mobileSelectLabel="Ratings topic"
          mobileSelectTestId="ratings-topic-select"
          lineTone="light"
        />
      </div>

      <section data-testid="ratings-content-player" hidden={activeTopic !== "player"}>
        <h2>
          Step one: Forget about attributes that don&apos;t matter
        </h2>

        <p>
          First, for each type of player, I disregard attributes which are either the same for each player or not used by the game to determine performance. Yes, for whatever reason (the programmers forgot, ran out of time, etc.), Accuracy of Passing for QBs, and Quickness for defensive players have no effect on actual performance.
        </p>
        <p>
          Below are the attributes that are either the same for every player at the position or not used. Note that I put RBs, WRs, and TEs into one group, since every player can play each of the other two positions.
        </p>
        <p>
          If you want to learn more about attributes and how they affect player performance, I highly recommend <a href="http://www.gamefaqs.com/nes/587686-tecmo-super-bowl/faqs/44195" className="font-bold"> this guide</a>.
        </p>

        <h3>QB</h3>
        <RatingsTable
          rows={[
            ["Running Speed", "25"],
            ["Rushing Power", "69"],
            ["Hitting Power", "13"],
            ["Accuracy of Passing", "not used"],
          ]}
        />

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

        <h3>Punt Returners</h3>
        <RatingsTable
          rows={[
            ["Ball Control", "44"],
            ["Receptions", "not used"],
          ]}
        />

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
          Due to a programming glitch, if the blocked-kick cutscene is triggered, the game uses the worst Avoid Kick Block value rather than the kicker&apos;s actual rating.
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
            className="h-auto w-full max-w-[603px] rounded-sm"
          />
          <figcaption className="mt-1 text-[13px] text-[#626262] sm:text-[14px]">
            When player attributes are shown, the width of the bars corresponds to the weight that attribute has in determining the total player score. Above are the attribute scores and weightings for a rusher.
          </figcaption>
        </figure>

        <h3>QB</h3>
        <RatingsTable
          headings={["Attribute", "Weight"]}
          rows={[
            ["Maximum Speed", "25%"],
            ["Passing Speed", "20%"],
            ["Pass Control", "50%"],
            ["Avoid Pass Block", "5%"],
          ]}
        />

        <h3>Rushers (all RB, WR, TE receive a rusher rating)</h3>
        <RatingsTable
          headings={["Attribute", "Weight"]}
          rows={[
            ["Running Speed", "10%"],
            ["Maximum Speed", "70%"],
            ["Hitting Power", "10%"],
            ["Ball Control", "5%"],
            ["Receptions", "5%"],
          ]}
        />

        <h3>Receivers (all RB, WR, TE receive a receiver rating)</h3>
        <RatingsTable
          headings={["Attribute", "Weight"]}
          rows={[
            ["Running Speed", "10%"],
            ["Maximum Speed", "45%"],
            ["Hitting Power", "5%"],
            ["Ball Control", "5%"],
            ["Receptions", "35%"],
          ]}
        />

        <h3>Kick Returners (all RB, WR, TE receive a kick returner rating)</h3>
        <RatingsTable
          headings={["Attribute", "Weight"]}
          rows={[
            ["Running Speed", "20%"],
            ["Maximum Speed", "60%"],
            ["Hitting Power", "10%"],
            ["Ball Control", "10%"],
          ]}
        />

        <h3>Punt Returners (all RB, WR, TE receive a punt returner rating)</h3>
        <RatingsTable
          headings={["Attribute", "Weight"]}
          rows={[
            ["Running Speed", "20%"],
            ["Maximum Speed", "70%"],
            ["Hitting Power", "10%"],
          ]}
        />

        <h3>A note about hitting power for RBs, WRs and TEs</h3>
        <p>Hitting Power uses these score bands for rusher, receiver and returner ratings:</p>
        <RatingsTable
          headings={["Hitting Power", "Score"]}
          rows={[
            ["Below 75", "0%"],
            [75, "5%"],
            [81, "25%"],
            [88, "60%"],
            [94, "100%"],
          ]}
        />
        <p>
          Rankings still use higher raw hitting power as the tiebreak when two offensive players have the same displayed rating.
        </p>

        <h3>OL</h3>
        <RatingsTable
          headings={["Attribute", "Weight"]}
          rows={[
            ["Maximum Speed", "20%"],
            ["Hitting Power", "80%"],
          ]}
        />
        <p>OL Hitting Power uses these score bands:</p>
        <RatingsTable
          headings={["Hitting Power", "Score"]}
          rows={[
            [31, "0%"],
            [38, "15%"],
            [44, "30%"],
            [50, "45%"],
            [56, "55%"],
            [63, "65%"],
            [69, "80%"],
            [75, "90%"],
            [81, "100%"],
          ]}
        />

        <h3>DL</h3>
        <RatingsTable
          headings={["Attribute", "Weight"]}
          rows={[
            ["Running Speed", "10%"],
            ["Rushing Power", "35%"],
            ["Maximum Speed", "10%"],
            ["Hitting Power", "40%"],
            ["Pass Interceptions", "5%"],
          ]}
        />

        <h3>LB</h3>
        <RatingsTable
          headings={["Attribute", "Weight"]}
          rows={[
            ["Running Speed", "10%"],
            ["Rushing Power", "35%"],
            ["Maximum Speed", "10%"],
            ["Hitting Power", "30%"],
            ["Pass Interceptions", "15%"],
          ]}
        />

        <h3>CB/S</h3>
        <RatingsTable
          headings={["Attribute", "Weight"]}
          rows={[
            ["Running Speed", "10%"],
            ["Rushing Power", "35%"],
            ["Maximum Speed", "10%"],
            ["Hitting Power", "5%"],
            ["Pass Interceptions", "40%"],
          ]}
        />
        <p>
          Defensive Hitting Power uses these score bands for DL, LB and CB/S ratings:
        </p>
        <RatingsTable
          headings={["Hitting Power", "Score"]}
          rows={[
            [19, "0%"],
            [25, "7%"],
            [31, "16%"],
            [38, "23%"],
            [44, "30%"],
            [50, "36%"],
            [56, "45%"],
            [63, "59%"],
            [69, "78%"],
            [75, "100%"],
          ]}
        />

        <h3>K</h3>
        <RatingsTable
          headings={["Attribute", "Weight"]}
          rows={[
            ["Kicking Ability", "100%"],
          ]}
        />

        <h3>P</h3>
        <RatingsTable
          headings={["Attribute", "Weight"]}
          rows={[
            ["Kicking Ability", "100%"],
          ]}
        />

        <h2>
          Example: ratings for Jerry Rice and Bo Jackson
        </h2>
        <p>
          Let&apos;s take a closer look at how this scoring system works for two players: Jerry Rice
          and Bo Jackson.
        </p>
        <p>First, here are the attributes and scores for each player.</p>
        <p>(Reminder: most scores compare the player value to the highest player value in that group. Hitting Power uses the score bands listed above.)</p>

        <h3>Rice</h3>
        <RatingsTable
          headings={["Attribute", "Value", "Score"]}
          rows={[
            ["Running Speed", "44", "69.84%"],
            ["Maximum Speed", "69", "92.00%"],
            ["Hitting Power", "13", "0%"],
            ["Ball Control", "81", "100.00%"],
            ["Receptions", "81", "100.00%"],
          ]}
        />

        <h3>Jackson</h3>
        <RatingsTable
          headings={["Attribute", "Value", "Score"]}
          rows={[
            ["Running Speed", "38", "60.32%"],
            ["Maximum Speed", "75", "100.00%"],
            ["Hitting Power", "31", "0%"],
            ["Ball Control", "81", "100.00%"],
            ["Receptions", "19", "23.46%"],
          ]}
        />

        <p>
          For RB, WR and TE ratings, Hitting Power below 75 receives no Hitting Power score.
        </p>

        <p>Here are the ratings for each player as a receiver:</p>

        <RatingCalculation
          player="Rice"
          rating="88.38"
          terms={["10 × 0.6984", "45 × 0.92", "5 × 0", "5 × 1", "35 × 1"]}
        />
        <RatingCalculation
          player="Jackson"
          rating="64.24"
          terms={["10 × 0.6032", "45 × 1", "5 × 0", "5 × 1", "35 × 0.2346"]}
        />

        <p>
          No surprises here, as Jerry Rice is the best receiver in the game. While Bo Jackson&apos;s speed counts for a lot, his poor Receptions hurts him as a receiver.
        </p>

        <p>Now here are their rusher ratings:</p>

        <RatingCalculation
          player="Rice"
          rating="81.38"
          terms={["10 × 0.6984", "70 × 0.92", "10 × 0", "5 × 1", "5 × 1"]}
        />
        <RatingCalculation
          player="Jackson"
          rating="82.20"
          terms={["10 × 0.6032", "70 × 1", "10 × 0", "5 × 1", "5 × 0.2346"]}
        />

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

      <section data-testid="ratings-content-team" hidden={activeTopic !== "team"}>
        <h2>What team ratings measure</h2>
        <p>
          Team ratings start with the player ratings, which are then rolled up into offensive, defensive, and overall team ratings. The goal is to model the strongest possible lineup for a given team.
        </p>
        <p>
          The <Link href="/teams">Team Ratings page</Link> shows the final overall score, including offensive and defensive sub-ratings.
        </p>

        <h2>Offensive rating</h2>
        <p>
          Offensive ratings combine four sub-ratings: quarterbacks, the best skill-player lineup, the offensive line, and kick and punk returners.
        </p>
        <ul>
          <li>The QB value is the weighted average of the best quarterback at 80% and the backup at 20%.</li>
          <li>The offensive line is the average of the five starters: C, LG, RG, LT, and RT.</li>
          <li>The return game uses the best kick and punt returners from the RB/WR/TE pool.</li>
          <li>The skill positions are treated as one shared pool, and the model searches for the best five-man lineup for each offensive style.</li>
        </ul>
        <p>
          That last part is the key difference between team and player ratings. Instead of grading one player in isolation, the offensive rating is the best combination of backs, wideouts, and tight ends for how a team would actually want to play.
        </p>

        <h2>Why there are three offensive sub-ratings</h2>
        <p>
          When you expand offense on the team table, you&apos;ll see three different offense scores because a roster can be strong in different ways.
        </p>
        <ul>
          <li><strong>Run</strong> emphasizes the best run-oriented lineup, with the biggest weight on the top two rushing slots.</li>
          <li><strong>Pass</strong> emphasizes the strongest pass-catching lineup and gives quarterback play much more influence.</li>
          <li><strong>Balanced</strong> is a mixed offense, but it is intentionally pass-biased because passing is generally the stronger offensive mode in Tecmo.</li>
        </ul>
        <p>
          The final offensive rating leans most heavily on that balanced score, so teams with flexible, pass-friendly lineups usually grade better than teams that are one-dimensional.
        </p>

        <h2>Defensive rating</h2>
        <p>
          Defense is simpler. It uses the fixed 11 starters only, then breaks them into three units: defensive line, linebackers, and secondary.
        </p>
        <ul>
          <li>The defensive line is the average of RE, NT, and LE.</li>
          <li>The linebacker score is the average of ROLB, RILB, LILB, and LOLB.</li>
          <li>The secondary score is the average of RCB, LCB, FS, and SS.</li>
        </ul>
        <p>
          Those three unit scores are then combined by starter count, so the four-man linebacker group and four-man secondary group matter slightly more than the three-man defensive line.
        </p>

        <h2>Overall rating</h2>
        <p>
          The overall team rating is just a 50/50 average between the offensive and defensive rating.
        </p>

        <p>
          The team ratings intentionally leave out a few things:
        </p>
        <ul>
          <li>Kickers and punters are not part of the team rating.</li>
          <li>The model does not simulate injuries, fatigue, or player substitutions.</li>
          <li>It does not take into account the default playbooks for each team.</li>
        </ul>
      </section>
    </article>
  );
}
