import type { Metadata } from "next";
import Image from "next/image";

import { aboutRatingsRoute } from "@/lib/routes";

export const metadata: Metadata = {
  title: "About player ratings",
  alternates: {
    canonical: aboutRatingsRoute,
  },
  openGraph: {
    url: aboutRatingsRoute,
    title: "About player ratings",
  },
};

const headingClassName =
  "font-(family-name:--font-tecmo) text-[36px] leading-[40px] uppercase text-[#3a3a3a]";
const subHeadingClassName = "mb-2 mt-8 text-[24px] font-semibold leading-[1.2] text-[#3a3a3a]";
const sectionHeadingClassName = "mb-1 text-[1.2em] font-bold text-[#3a3a3a]";
const paragraphClassName = "mb-4 text-[18px] leading-[1.5] text-[#3a3a3a]";

export default function RatingsPage() {
  return (
    <section
      data-page-theme="text"
      className="mx-auto mt-6 max-w-[700px] text-[#3a3a3a] [text-shadow:0_1px_0_#fff]"
    >
      <h1 className={headingClassName}>How player ratings and rankings are calculated</h1>
      <h2 className={`${subHeadingClassName} mt-6`}>
        Step one: Forget about attributes that don&apos;t matter
      </h2>

      <p className={paragraphClassName}>
        First, for each type of player, I disregard attributes which are either the same for each
        player or not used by the game to determine performance. Yes, that&apos;s right, for
        whatever reason (the programmers forgot, ran out of time, etc.), the Accuracy of Passing
        attribute for QBs, and Quickness attribute for defensive players have no affect on actual
        performance.
      </p>
      <p className={paragraphClassName}>
        Below are the attributes that are either the same for every player at a position or not
        used. Note that I am grouping RBs, WRs, and TEs into one group, since every player at one
        of those positions can play each of the other two positions.
      </p>
      <p className={paragraphClassName}>
        If you want to learn more about attributes and how they affect player performance, I highly
        recommend{" "}
        <a
          href="http://www.gamefaqs.com/nes/587686-tecmo-super-bowl/faqs/44195"
          className="font-bold text-[var(--blue)]"
        >
          this guide
        </a>
        .
      </p>

      <h3 className={sectionHeadingClassName}>QB</h3>
      <p className={paragraphClassName}>
        Running Speed: <strong>25</strong>
        <br />
        Rushing Power: <strong>69</strong>
        <br />
        Hitting Power: <strong>13</strong>
        <br />
        Accuracy of Passing: <strong>not used</strong>
      </p>

      <h3 className={sectionHeadingClassName}>RB/WR/TE</h3>
      <p className={paragraphClassName}>
        Rushing Power: <strong>69</strong> (Even Okoye, who has a listed Rushing Power of 75)
      </p>

      <h3 className={sectionHeadingClassName}>Kick Returners</h3>
      <p className={paragraphClassName}>
        Receptions: <strong>not used</strong>
      </p>

      <h3 className={sectionHeadingClassName}>Punt Returners</h3>
      <p className={paragraphClassName}>
        Ball Control: <strong>44</strong>
        <br />
        Receptions: <strong>not used</strong>
      </p>

      <h3 className={sectionHeadingClassName}>OL</h3>
      <p className={paragraphClassName}>
        Running Speed: <strong>25</strong>
        <br />
        Rushing Power: <strong>69</strong>
      </p>

      <h3 className={sectionHeadingClassName}>DL/LB/C/S</h3>
      <p className={paragraphClassName}>
        Quickness: <strong>not used</strong>
      </p>

      <h3 className={sectionHeadingClassName}>K</h3>
      <p className={paragraphClassName}>
        Running Speed: <strong>56</strong>
        <br />
        Rushing Power: <strong>81</strong>
        <br />
        Maximum Speed: <strong>81</strong>
        <br />
        Hitting Power: <strong>31</strong>
      </p>

      <h3 className={sectionHeadingClassName}>P</h3>
      <p className={paragraphClassName}>
        Running Speed: <strong>25</strong>
        <br />
        Rushing Power: <strong>56</strong>
        <br />
        Maximum Speed: <strong>44</strong>
        <br />
        Hitting Power: <strong>31</strong>
      </p>

      <h2 className={subHeadingClassName}>Step two: Calculate a score for attributes that do matter</h2>
      <p className={paragraphClassName}>
        Next, for the attributes that remain, I assign a score based on the highest value for a
        player at that position.
      </p>
      <p className={paragraphClassName}>
        For example, the highest Maximum Speed for a QB is 56, which belongs to QB Eagles. So he
        scores 100% on that attribute. The highest Pass Control is 81, shared by both Montana and
        QB Bills, who again both get 100%. Since QB Eagles has Pass Control of 69, he receives an
        85% (69/81 * 100) for that attribute.
      </p>

      <h2 className={subHeadingClassName}>Step three: Weight each attribute to determine a total score</h2>
      <p className={paragraphClassName}>
        Once each attribute score is calculated, they are averaged to give a final score. However,
        rather than treating all scores as equal, I weight each score based on its importance for
        determining the performance of the player at that position.
      </p>
      <p className={paragraphClassName}>
        For instance, for rushers, Maximum Speed is by far the most important attribute. For
        receivers, Maximum Speed is most important.
      </p>
      <p className={paragraphClassName}>
        Below are the weightings of attributes for players at each position.
      </p>

      <Image
        src="/images/about/ranking-explain.png"
        alt="Example of attribute score weights for a rusher."
        width={603}
        height={281}
        unoptimized
        className="rounded-[4px]"
      />
      <p className="mb-6 mt-[-0.75em] text-[14px] text-[#626262]">
        When player attributes are shown, the width of the bars corresponds to the weight that
        attribute has in determining the total player score. Above are the attribute scores and
        weightings for a rusher.
      </p>

      <h3 className={sectionHeadingClassName}>QB</h3>
      <p className={paragraphClassName}>
        Maximum Speed: 25%
        <br />
        Passing Speed: 20%
        <br />
        Pass Control: 50%
        <br />
        Avoid Pass Block: 5%
      </p>

      <h3 className={sectionHeadingClassName}>Rushers (all RB, WR, TE receive a rusher rating)</h3>
      <p className={paragraphClassName}>
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

      <h3 className={sectionHeadingClassName}>Receivers (all RB, WR, TE receive a receiver rating)</h3>
      <p className={paragraphClassName}>
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

      <h3 className={sectionHeadingClassName}>
        Kick Returners (all RB, WR, TE receive a kick returner rating)
      </h3>
      <p className={paragraphClassName}>
        Running Speed: 20%
        <br />
        Maximum Speed: 60%
        <br />
        Hitting Power: 10%
        <br />
        Ball Control: 10%
      </p>

      <h3 className={sectionHeadingClassName}>
        Punt Returners (all RB, WR, TE receive a punt returner rating)
      </h3>
      <p className={paragraphClassName}>
        Running Speed: 20%
        <br />
        Maximum Speed: 70%
        <br />
        Hitting Power: 10%
      </p>

      <h3 className={sectionHeadingClassName}>OL</h3>
      <p className={paragraphClassName}>
        Maximum Speed: 50%
        <br />
        Hitting Power: 50%
      </p>

      <h3 className={sectionHeadingClassName}>DL</h3>
      <p className={paragraphClassName}>
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

      <h3 className={sectionHeadingClassName}>LB</h3>
      <p className={paragraphClassName}>
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

      <h3 className={sectionHeadingClassName}>CB/S</h3>
      <p className={paragraphClassName}>
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

      <h3 className={sectionHeadingClassName}>K</h3>
      <p className={paragraphClassName}>
        Kicking attribute: 70%
        <br />
        Avoid Kick Block: 30%
      </p>

      <h3 className={sectionHeadingClassName}>P</h3>
      <p className={paragraphClassName}>
        Kicking attribute: 70%
        <br />
        Avoid Kick Block: 30%
      </p>

      <h3 className={sectionHeadingClassName}>A note about hitting power for offensive players</h3>
      <p className={paragraphClassName}>
        Hitting power only really makes a difference on offensive player performance at about 88.
        To account for this, players with hitting power below that threshold do not have hitting
        power factored into their rating. Players with 75 and 81 hitting power in average
        condition are given partial credit, since they can reach 88 in Good and Excellent
        condition.
      </p>

      <h2 className={subHeadingClassName}>Example: ratings for Jerry Rice and Bo Jackson</h2>
      <p className={paragraphClassName}>
        Let&apos;s take a closer look at how this scoring system works for two players: Jerry Rice
        and Bo Jackson.
      </p>
      <p className={paragraphClassName}>First, here are the attributes and scores for each player.</p>
      <p className={paragraphClassName}>
        (Reminder: Score = Highest value for any player at that position/player value * 100)
      </p>

      <p className={paragraphClassName}>
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

      <p className={paragraphClassName}>
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

      <p className={paragraphClassName}>
        As explained above, hitting power below 88 is discarded when determining player rating.
      </p>
      <p className={paragraphClassName}>Here are the ratings for each player as a receiver:</p>

      <p className={paragraphClassName}>
        Rice: <strong>89.58%</strong> ((10 * (69.84 / 100)) + (30 * (92 / 100)) + (5 * (0 / 100))
        + (5 * (100 / 100)) + (50 * (100 / 100)))
      </p>

      <p className={paragraphClassName}>
        Jackson: <strong>52.76%</strong> ((10 * (60.32 / 100)) + (40 * (100 / 100)) + (5 * (0 /
        100)) + (5 * (100 / 100)) + (50 * (23.46 / 100)))
      </p>

      <p className={paragraphClassName}>
        No surprises here, as Jerry Rice is the best receiver in the game. While Bo Jackson&apos;s
        speed counts for a lot, his poor Receptions hurts him as a receiver.
      </p>

      <p className={paragraphClassName}>Now here are their rusher ratings:</p>

      <p className={paragraphClassName}>
        Rice: <strong>81.38%</strong> ((10 * (69.84 / 100)) + (70 * (92 / 100)) + (10 * (13.83 /
        100)) + (5 * (100 / 100)) + (5 * (100 / 100)))
      </p>

      <p className={paragraphClassName}>
        Jackson: <strong>82.20%</strong> ((10 * (60.32 / 100)) + (70 * (100 / 100)) + (10 * (32.98
        / 100)) + (5 * (100 / 100)) + (5 * (23.46 / 100)))
      </p>

      <p className={paragraphClassName}>
        Jackson is the best rusher in the game, with Rice a close second.
      </p>

      <h2 className={subHeadingClassName}>Step four: Use rating to assign a ranking</h2>
      <p className={paragraphClassName}>
        For each player, I show their rating as well as ranking. The rating shows their actual
        performance at that position compared to every other player, and ranking shows how many
        players are above or below them using the same rating system.
      </p>
      <p className={`${paragraphClassName} mb-0`}>
        The rating system isn&apos;t perfect, but it&apos;s a useful tool for ranking players against
        each other and getting a relative sense of their ability.
      </p>
    </section>
  );
}
