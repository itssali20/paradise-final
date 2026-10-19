// Paradise Casting · ladies apply with photos, gentlemen members privately share interest, the team invites up to 100.
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
  { t: "Verified by our team", p: "A coordinator checks every application and your age (18+). Only approved applicants go forward." },
  { t: "Members share their interest", p: "Signed-in gentlemen members privately mark the applicants they would like to meet. Your photos are never public." },
  { t: `${CASTING.shortlist} shortlisted, invitations sent`, p: `The ${CASTING.shortlist} applicants with the most interest are shortlisted and personally contacted. Up to ${CASTING.invited} receive a complimentary invitation, with inclusions confirmed in writing.` },
];

export const CASTING_RULES = [
  "18 or older, with a valid passport or national ID.",
  "Recent photos of you only (last 12 months). Light editing is fine, heavy filters are not.",
  "No nudity. Swimwear photos must show a bikini or swimsuit.",
  "Photos are visible only to our team and signed-in club gentlemen, never published.",
  "You can withdraw at any time and we delete your photos.",
  "Being shortlisted is an invitation, never an obligation. Every connection is based on mutual interest.",
];
