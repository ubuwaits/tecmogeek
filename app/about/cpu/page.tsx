import type { Metadata, ResolvingMetadata } from "next";

import { ArticlePage } from "@/components/layout/article-page";
import { pageMetadata } from "@/lib/site/metadata";
import { cpuRoute } from "@/lib/site/routes";

const source = "https://github.com/bruddog/Tecmo_Super_Bowl_NES_Disassembly/blob/f3bae0e1913ba532a5ace158d86d905ecf787008";
const playCaller = "Bank12_13_sim_update_stats.asm";
const field = "Bank21_22_play_commands_on_field_logic.asm";

function Source({ file = playCaller, lines, children }: { file?: string; lines: string; children: string }) {
  return <a href={source + "/" + file + "#" + lines} target="_blank" rel="noopener noreferrer">{children}</a>;
}

function Odds({ headings, rows }: { headings: string[]; rows: string[][] }) {
  return (
    <table>
      <thead><tr>{headings.map(heading => <th scope="col" key={heading}>{heading}</th>)}</tr></thead>
      <tbody>
        {rows.map(([label, ...cells]) => (
          <tr key={JSON.stringify([label, ...cells])}>
            <th scope="row">{label}</th>
            {cells.map((cell, index) => <td key={index}>{cell}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export async function generateMetadata(_: PageProps<"/about/cpu">, parent: ResolvingMetadata): Promise<Metadata> {
  return pageMetadata(parent, "How the CPU plays", cpuRoute);
}

export default function CpuPage() {
  return (
    <ArticlePage>
      <article className="prose prose-invert max-w-none text-white">
        <h1 className="font-(family-name:--font-tecmo) text-[23px] leading-snug uppercase text-balance sm:text-[36px] sm:leading-10">
          How the CPU plays
        </h1>

        <h2>How often each offense calls a run or a pass</h2>
        <p>Each team has a default chance to call a run or a pass when the CPU controls its offense.</p>
        <Odds headings={["Teams", "Run", "Pass"]} rows={[
          ["Chiefs, Raiders, Giants", "59.77%", "40.23%"],
          ["Colts, Dolphins, Patriots, Lions, 49ers, Rams, Falcons", "40.23%", "59.77%"],
          ["Browns, Oilers, Packers", "30.08%", "69.92%"],
          ["Bills, Jets, Bengals, Steelers, Broncos, Chargers, Seahawks, Washington, Eagles, Cardinals, Cowboys, Bears, Vikings, Buccaneers, Saints", "50%", "50%"],
        ]} />
        <p>
          Between the two 5s, the CPU uses its team’s mix on first down and on second down with more than one yard to go. On second-and-one or shorter
          it runs 80.1% of the time and passes 19.9%.{" "}
          <Source lines="L3674-L3713">Down and distance</Source> · <Source lines="L4123-L4153">Short-yardage odds</Source>
        </p>
        <p>
          Under 2:00 in the fourth quarter or overtime, any call that would use team style instead uses the score.
          A lead means 59.77% run and 40.23% pass. A tie or deficit means 30.08% run and 69.92% pass.
          This also applies on fourth down when the CPU goes for it and the distance sends it to the team-style rule.{" "}
          <Source file="Bank20_playcall.asm" lines="L2096-L2104">Team styles</Source> · <Source file="Bank31_fixed_bank.asm" lines="L5351-L5383">Team order</Source> · <Source lines="L4159-L4278">Play odds and late-game override</Source>
        </p>

        <p>
          On-screen games and season Skip mode use the same play caller. The percentages here are its programmed odds, rounded for display.{" "}
          <Source file="Bank20_playcall.asm" lines="L209-L219">On-screen call</Source> · <Source file="Bank31_fixed_bank.asm" lines="L935-L938">Shared routine</Source> · <Source lines="L785-L815">Skip-mode calls</Source>
        </p>

        <h3>Third down between the two 5-yard lines</h3>
        <table>
          <thead><tr><th scope="col">Yards to go</th><th scope="col">CPU offense</th></tr></thead>
          <tbody>
            <tr><th scope="row">3 or fewer</th><td>80.1% run</td></tr>
            <tr><th scope="row">More than 3 through 7</th><td>Uses the team’s style or late-game mix</td></tr>
            <tr><th scope="row">More than 7</th><td>80.1% pass</td></tr>
          </tbody>
        </table>
        <p>
          <Source lines="L3674-L3713">Offensive calls</Source> · <Source lines="L4092-L4153">Run and pass odds</Source>
        </p>

        <h3>At either 5-yard line or closer</h3>
        <p>
          On first, second, and third down, the same field-position rules apply whenever the CPU runs an offensive play:
        </p>
        <ul>
          <li><strong>Backed up at its own 5 or closer:</strong> the CPU calls a run 80.1% of the time,
            even on third-and-ten.</li>
          <li><strong>Going in from the opponent’s 5 to just outside the 3:</strong> the CPU also runs 80.1% of the time.</li>
          <li><strong>At the opponent’s 3 or closer:</strong> the CPU calls the fourth run in its playbook 50.05% of the time. Each of the other three runs gets 10.01%, and each of the four passes gets 4.98%.</li>
        </ul>
        <p>
          <Source lines="L3685-L3713">Field-position rules</Source> · <Source lines="L4123-L4153">Run odds</Source> · <Source lines="L4050-L4089">Goal-line play selection</Source>
        </p>

        <h2>How often the defense expects a run or a pass</h2>
        <p>For a play from scrimmage, the CPU uses the same defensive odds anywhere on the field.</p>
        <table>
          <thead><tr><th scope="col">Situation</th><th scope="col">Defend a run</th><th scope="col">Defend a pass</th></tr></thead>
          <tbody>
            <tr><th scope="row">First or second down, any distance</th><td>50%</td><td>50%</td></tr>
            <tr><th scope="row">Third or fourth down, 3 yards or fewer</th><td>80.1%</td><td>19.9%</td></tr>
            <tr><th scope="row">Third or fourth down, more than 3 yards</th><td>50%</td><td>50%</td></tr>
          </tbody>
        </table>
        <p>On an even guess, each of the eight plays gets 12.5%. On third- or fourth-and-short, each run gets 20.02% and each pass gets 4.98%.
          The game has a rule that favors pass defense on third- or fourth-and-long, but it reads the yards to go incorrectly and never uses that rule.{" "}
          <Source lines="L4342-L4372">Defensive calls by down and distance</Source> · <Source lines="L4123-L4153">Short-yardage odds</Source></p>

        <h2>When to expect an onside kick</h2>
        <p>
          <strong>The CPU sometimes tries an onside kick because it thinks it’s losing by more points than it really is.</strong>
          {" "}It knows which team is winning. The mistake happens when the tens digits of the scores differ.
          For each point of difference between those digits, the CPU adds 6 to the real deficit.
          If the digits match, the margin is correct. If they differ by 1, it adds 6 points. If they differ by 2, it adds 12.
        </p>
        <p>
          “CPU deficit” is how far behind the computer thinks it is. At 17–10, both scores have a 1 in the tens
          place, so the CPU gets the gap right: 7 points. At 20–13, the CPU mistakenly treats each ten as 16 points.
          It reads 20 as 32 (16 + 16) and 13 as 19 (16 + 3). It subtracts 19 from 32 and gets a 13-point deficit.
          The real deficit is 7.{" "}
          <Source file="Bank19_20_on_field_gameplay_loop.asm" lines="L2641-L2672">Score storage</Source> · <Source lines="L3047-L3078">Skip-mode scores</Source> · <Source lines="L4420-L4442">Score subtraction</Source>
        </p>
        <Odds headings={["Kickoff situation", "Onside chance"]} rows={[
          ["First, second, or third quarter", "0%"],
          ["Fourth quarter, tied or ahead", "0%"],
          ["Fourth quarter, 2:00 or more left, CPU deficit 1–7", "0%"],
          ["Fourth quarter, 2:00 or more left, CPU deficit 8+", "75%"],
          ["Fourth quarter, under 2:00, behind by any score", "100%"],
          ["Overtime, 2:00 or more left", "0%"],
          ["Overtime, under 2:00, if a kickoff occurs", "75%"],
        ]} />
        <p>
          A score ordinarily ends sudden-death overtime.
          In Skip mode, a team that tries an onside kick has a 50% chance to recover it.{" "}
          <Source lines="L4383-L4445">Kickoff decisions</Source> · <Source lines="L2082-L2096">Skip-mode recovery</Source> · <Source lines="L2731-L2747">Sudden death</Source>
        </p>

        <h2>Fourth down: punt, kick, or go for it?</h2>
        <h3>On the CPU’s side of the 50-yard line</h3>
        <Odds headings={["Situation", "Own 49 or farther back", "Past own 49, short of the 50"]} rows={[
          ["First three quarters or overtime", "Punt", "Punt"],
          ["Fourth quarter, 2:00 or more left, leading, tied, or CPU deficit under 10", "Punt", "Punt"],
          ["Fourth quarter, 3:00 or more left, CPU deficit 10+", "Go", "50% kick, 50% go"],
          ["Fourth quarter, 2:00–2:59 left, CPU deficit 10+", "Go", "Go"],
          ["Fourth quarter, under 2:00, leading", "Punt", "Punt"],
          ["Fourth quarter, under 2:00, tied or behind", "Go", "50% kick, 50% go"],
        ]} />
        <p>
          <Source lines="L3719-L3773">When the CPU skips the punt</Source> · <Source lines="L3954-L3984">Long field-goal decision</Source> · <Source lines="L3519-L3545">Yard-line comparison</Source>
        </p>

        <h3>From the 50-yard line through the opponent’s 41</h3>
        <Odds headings={["Situation", "5 yards or fewer to go", "More than 5 to go"]} rows={[
          ["First or third quarter, or second quarter with 2:00 or more left", "50% punt, 25% kick, 25% go", "Punt"],
          ["Second quarter or overtime, under 2:00", "Kick", "Kick"],
          ["Overtime, 2:00 or more left", "50% punt, 25% kick, 25% go", "50% punt, 25% kick, 25% go"],
          ["Fourth quarter, 2:00 or more left, leading, tied, or CPU deficit under 10", "50% punt, 25% kick, 25% go", "Punt"],
          ["Fourth quarter, 2:00 or more left, CPU deficit 10+", "50% kick, 50% go", "50% kick, 50% go"],
          ["Fourth quarter, under 2:00, leading", "50% punt, 50% go", "Punt"],
          ["Fourth quarter, under 2:00, tied or CPU deficit 1–3", "Kick", "Kick"],
          ["Fourth quarter, under 2:00, CPU deficit 4+", "Go", "Go"],
        ]} />
        <p>
          A single call means 100%. Losing 10–7 counts as a CPU deficit of nine. Losing 17–14 counts as three.{" "}
          <Source lines="L3685-L3694">41-yard cutoff</Source> · <Source lines="L3719-L3797">Punt odds</Source> · <Source lines="L3903-L3952">Clock and score</Source> · <Source lines="L3977-L3984">Kick or go</Source>
        </p>

        <h3>Closer than the opponent’s 41</h3>
        <Odds headings={["Situation", "Yards to go", "CPU call"]} rows={[
          ["Fourth quarter, CPU deficit 4+, under 2:00", "Any", "Go"],
          ["Fourth quarter, CPU deficit 4+, 2:00 or more left", "2 or fewer", "Go"],
          ["Fourth quarter, CPU deficit 4+, 2:00 or more left", "More than 2", "50% kick, 50% go"],
          ["All other situations", "1 or fewer", "50% kick, 50% go if tied or behind at the opponent’s 20 or closer. Otherwise kick."],
          ["All other situations", "More than 1 but less than 2", "50% kick, 50% go if the CPU deficit is 17 or more. Otherwise kick."],
          ["All other situations", "2 or more", "Kick"],
        ]} />
        <p>
          On a guaranteed go, the CPU uses its goal-line plays at the opponent’s 5 or closer and its third-down
          distance rules farther out. When a 50/50 decision comes up go, it uses the distance rules anywhere.{" "}
          <Source lines="L3799-L3845">Fourth-quarter calls</Source> · <Source lines="L3851-L3897">Distance and score rules</Source> · <Source lines="L3977-L3984">Play after a 50/50 decision</Source>
        </p>

        <h2>Field goals before fourth down</h2>
        <p>
          The late-kick window starts at <strong>0:29 on screen</strong>
          {" "}and <strong>0:47 in season Skip mode</strong>. Both modes use the same instruction, but they store
          seconds differently.{" "}
          <Source lines="L3662-L3672">Range</Source> · <Source lines="L3990-L4043">Kick decision</Source> · <Source file="Bank17_18_main_game_loop.asm" lines="L5997-L6015">On-screen clock</Source> · <Source lines="L2690-L2729">Skip-mode clock</Source>
        </p>
        <Odds headings={["Period", "When the CPU attempts a field goal on downs 1–3"]} rows={[
          ["First or third quarter", "Never."],
          ["Second quarter", "At the opponent’s 40 or closer during the late-kick window, at any score."],
          ["Fourth quarter", "Same range and clock, if tied or the CPU deficit is 1–3."],
          ["Overtime", "At the opponent’s 20 or closer at any time. During the late-kick window, the range extends to the opponent’s 40."],
        ]} />
        <p><Source lines="L3589-L3603">Quarter selection</Source> · <Source lines="L3990-L4043">Clock and score rules</Source></p>

        <h2>Who calls timeout?</h2>
        <p>Timeout odds apply at each play call while the clock is running and the team has a timeout left.</p>
        <Odds headings={["Time left", "CPU offense", "CPU defense"]} rows={[
          ["First or third quarter", "0%", "0%"],
          ["Second quarter, 2:00 or more", "0%", "0%"],
          ["Second quarter, under 2:00", "75% at any score", "0%"],
          ["Fourth quarter or overtime, 3:00 or more", "0%", "0%"],
          ["Fourth quarter or overtime, 2:59–2:00", "75% if tied or behind, otherwise 0%", "75% if behind, otherwise 0%"],
          ["Fourth quarter or overtime, under 2:00", "93.75% if tied or behind, otherwise 0%", "93.75% if behind, otherwise 0%"],
        ]} />
        <p>
          <Source lines="L3589-L3656">Offensive timeouts</Source> · <Source lines="L4285-L4336">Defensive timeouts</Source> · <Source lines="L2731-L2747">Sudden death</Source>
        </p>

        <h2>How the CPU steers the ball carrier</h2>
        <p>
          In an on-screen game, the runner turns toward the side with fewer defenders ahead of him.
          If two nearby defenders are ahead on his left and one is ahead on his right, he cuts right.
          He ignores defenders behind him. If both sides are even or nobody is in his way, he angles toward
          the middle of the field.{" "}
          <Source file={field} lines="L3005-L3044">Defender count</Source> · <Source file={field} lines="L2849-L2922">Running right</Source> · <Source file={field} lines="L2930-L2995">Running left</Source>
        </p>
        <p>
          Within roughly half a yard of either sideline, he runs straight upfield regardless of where the defenders are.{" "}
          <Source file={field} lines="L3047-L3059">Sideline cutoff</Source>
        </p>
      </article>
    </ArticlePage>
  );
}
