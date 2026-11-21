import type { Metadata, ResolvingMetadata } from "next";
import Image from "next/image";

import plays from "@/data/plays.json";
import { pageMetadata } from "@/lib/site/metadata";
import { playsRoute } from "@/lib/site/routes";

export async function generateMetadata(_: PageProps<"/about/plays">, parent: ResolvingMetadata): Promise<Metadata> {
  return pageMetadata(parent, "Offensive Plays", playsRoute);
}

export default function PlaysPage() {
  return (
    <article data-page-theme="text" className="mx-auto mt-4 max-w-fit sm:mt-6">
      <h1 className="font-(family-name:--font-tecmo) text-[23px] uppercase leading-snug sm:text-[36px]">Offensive Plays</h1>
      {Object.entries(plays).map(([slot, names]) => (
        <section key={slot} className="mt-4 pt-2">
          <h2 className="mb-1.5 text-base font-bold">{slot.startsWith("R") ? "Run" : "Pass"} {slot.slice(1)}</h2>
          <ul className="grid grid-cols-4 gap-x-1.5 gap-y-2 sm:grid-cols-8">
            {names.map((name, index) => (
              <li key={name}>
                <figure className="mx-auto w-24 max-w-full xl:w-36 text-left">
                  <Image src={`/images/plays/${slot}-${index}.png`} width={48} height={56} unoptimized
                    alt={`Play diagram for ${name}`} className="block h-auto w-full [image-rendering:pixelated]" />
                  <figcaption className="mt-1 text-[11px] leading-tight font-semibold sm:text-xs">{name}</figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <p className="mt-8 text-sm">
        Play diagrams use <a href="https://sblueman.com/tecmo-super-bowl-editor-pack/" target="_blank" rel="noopener noreferrer" className="underline">TSB Playbook Maker tiles</a> arranged by the <a href="https://github.com/bruddog/Tecmo_Super_Bowl_NES_Disassembly/blob/f3bae0e1913ba532a5ace158d86d905ecf787008/Bank20_playcall.asm#L2109-L2622" target="_blank" rel="noopener noreferrer" className="underline">NES play diagrams</a>.
        {" "}Play names and order from the <a href="https://github.com/bruddog/Tecmo_Super_Bowl_NES_Disassembly/blob/f3bae0e1913ba532a5ace158d86d905ecf787008/Bank15_faces_playbooks.asm#L2740-L2804" target="_blank" rel="noopener noreferrer" className="underline">NES play table</a>.
      </p>
    </article>
  );
}
