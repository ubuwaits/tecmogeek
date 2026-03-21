import type { Metadata, ResolvingMetadata } from "next";
import Image from "next/image";

import { ArticlePage } from "@/components/article-page";
import { mergeOpenGraph } from "@/lib/metadata";
import { aboutRatingsRoute } from "@/lib/routes";

export async function generateMetadata(
  _: PageProps<"/about/ratings">,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  return {
    title: "About player ratings",
    alternates: {
      canonical: aboutRatingsRoute,
    },
    openGraph: await mergeOpenGraph(parent, {
      url: aboutRatingsRoute,
      title: "About player ratings",
    }),
  };
}

export default function RatingsPage() {
  return (
    <ArticlePage>
      <article className="prose prose-neutral max-w-none prose-a:no-underline prose-a:text-(--blue) prose-headings:text-[#3a3a3a] prose-strong:text-[#3a3a3a]">
        <h1 className="mb-0 font-(family-name:--font-tecmo) text-[23px] leading-snug uppercase text-balance sm:text-[36px] sm:leading-[40px]">
          How player ratings and rankings are calculated
        </h1>

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
        <p>
          Running Speed: <strong>25</strong>
          <br />
          Rushing Power: <strong>69</strong>
          <br />
          Hitting Power: <strong>13</strong>
          <br />
          Accuracy of Passing: <strong>not used</strong>
        </p>

        <h3>RB/WR/TE</h3>
        <p>
          Rushing Power: <strong>69</strong> (Even Okoye, who has a listed Rushing Power of 75)
        </p>

        <h3>Kick Returners</h3>
        <p>
          Receptions: <strong>not used</strong>
        </p>

        <h3>Punt Returners</h3>
        <p>
          Ball Control: <strong>44</strong>
          <br />
          Receptions: <strong>not used</strong>
        </p>

        <h3>OL</h3>
        <p>
          Running Speed: <strong>25</strong>
          <br />
          Rushing Power: <strong>69</strong>
        </p>

        <h3>DL/LB/C/S</h3>
        <p>
          Quickness: <strong>not used</strong>
        </p>

        <h3>K</h3>
        <p>
          Running Speed: <strong>56</strong>
          <br />
          Rushing Power: <strong>81</strong>
          <br />
          Maximum Speed: <strong>81</strong>
          <br />
          Hitting Power: <strong>31</strong>
        </p>

        <h3>P</h3>
        <p>
          Running Speed: <strong>25</strong>
          <br />
          Rushing Power: <strong>56</strong>
          <br />
          Maximum Speed: <strong>44</strong>
          <br />
          Hitting Power: <strong>31</strong>
        </p>

        <h2>
          Step two: Calculate a score for attributes that do matter
        </h2>
        <p>
          Next, for the attributes that remain, I assign a score based on the highest value for a player at that position.
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
          For instance, for rushers, Maximum Speed is by far the most important attribute. For receivers, Receptions is most important.
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
        <p>
          Maximum Speed: 25%
          <br />
          Passing Speed: 20%
          <br />
          Pass Control: 50%
          <br />
          Avoid Pass Block: 5%
        </p>

        <h3>Rushers (all RB, WR, TE receive a rusher rating)</h3>
        <p>
          Running Speed: 10%
          <br />
          Maximum Speed: 70%
          <br />
          Hitting Power: 10%
          <br />
          Ball Control: 5%
          <br />
          Receptions: 5%
        </p>

        <h3>Receivers (all RB, WR, TE receive a receiver rating)</h3>
        <p>
          Running Speed: 10%
          <br />
          Maximum Speed: 30%
          <br />
          Hitting Power: 5%
          <br />
          Ball Control: 5%
          <br />
          Receptions: 50%
        </p>

        <h3>Kick Returners (all RB, WR, TE receive a kick returner rating)</h3>
        <p>
          Running Speed: 20%
          <br />
          Maximum Speed: 60%
          <br />
          Hitting Power: 10%
          <br />
          Ball Control: 10%
        </p>

        <h3>Punt Returners (all RB, WR, TE receive a punt returner rating)</h3>
        <p>
          Running Speed: 20%
          <br />
          Maximum Speed: 70%
          <br />
          Hitting Power: 10%
        </p>

        <h3>OL</h3>
        <p>
          Maximum Speed: 50%
          <br />
          Hitting Power: 50%
        </p>

        <h3>DL</h3>
        <p>
          Running Speed: 10%
          <br />
          Rushing Power: 35%
          <br />
          Maximum Speed: 10%
          <br />
          Hitting Power: 40%
          <br />
          Pass Interceptions: 5%
        </p>

        <h3>LB</h3>
        <p>
          Running Speed: 10%
          <br />
          Rushing Power: 35%
          <br />
          Maximum Speed: 10%
          <br />
          Hitting Power: 30%
          <br />
          Pass Interceptions: 15%
        </p>

        <h3>CB/S</h3>
        <p>
          Running Speed: 10%
          <br />
          Rushing Power: 35%
          <br />
          Maximum Speed: 10%
          <br />
          Hitting Power: 5%
          <br />
          Pass Interceptions: 40%
        </p>

        <h3>K</h3>
        <p>
          Kicking attribute: 70%
          <br />
          Avoid Kick Block: 30%
        </p>

        <h3>P</h3>
        <p>
          Kicking attribute: 70%
          <br />
          Avoid Kick Block: 30%
        </p>

        <h3>A note about hitting power for offensive players</h3>
        <p>
          Hitting power only really makes a difference on offensive player performance once it reaches about 88. To account for this, offensive ratings use score bands instead of the raw hitting power value: players below 75 get 0%, 75 gets 40%, 81 gets 60%, 88 gets 80%, and 94 gets 100%. That gives players with 75 and 81 hitting power in average condition partial credit, since they can reach 88 in Good and Excellent condition.
        </p>
        <p>
          Rankings still use higher raw hitting power as the tiebreak when two offensive players have the same displayed rating.
        </p>

        <h2>
          Example: ratings for Jerry Rice and Bo Jackson
        </h2>
        <p>
          Let&apos;s take a closer look at how this scoring system works for two players: Jerry Rice
          and Bo Jackson.
        </p>
        <p>First, here are the attributes and scores for each player.</p>
        <p>(Reminder: Score = Highest value for any player at that position/player value * 100)</p>

        <p>
          <strong>Rice:</strong>
          <br />
          Running Speed: 44 (69.84%)
          <br />
          Maximum Speed: 69 (92.00%)
          <br />
          Hitting Power: 13 (0%)
          <br />
          Ball Control: 81 (100.00%)
          <br />
          Receptions: 81 (100.00%)
        </p>

        <p>
          <strong>Jackson:</strong>
          <br />
          Running Speed: 38 (60.32%)
          <br />
          Maximum Speed: 75 (100.00%)
          <br />
          Hitting Power: 31 (0%)
          <br />
          Ball Control: 81 (100.00%)
          <br />
          Receptions: 81 (23.46%)
        </p>

        <p>
          As explained above, hitting power below 75 is discarded when determining player rating.
        </p>

        <p>Here are the ratings for each player as a receiver:</p>

        <p>
          Rice: <strong>89.58%</strong> ((10 * (69.84 / 100)) + (30 * (92 / 100)) + (5 * (0 / 100)) + (5 * (100 / 100)) + (50 * (100 / 100)))
        </p>

        <p>
          Jackson: <strong>52.76%</strong> ((10 * (60.32 / 100)) + (40 * (100 / 100)) + (5 * (0 / 100)) + (5 * (100 / 100)) + (50 * (23.46 / 100)))
        </p>

        <p>
          No surprises here, as Jerry Rice is the best receiver in the game. While Bo Jackson&apos;s speed counts for a lot, his poor Receptions hurts him as a receiver.
        </p>

        <p>Now here are their rusher ratings:</p>

        <p>
          Rice: <strong>81.38%</strong> ((10 * (69.84 / 100)) + (70 * (92 / 100)) + (10 * (0 /
          100)) + (5 * (100 / 100)) + (5 * (100 / 100)))
        </p>

        <p>
          Jackson: <strong>82.20%</strong> ((10 * (60.32 / 100)) + (70 * (100 / 100)) + (10 *
          (0 / 100)) + (5 * (100 / 100)) + (5 * (23.46 / 100)))
        </p>

        <p>Jackson is the best rusher in the game, with Rice a close second.</p>

        <h2>
          Step four: Use rating to assign a ranking
        </h2>
        <p>
          For each player, I show their rating as well as ranking. The rating shows their actual performance at that position compared to every other player, and ranking shows how many players are above or below them once those ratings are ordered. For offensive players, ties in the displayed rating are broken by higher hitting power.
        </p>
        <p>
          The rating system isn&apos;t perfect, but it&apos;s a useful tool for ranking players against each other and getting a relative sense of their ability.
        </p>
      </article>
    </ArticlePage>
  );
}
