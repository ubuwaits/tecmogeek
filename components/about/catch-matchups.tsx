"use client";

import { useId, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { catchChance } from "@/lib/players/catch-chance";

type Player = { name: string; position: string; skill: number };
type Team = { name: string; slug: string; quarterbacks: Player[]; receivers: Player[]; defenders: Player[] };

function Picker({ label, value, options, onChange, className = "" }: {
  label: string; value: string; options: { value: string; label: string }[]; onChange: (value: string) => void; className?: string;
}) {
  const id = useId();
  return (
    <div className={`min-w-0 ${className}`}>
      <label htmlFor={id} className="text-sm font-semibold">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className="mt-1 w-full border-neutral-300 bg-white focus-visible:ring-blue-500">
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper" className="border-neutral-300 bg-white text-neutral-900">
          {options.map(option => (
            <SelectItem key={option.value} value={option.value} className="focus:bg-blue-50">
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function playerOptions(players: Player[]) {
  return players.map(player => ({ value: player.position, label: player.name + " · " + player.position }));
}

const lowColor = "#f5faff";
const highColor = "#589ad5";

function ChanceCell({ chance, className = "" }: { chance: number; className?: string }) {
  return (
    <td
      className={`border-b border-neutral-200 px-2 py-2.5 text-center text-slate-950 tabular-nums ${className}`}
      style={{ backgroundColor: `color-mix(in srgb, ${highColor} ${chance}%, ${lowColor})` }}
    >
      {chance.toFixed(1)}%
    </td>
  );
}

export function CatchMatchups({ teams }: { teams: Team[] }) {
  const [offenseSlug, setOffense] = useState("49ers");
  const [defenseSlug, setDefense] = useState("bills");
  const [qbPosition, setQb] = useState("QB1");
  const [defenderPosition, setDefender] = useState("RCB");
  const offense = teams.find(team => team.slug === offenseSlug)!;
  const defense = teams.find(team => team.slug === defenseSlug)!;
  const qb = offense.quarterbacks.find(player => player.position === qbPosition)!;
  const teamOptions = teams.map(team => ({ label: team.name, value: team.slug })).sort((a, b) => a.label.localeCompare(b.label));
  const header = "border-b border-neutral-300 px-2 py-3 align-bottom";
  const visibility = (position: string) => position === defenderPosition ? "" : "hidden lg:table-cell";

  return (
    <>
      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:max-w-4xl lg:grid-cols-3">
        <Picker label="Offense" value={offenseSlug} options={teamOptions} onChange={setOffense} />
        <Picker label="Quarterback" value={qbPosition} options={playerOptions(offense.quarterbacks)} onChange={setQb} />
        <Picker label="Defense" value={defenseSlug} options={teamOptions} onChange={setDefense} />
        <Picker label="Defender" value={defenderPosition} options={playerOptions(defense.defenders)} onChange={setDefender} className="lg:hidden" />
      </div>
      <div className="mb-2 flex items-center gap-2 text-xs text-neutral-700">
        <span>Catch chance</span>
        <span>0%</span>
        <span aria-hidden="true" className="h-2 w-24 rounded-sm" style={{ background: `linear-gradient(to right in srgb, ${lowColor}, ${highColor})` }} />
        <span>100%</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">{qb.name} throwing against the {defense.name}</caption>
          <thead className="bg-neutral-100">
            <tr>
              <th scope="col" className={header + " sticky left-0 bg-neutral-100 text-left"}>Receiver</th>
              <th scope="col" className={header}>Open</th>
              {defense.defenders.map(player => (
                <th scope="col" key={player.position} className={header + " " + visibility(player.position)}>
                  {player.name}<span className="block text-xs font-normal text-neutral-600">{player.position}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {offense.receivers.map(receiver => (
              <tr key={receiver.position} className="hover:bg-neutral-50">
                <th scope="row" className="sticky left-0 border-b border-neutral-200 bg-white px-2 py-2 text-left">
                  {receiver.name}<span className="block text-xs font-normal text-neutral-600">{receiver.position}</span>
                </th>
                <ChanceCell chance={catchChance(qb.skill, receiver.skill)} />
                {defense.defenders.map(player => (
                  <ChanceCell
                    key={player.position}
                    className={visibility(player.position)}
                    chance={catchChance(qb.skill, receiver.skill, player.skill)}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
