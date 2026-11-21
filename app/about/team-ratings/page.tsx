import type { Metadata, ResolvingMetadata } from "next";

import { ArticlePage } from "@/components/layout/article-page";
import { pageMetadata } from "@/lib/site/metadata";
import { aboutTeamRatingsRoute, teamsRoute } from "@/lib/site/routes";

export async function generateMetadata(
  _: PageProps<"/about/team-ratings">,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  return pageMetadata(parent, "How team ratings are calculated", aboutTeamRatingsRoute);
}

export default function TeamRatingsPage() {
  return (
    <ArticlePage>
      <article className="prose prose-neutral max-w-none prose-a:no-underline prose-a:text-(--blue) prose-headings:text-[#3a3a3a] prose-strong:text-[#3a3a3a]">
        <h1 className="mb-0 font-(family-name:--font-tecmo) text-[23px] leading-snug uppercase text-balance sm:text-[36px] sm:leading-10">
          How team ratings are calculated
        </h1>

        <section data-testid="ratings-content-team">
          <h2>What team ratings measure</h2>
          <p>
            Team ratings start with the player ratings, which are then rolled up into offensive, defensive, and overall team ratings. The goal is to model the strongest possible lineup for a given team.
          </p>
          <p>
            The <a href={teamsRoute} target="_blank" rel="noopener noreferrer">Team Ratings page</a> shows the final overall score, including offensive and defensive sub-ratings.
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
    </ArticlePage>
  );
}
