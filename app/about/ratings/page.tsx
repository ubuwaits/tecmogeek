import type { Metadata } from "next";
import Image from "next/image";

import {
  ArticleCaption,
  ArticlePage,
  ArticleParagraph,
  ArticleSectionTitle,
  ArticleSubsectionTitle,
  ArticleTitle,
} from "@/components/article-page";
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

export default function RatingsPage() {
  return (
    <ArticlePage>
      <ArticleTitle>How player ratings and rankings are calculated</ArticleTitle>
      <ArticleSectionTitle className="mt-6">
        Step one: Forget about attributes that don&apos;t matter
      </ArticleSectionTitle>

      <ArticleParagraph>
        First, for each type of player, I disregard attributes which are either the same for each
        player or not used by the game to determine performance. Yes, that&apos;s right, for
        whatever reason (the programmers forgot, ran out of time, etc.), the Accuracy of Passing
        attribute for QBs, and Quickness attribute for defensive players have no affect on actual
        performance.
      </ArticleParagraph>
      <ArticleParagraph>
        Below are the attributes that are either the same for every player at a position or not
        used. Note that I am grouping RBs, WRs, and TEs into one group, since every player at one
        of those positions can play each of the other two positions.
      </ArticleParagraph>
      <ArticleParagraph>
        If you want to learn more about attributes and how they affect player performance, I highly
        recommend{" "}
        <a
          href="http://www.gamefaqs.com/nes/587686-tecmo-super-bowl/faqs/44195"
          className="font-bold text-(--blue)"
        >
          this guide
        </a>
        .
      </ArticleParagraph>

      <ArticleSubsectionTitle>QB</ArticleSubsectionTitle>
      <ArticleParagraph>
        Running Speed: <strong>25</strong>
        <br />
        Rushing Power: <strong>69</strong>
        <br />
        Hitting Power: <strong>13</strong>
        <br />
        Accuracy of Passing: <strong>not used</strong>
      </ArticleParagraph>

      <ArticleSubsectionTitle>RB/WR/TE</ArticleSubsectionTitle>
      <ArticleParagraph>
        Rushing Power: <strong>69</strong> (Even Okoye, who has a listed Rushing Power of 75)
      </ArticleParagraph>

      <ArticleSubsectionTitle>Kick Returners</ArticleSubsectionTitle>
      <ArticleParagraph>
        Receptions: <strong>not used</strong>
      </ArticleParagraph>

      <ArticleSubsectionTitle>Punt Returners</ArticleSubsectionTitle>
      <ArticleParagraph>
        Ball Control: <strong>44</strong>
        <br />
        Receptions: <strong>not used</strong>
      </ArticleParagraph>

      <ArticleSubsectionTitle>OL</ArticleSubsectionTitle>
      <ArticleParagraph>
        Running Speed: <strong>25</strong>
        <br />
        Rushing Power: <strong>69</strong>
      </ArticleParagraph>

      <ArticleSubsectionTitle>DL/LB/C/S</ArticleSubsectionTitle>
      <ArticleParagraph>
        Quickness: <strong>not used</strong>
      </ArticleParagraph>

      <ArticleSubsectionTitle>K</ArticleSubsectionTitle>
      <ArticleParagraph>
        Running Speed: <strong>56</strong>
        <br />
        Rushing Power: <strong>81</strong>
        <br />
        Maximum Speed: <strong>81</strong>
        <br />
        Hitting Power: <strong>31</strong>
      </ArticleParagraph>

      <ArticleSubsectionTitle>P</ArticleSubsectionTitle>
      <ArticleParagraph>
        Running Speed: <strong>25</strong>
        <br />
        Rushing Power: <strong>56</strong>
        <br />
        Maximum Speed: <strong>44</strong>
        <br />
        Hitting Power: <strong>31</strong>
      </ArticleParagraph>

      <ArticleSectionTitle>Step two: Calculate a score for attributes that do matter</ArticleSectionTitle>
      <ArticleParagraph>
        Next, for the attributes that remain, I assign a score based on the highest value for a
        player at that position.
      </ArticleParagraph>
      <ArticleParagraph>
        For example, the highest Maximum Speed for a QB is 56, which belongs to QB Eagles. So he
        scores 100% on that attribute. The highest Pass Control is 81, shared by both Montana and
        QB Bills, who again both get 100%. Since QB Eagles has Pass Control of 69, he receives an
        85% (69/81 * 100) for that attribute.
      </ArticleParagraph>

      <ArticleSectionTitle>Step three: Weight each attribute to determine a total score</ArticleSectionTitle>
      <ArticleParagraph>
        Once each attribute score is calculated, they are averaged to give a final score. However,
        rather than treating all scores as equal, I weight each score based on its importance for
        determining the performance of the player at that position.
      </ArticleParagraph>
      <ArticleParagraph>
        For instance, for rushers, Maximum Speed is by far the most important attribute. For
        receivers, Maximum Speed is most important.
      </ArticleParagraph>
      <ArticleParagraph>
        Below are the weightings of attributes for players at each position.
      </ArticleParagraph>

      <Image
        src="/images/about/ranking-explain.png"
        alt="Example of attribute score weights for a rusher."
        width={603}
        height={281}
        sizes="(max-width: 640px) calc(100vw - 2rem), 603px"
        unoptimized
        className="h-auto w-full max-w-[603px] rounded-sm"
      />
      <ArticleCaption className="mb-6 mt-1">
        When player attributes are shown, the width of the bars corresponds to the weight that
        attribute has in determining the total player score. Above are the attribute scores and
        weightings for a rusher.
      </ArticleCaption>

      <ArticleSubsectionTitle>QB</ArticleSubsectionTitle>
      <ArticleParagraph>
        Maximum Speed: 25%
        <br />
        Passing Speed: 20%
        <br />
        Pass Control: 50%
        <br />
        Avoid Pass Block: 5%
      </ArticleParagraph>

      <ArticleSubsectionTitle>Rushers (all RB, WR, TE receive a rusher rating)</ArticleSubsectionTitle>
      <ArticleParagraph>
        Running Speed: 10%
        <br />
        Maximum Speed: 70%
        <br />
        Hitting Power: 10%
        <br />
        Ball Control: 5%
        <br />
        Receptions: 5%
      </ArticleParagraph>

      <ArticleSubsectionTitle>Receivers (all RB, WR, TE receive a receiver rating)</ArticleSubsectionTitle>
      <ArticleParagraph>
        Running Speed: 10%
        <br />
        Maximum Speed: 30%
        <br />
        Hitting Power: 5%
        <br />
        Ball Control: 5%
        <br />
        Receptions: 50%
      </ArticleParagraph>

      <ArticleSubsectionTitle>
        Kick Returners (all RB, WR, TE receive a kick returner rating)
      </ArticleSubsectionTitle>
      <ArticleParagraph>
        Running Speed: 20%
        <br />
        Maximum Speed: 60%
        <br />
        Hitting Power: 10%
        <br />
        Ball Control: 10%
      </ArticleParagraph>

      <ArticleSubsectionTitle>
        Punt Returners (all RB, WR, TE receive a punt returner rating)
      </ArticleSubsectionTitle>
      <ArticleParagraph>
        Running Speed: 20%
        <br />
        Maximum Speed: 70%
        <br />
        Hitting Power: 10%
      </ArticleParagraph>

      <ArticleSubsectionTitle>OL</ArticleSubsectionTitle>
      <ArticleParagraph>
        Maximum Speed: 50%
        <br />
        Hitting Power: 50%
      </ArticleParagraph>

      <ArticleSubsectionTitle>DL</ArticleSubsectionTitle>
      <ArticleParagraph>
        Running Speed: 10%
        <br />
        Rushing Power: 35%
        <br />
        Maximum Speed: 10%
        <br />
        Hitting Power: 40%
        <br />
        Pass Interceptions: 5%
      </ArticleParagraph>

      <ArticleSubsectionTitle>LB</ArticleSubsectionTitle>
      <ArticleParagraph>
        Running Speed: 10%
        <br />
        Rushing Power: 35%
        <br />
        Maximum Speed: 10%
        <br />
        Hitting Power: 30%
        <br />
        Pass Interceptions: 15%
      </ArticleParagraph>

      <ArticleSubsectionTitle>CB/S</ArticleSubsectionTitle>
      <ArticleParagraph>
        Running Speed: 10%
        <br />
        Rushing Power: 35%
        <br />
        Maximum Speed: 10%
        <br />
        Hitting Power: 5%
        <br />
        Pass Interceptions: 40%
      </ArticleParagraph>

      <ArticleSubsectionTitle>K</ArticleSubsectionTitle>
      <ArticleParagraph>
        Kicking attribute: 70%
        <br />
        Avoid Kick Block: 30%
      </ArticleParagraph>

      <ArticleSubsectionTitle>P</ArticleSubsectionTitle>
      <ArticleParagraph>
        Kicking attribute: 70%
        <br />
        Avoid Kick Block: 30%
      </ArticleParagraph>

      <ArticleSubsectionTitle>A note about hitting power for offensive players</ArticleSubsectionTitle>
      <ArticleParagraph>
        Hitting power only really makes a difference on offensive player performance at about 88.
        To account for this, players with hitting power below that threshold do not have hitting
        power factored into their rating. Players with 75 and 81 hitting power in average
        condition are given partial credit, since they can reach 88 in Good and Excellent
        condition.
      </ArticleParagraph>

      <ArticleSectionTitle>Example: ratings for Jerry Rice and Bo Jackson</ArticleSectionTitle>
      <ArticleParagraph>
        Let&apos;s take a closer look at how this scoring system works for two players: Jerry Rice
        and Bo Jackson.
      </ArticleParagraph>
      <ArticleParagraph>First, here are the attributes and scores for each player.</ArticleParagraph>
      <ArticleParagraph>
        (Reminder: Score = Highest value for any player at that position/player value * 100)
      </ArticleParagraph>

      <ArticleParagraph>
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
      </ArticleParagraph>

      <ArticleParagraph>
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
      </ArticleParagraph>

      <ArticleParagraph>
        As explained above, hitting power below 88 is discarded when determining player rating.
      </ArticleParagraph>
      <ArticleParagraph>Here are the ratings for each player as a receiver:</ArticleParagraph>

      <ArticleParagraph>
        Rice: <strong>89.58%</strong> ((10 * (69.84 / 100)) + (30 * (92 / 100)) + (5 * (0 / 100))
        + (5 * (100 / 100)) + (50 * (100 / 100)))
      </ArticleParagraph>

      <ArticleParagraph>
        Jackson: <strong>52.76%</strong> ((10 * (60.32 / 100)) + (40 * (100 / 100)) + (5 * (0 /
        100)) + (5 * (100 / 100)) + (50 * (23.46 / 100)))
      </ArticleParagraph>

      <ArticleParagraph>
        No surprises here, as Jerry Rice is the best receiver in the game. While Bo Jackson&apos;s
        speed counts for a lot, his poor Receptions hurts him as a receiver.
      </ArticleParagraph>

      <ArticleParagraph>Now here are their rusher ratings:</ArticleParagraph>

      <ArticleParagraph>
        Rice: <strong>81.38%</strong> ((10 * (69.84 / 100)) + (70 * (92 / 100)) + (10 * (13.83 /
        100)) + (5 * (100 / 100)) + (5 * (100 / 100)))
      </ArticleParagraph>

      <ArticleParagraph>
        Jackson: <strong>82.20%</strong> ((10 * (60.32 / 100)) + (70 * (100 / 100)) + (10 * (32.98
        / 100)) + (5 * (100 / 100)) + (5 * (23.46 / 100)))
      </ArticleParagraph>

      <ArticleParagraph>
        Jackson is the best rusher in the game, with Rice a close second.
      </ArticleParagraph>

      <ArticleSectionTitle>Step four: Use rating to assign a ranking</ArticleSectionTitle>
      <ArticleParagraph>
        For each player, I show their rating as well as ranking. The rating shows their actual
        performance at that position compared to every other player, and ranking shows how many
        players are above or below them using the same rating system.
      </ArticleParagraph>
      <ArticleParagraph className="mb-0">
        The rating system isn&apos;t perfect, but it&apos;s a useful tool for ranking players against
        each other and getting a relative sense of their ability.
      </ArticleParagraph>
    </ArticlePage>
  );
}
