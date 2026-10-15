// Paradise Casting · ladies apply with photos, gentlemen vote, the team invites the top 100.
// Numbers live here so the page, the vote board and the admin ranking always agree.

export const CASTING = {
  invited: 100, // ladies who travel
  shortlist: 120, // chosen by votes; extra 20 cover ladies who can't come
  perSet: 3, // minimum photos per outfit
  maxPerSet: 4,
  voteLimit: 100, // hearts each gentleman can give
  pageSize: 48,
};

export const PHOTO_SETS = [
  { key: "dress", label: "In a dress", short: "Dress", tag: "Dress", hint: "Evening, cocktail or summer dress. Full length and close-up." },
  { key: "sport", label: "In sportswear", short: "Sportswear", tag: "Sport", hint: "Gym, yoga, running or tennis outfit. Natural and active." },
  { key: "bikini", label: "In a bikini", short: "Bikini", tag: "Bikini", hint: "Beach or pool. Swimwear only, no nudity." },
] as const;

export type PhotoSetKey = (typeof PHOTO_SETS)[number]["key"];

export const CASTING_STEPS = [
  { t: "Send your application", p: "Nine recent photos: three in a dress, three in sportswear, three in a bikini. Plus a few lines about you." },
  { t: "Verified by our team", p: "A coordinator checks every application and your age (18+). Only approved ladies go forward." },
  { t: "The gentlemen vote", p: "Club gentlemen privately vote for the ladies they would love to meet. Your photos are never public." },
  { t: "120 chosen, 100 travel", p: "The 120 ladies with the most votes are shortlisted and personally invited. 100 join us in paradise." },
];

export const CASTING_RULES = [
  "18 or older, with a valid passport or national ID.",
  "Recent photos of you only (last 12 months). Light editing is fine, heavy filters are not.",
  "No nudity. Swimwear photos must show a bikini or swimsuit.",
  "Photos are visible only to our team and signed-in club gentlemen, never published.",
  "You can withdraw at any time and we delete your photos.",
];
