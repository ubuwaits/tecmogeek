export function SiteFooter() {
  return (
    <footer className="mx-[-1rem] mb-[-1rem] mt-12 border-t border-white/25 bg-black sm:mx-[-2rem] sm:mb-[-2rem] sm:mt-16">
      <section className="px-4 py-3 text-center text-[15px] text-white/65 sm:px-8 sm:py-2 sm:text-[16px]">
        <p>
          A labor of love by{" "}
          <a
            href="https://chad.is"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-[var(--pink)] no-underline"
          >
            Chad Mazzola
          </a>{" "}
          &bull; Also check out{" "}
          <a
            href="https://www.chadwin.co"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-[var(--pink)] no-underline"
          >
            Chadwin
          </a>
        </p>
      </section>
    </footer>
  );
}
