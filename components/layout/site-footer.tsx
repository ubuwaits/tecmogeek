export function SiteFooter() {
  return (
    <footer className="-mx-4 -mb-4 mt-12 border-t border-white/25 bg-[#165ec9] sm:-mx-8 sm:-mb-8 sm:mt-16">
      <section className="flex items-center px-4 py-4 text-[14px] text-white/65 sm:px-8 sm:py-8 sm:text-[16px]">
        <p>
          A labor of love by{" "}
          <a
            href="https://www.chad.is"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-(--pink) no-underline"
          >
            Chad Mazzola
          </a>
        </p>
      </section>
    </footer>
  );
}
