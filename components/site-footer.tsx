import Image from "next/image";

export function SiteFooter() {
  return (
    <footer className="-mx-4 -mb-4 mt-12 border-t border-white/25 bg-[#165ec9] sm:-mx-8 sm:-mb-8 sm:mt-16">
      <section className="flex flex-col items-center justify-between gap-4 px-4 py-4 text-[14px] text-white/65 sm:px-8 sm:py-8 sm:text-[16px] md:flex-row">
        <p>
          A labor of love by{" "}
          <a
            href="https://chad.is"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-(--pink) no-underline"
          >
            Chad Mazzola
          </a>.
        </p>
        <a
          href="https://www.chadwin.co"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-3 rounded-xl border border-white/12 bg-[#0a0a0a] px-4 py-3 text-[#fafafa] no-underline transition-[background-color,border-color] duration-150 ease-out hover:border-white/25 hover:bg-[#171717] focus-visible:border-white/25 focus-visible:bg-[#171717] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff3b00]"
        >
          <Image
            src="/chadwin-icon-logo.png"
            alt=""
            width={32}
            height={32}
            unoptimized
            className="size-8 shrink-0"
          />
          <span className="flex flex-col text-left leading-tight">
            <span className="font-medium text-[#fafafa]">Chadwin</span>
            <span className="text-[12px] text-[#a3a3a3] sm:text-[14px]">
              Financial data for apps and agents
            </span>
          </span>
        </a>
      </section>
    </footer>
  );
}
