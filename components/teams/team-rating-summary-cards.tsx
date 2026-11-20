import type { TeamRatingSummaryItem } from "@/lib/team-rating-utils";

type TeamRatingSummaryCardsProps = {
  items: readonly TeamRatingSummaryItem[];
};

export function TeamRatingSummaryCards({ items }: TeamRatingSummaryCardsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-xl overflow-hidden rounded-lg border border-white/14 bg-white/8 transition-colors duration-150 group-hover:border-(--pink) group-focus-visible:border-(--pink)">
      <div className="grid grid-cols-3 divide-x divide-white/14">
        {items.map((item) => (
          <section
            key={item.key}
            className="grid place-content-center justify-items-center gap-y-2 px-3 py-2 text-center sm:gap-y-2.5 sm:px-4 sm:py-2.5"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-white/62">
              {item.label}
            </p>

            <p className="font-(family-name:--font-tecmo) text-xl leading-none tabular-nums text-white sm:text-2xl">
              #{item.rank}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
