export type XMention = {
  authorHandle: string;
  authorName: string;
  avatarSrc?: string;
  postedAt: string;
  text: string;
  url: string;
};

export const X_MENTIONS: readonly XMention[] = [
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
