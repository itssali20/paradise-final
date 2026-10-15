// The monthly calendar used for the showcase (before a database is connected) and by `npm run db:seed`.
// Resort names stay "announced to applicants" until each hotel contract is signed.
import { ROOM_TIERS } from "./program";
import { getDestination } from "./destinations";

export type SampleEvent = {
  slug: string;
  title: string;
  destinationSlug: string;
  resortName: string;
  resortSummary: string;
  location: string;
  heroImage: string;
  startDate: Date;
  endDate: Date;
  status: "PUBLISHED";
  roomTypes: {
    name: string; tier: number; description: string; image: string; features: string[];
    priceCents: number; companionCents: number; maxGuests: number; inventory: number; sortOrder: number;
  }[];
};

const PLAN: [string, string][] = [
  ["cancun", "Riviera Maya beachfront resort"],
  ["bahamas", "Paradise Island resort"],
  ["jamaica", "Montego Bay beachfront resort"],
  ["dominican-republic", "Punta Cana beachfront resort"],
  ["puerto-vallarta", "Riviera Nayarit resort"],
  ["malaga", "Costa del Sol beach resort"],
  ["ibiza", "Ibiza clifftop resort"],
  ["amalfi-coast", "Amalfi cliffside hotel"],
  ["greek-islands", "Mykonos beachfront resort"],
  ["croatia", "Hvar island resort"],
  ["bora-bora", "Bora Bora lagoon resort"],
  ["maldives", "Maldives overwater resort"],
];

const INVENTORY = [40, 30, 20, 6];

/** Second Saturday of the month, 7 days / 6 nights. */
function eventDates(year: number, month: number) {
  const first = new Date(Date.UTC(year, month, 1, 15));
  const firstSat = 1 + ((6 - first.getUTCDay() + 7) % 7);
  const start = new Date(Date.UTC(year, month, firstSat + 7, 15));
  const end = new Date(start.getTime() + 6 * 86400000);
  return { start, end };
}

export function sampleEvents(from = new Date()): SampleEvent[] {
  let y = from.getUTCFullYear();
  let m = from.getUTCMonth() + 2; // first event ~6–8 weeks out
  return PLAN.map(([slug, resort]) => {
    while (m > 11) { m -= 12; y += 1; }
    const { start, end } = eventDates(y, m);
    m += 1;
    const d = getDestination(slug)!;
    const monthName = start.toLocaleString("en-US", { month: "long", timeZone: "UTC" });
    return {
      slug: `${slug}-${start.getUTCFullYear()}-${String(start.getUTCMonth() + 1).padStart(2, "0")}`,
      title: `Paradise ${d.name.split(" · ")[0]} · ${monthName} ${start.getUTCFullYear()}`,
      destinationSlug: slug,
      resortName: `${resort} · announced to applicants`,
      resortSummary:
        "A four- or five-star beachfront property reserved for Paradise Club guests. The hotel name is shared with confirmed applicants once the contract is signed.",
      location: d.area,
      heroImage: d.image,
      startDate: start,
      endDate: end,
      status: "PUBLISHED",
      roomTypes: ROOM_TIERS.map((t, i) => ({
        name: t.name, tier: t.tier, description: t.description, image: t.image, features: t.features,
        priceCents: t.priceCents, companionCents: t.companionCents, maxGuests: t.maxGuests,
        inventory: INVENTORY[i], sortOrder: i,
      })),
    };
  });
}
