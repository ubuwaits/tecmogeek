type XMention = {
  authorHandle: string;
  authorName: string;
  avatarSrc?: string;
  postedAt: string;
  text: string;
  url: string;
};

const X_MENTIONS: readonly XMention[] = [
  {
    authorHandle: "RealChrisAllen1",
    authorName: "Chris Allen",
    postedAt: "2026-01-04",
    text: "We are truly blessed to have tecmogeek.com. Been using it for years. Truly great work. 👏",
    url: "https://x.com/RealChrisAllen1/status/2007885452234068085?s=20",
  },
  {
    authorHandle: "500Indy1911",
    authorName: "Bryan Friedrich",
    postedAt: "2023-10-01",
    text: "This is the best website I've ever seen! #SuperTecmoBowl",
    url: "https://x.com/500Indy1911/status/1708611898394960138?s=20",
  },
  {
    authorHandle: "Hunter73Joe",
    authorName: "Joe Hunter73",
    postedAt: "2019-10-08",
    text: "I played the heck out this game on NES. I blame it for me getting obsessed with statistics among other things. What a great time-waste site this is.",
    url: "https://x.com/Hunter73Joe/status/1181712055524569089",
  },
  {
    authorHandle: "naclark19",
    authorName: "Nick C",
    postedAt: "2018-10-31",
    text: "This website is amazing!",
    url: "https://x.com/naclark19/status/1057632602973069313?s=20",
  },
  {
    authorHandle: "AthleticCapital",
    authorName: "Dan Adams",
    postedAt: "2018-01-16",
    text: "If you're into Tecmo Super Bowl, this will change your life.",
    url: "https://x.com/AthleticCapital/status/953132875582328832",
  },
  {
    authorHandle: "AaronGleeman",
    authorName: "Aaron Gleeman",
    postedAt: "2017-01-17",
    text: "I discovered tecmogeek.com, which has something resembling sabermetric player rankings for each position. Being an adult is great.",
    url: "https://x.com/AaronGleeman/status/821396519127490560",
  },
  {
    authorHandle: "jeffreytierney",
    authorName: "Jeff Tierney",
    postedAt: "2015-01-08",
    text: "@5150ellis I submit to you, good sir, the holy grail of all information to be found anywhere on the internet:",
    url: "https://x.com/jeffreytierney/status/553252951440228352",
  },
  {
    authorHandle: "timwilson1000",
    authorName: "Tim Wilson",
    postedAt: "2015-01-02",
    text: "Detailed info on all TECMO players!! This is amazing stuff! #bestgameever",
    url: "https://x.com/timwilson1000/status/551072066762326016",
  },
  {
    authorHandle: "TecmoGodfather",
    authorName: "Tecmobowl.org",
    postedAt: "2013-03-09",
    text: "Thanks to @taddeimania for finding new site tecmogeek.com. Great layout and explanation of #TecmoSuperBowl attributes and players.",
    url: "https://x.com/TecmoGodfather/status/310434659509092353",
  },
] as const;

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
            <span className="min-w-0 text-[13px] text-white/90">@{mention.authorHandle}</span>
            <span aria-hidden="true" className="text-[13px] text-white/35">
              •
            </span>
            <time dateTime={mention.postedAt} className="text-[13px] text-white/90">
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
