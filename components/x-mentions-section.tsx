import { X_MENTIONS, type XMention } from "@/data/x-mentions";

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatDate(postedAt: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(`${postedAt}T00:00:00Z`));
}

function XMentionCard({ mention }: { mention: XMention }) {
  const hasAvatarImage = Boolean(mention.avatarSrc);

  return (
    <a
      href={mention.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-full flex-col rounded-[20px] border border-white/25 bg-[#165ec9] p-4 no-underline transition-colors hover:border-(--pink) focus-visible:border-(--pink) sm:p-5"
    >
      <header className="flex items-center gap-4">
        <div
          className="grid size-12 shrink-0 place-items-center rounded-full border-2 border-white/35 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.25),transparent_58%),linear-gradient(135deg,#ff6bce,#1863d6)] font-(family-name:--font-tecmo) text-[15px] uppercase text-white sm:size-13 sm:text-[16px]"
          style={
            mention.avatarSrc
              ? {
                  backgroundImage: `url(${mention.avatarSrc})`,
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                }
              : undefined
          }
        >
          {!hasAvatarImage ? getInitials(mention.authorName) : null}
        </div>

        <div className="min-w-0">
          <p className="truncate font-(family-name:--font-tecmo) text-[15px] uppercase leading-none text-white">
            {mention.authorName}
          </p>
          <p className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 font-medium leading-none">
            <span className="min-w-0 text-[13px] text-white/65">@{mention.authorHandle}</span>
            <span aria-hidden="true" className="text-[13px] text-white/35">
              •
            </span>
            <time dateTime={mention.postedAt} className="text-[13px] text-white/65">
              {formatDate(mention.postedAt)}
            </time>
          </p>
        </div>
      </header>

      <blockquote className="my-auto pt-3 text-[15px] leading-5.5 text-white sm:text-[16px]">
        {mention.text}
      </blockquote>
    </a>
  );
}

export function XMentionsSection() {
  return (
    <section className="my-28 sm:my-44">
      <header className="mb-8">
        <h2 className="font-(family-name:--font-tecmo) text-[22px] text-center leading-tight uppercase text-white sm:text-[28px]">
          What the fans are saying
        </h2>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {X_MENTIONS.map((mention) => (
          <XMentionCard key={mention.url} mention={mention} />
        ))}
      </div>
    </section>
  );
}
