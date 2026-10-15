# Paradise Club · Elite Vacations

Luxury multi-page website + reservation platform for Paradise Club: a new beachfront resort every month,
100 gentlemen, 100 ladies, seven days / six nights — and ladies always come free.

**Stack:** Next.js 15 (App Router, TypeScript) · GSAP 3 (ScrollTrigger, SplitText, Flip, Draggable) · native scrolling ·
Postgres + Drizzle ORM · Stripe · Resend (email) · Vercel Blob (uploads) · Vercel Cron.

---

## What's inside

### Public website (all GSAP-animated, "Chrome & Tide" design from the logo)
| Page | Highlights |
|---|---|
| `/` Home | Silent cinematic intro (video only → chrome logo rises → headline types in → nav arrives), "Dive in" portal, **…AND WOMEN ALWAYS COME FREE!** giant type with video inside the letters, monthly event passport strip + live countdown, destination wipe slider, pinned experience stack, $40,000 counter + spotlight, 4 room tiers accordion, horizontal evenings, velocity marquees |
| `/events`, `/events/[slug]` | Monthly calendar, live room availability, 4 room tiers with prices, payment-plan timeline, itinerary |
| `/destinations`, `/destinations/[slug]` | 22 destinations, Flip-animated region filter, detail pages with upcoming dates |
| `/rooms`, `/villas` | Luxury Room · Ocean-View Room · Ocean-View Suite · Paradise Villa |
| `/ladies` | Ladies come free, clear "what's covered" table, pageant road, **women's registration** with photo + ID upload |
| `/casting`, `/casting/vote` | **Paradise Casting**: ladies apply with 9 photos (3 dress, 3 sportswear, 3 bikini); signed-in gentlemen vote privately (100 hearts each); admin ranks by votes and shortlists the top 120 (100 travel + 20 reserve). Numbers live in `src/content/casting.ts` |
| `/gentlemen` | Invite her to Paradise, 3 packages, safety |
| `/competitions`, `/competitions/[slug]` | Miss Paradise, Bikini, Lingerie, Talent — rules, judging, entry forms |
| `/experience`, `/activities` | Sticky 7-day itinerary, evenings, activities |
| `/membership`, `/gallery`, `/about`, `/contact` | Members intro, films + masonry gallery with lightbox, 4 options, partner/sponsor forms |
| `/legal/*` | Terms, privacy, cancellation & refunds, contest rules, community standards |

Motion: page transitions (aqua wave), custom cursor, magnetic buttons, water-ripple hover, split-text reveals,
parallax, counters, pinned scenes. Fully respects *prefers-reduced-motion*. Mobile has a sticky Book · Call · WhatsApp bar.

### Reservations (Phase 1)
- Events → room types (price, lady add-on, inventory) → bookings → scheduled payments.
- **Full payment or deposit + instalments** (deposit %, number of instalments, final-payment deadline per event).
- **No double booking:** room is held during checkout; availability is checked inside a database transaction
  that locks the event + room-type rows; physical-room assignment is protected by a unique constraint.
  Proven by `npm run test:race` (12 people buy the last room at once → exactly 1 succeeds).
- 100 gentlemen / 100 ladies capacity enforced.
- Stripe Checkout saves the card for instalments; a daily cron charges due instalments, sends 7-day reminders,
  retries failures and alerts the admin. Guests can "Pay now" from their account.
- Cancellations & refunds via tiered policy (per event), refunds pushed to Stripe automatically.
- Activities (scuba, jet ski, parasailing, excursions…) bookable per event from the guest account.

### Members (Phase 2)
Registration (18+), profiles with photos/video, admin approval & ID verification, browse members going to the
same event, **consent-based introductions**, private messaging (live polling), block & report.

### Admin dashboard `/admin`
KPIs (collected, scheduled balances, failed payments, occupancy, gender balance) · create/edit events ·
**duplicate an event to next month** · room types, prices, inventory · physical rooms · activities ·
bookings with payment schedule, charge now, mark paid (wire/cash), cancel & refund · **drag-and-drop room
assignment board** · manual & complimentary bookings (ladies) · applications inbox (ladies, competitions,
partners, sponsors) · member moderation & reports · subscribers · CSV exports · audit log.

### Phase 3 groundwork
Installable web app (manifest + icons), newsletter capture, automated transactional & reminder emails.

---

## Run locally
```bash
npm install
cp .env.example .env          # then edit values
npm run db:local              # starts a local Postgres on :5433 (keep this terminal open)
#   DATABASE_URL="postgresql://postgres:postgres@localhost:5433/paradise"
npm run db:migrate            # create tables
npm run db:seed               # admin account + 12-month calendar with 4 room tiers + activities
npm run dev                   # http://localhost:3000   (admin: /admin)
```
Without `DATABASE_URL` the site still runs in **showcase mode** (all pages, sample calendar; booking shows "call us").

## Deploy to Vercel (bookings + admin need a database)
Without a database the site runs in **showcase mode**: every page works, but "Reserve" shows a call-us /
register-interest message, and accounts and `/admin` are unavailable. To switch everything on:

1. Push this folder to GitHub → **vercel.com/new** → import (framework: Next.js).
2. **Database:** Vercel project → *Storage* → *Create* → **Neon (Postgres)** → connect to the project
   (this sets `DATABASE_URL` automatically).
3. **Environment variables** (Settings → Environment Variables), at minimum:
   - `AUTH_SECRET` – any long random string
   - `NEXT_PUBLIC_SITE_URL` – e.g. `https://your-domain.com`
   - `ADMIN_EMAIL` + `ADMIN_PASSWORD` – your admin login
4. **Redeploy.** The build automatically creates the tables, your admin account and the 12-month event
   calendar (only when the database is empty — it never overwrites real events).
5. **Admin panel:** open `https://your-domain.com/admin` (or "Team login" in the footer) and sign in with
   `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
6. Optional but recommended:
   - **Payments:** `STRIPE_SECRET_KEY`, then Stripe → Developers → Webhooks → endpoint
     `https://YOUR-DOMAIN/api/stripe/webhook` with events `checkout.session.completed`,
     `checkout.session.async_payment_succeeded`, `checkout.session.expired`, `payment_intent.succeeded`,
     `payment_intent.payment_failed` → copy the signing secret to `STRIPE_WEBHOOK_SECRET`.
   - **Email:** `RESEND_API_KEY`, `EMAIL_FROM`, `ADMIN_NOTIFY_EMAIL`.
   - **Uploads** (profile photos, ID files): Storage → **Blob** → connect (sets `BLOB_READ_WRITE_TOKEN`).
   - `CRON_SECRET` – protects the daily payment job (crons are in `vercel.json`, Hobby-plan friendly).

Guests reserve at **Events → choose a month → Select a room**. They sign in or create an account first
(one minute), then go straight back to their reservation.

**Payment modes:** with `STRIPE_SECRET_KEY` → real payments. Without it → rooms are *held 48 h* and the team is
emailed to complete payment by phone. `PAYMENTS_DEMO=1` simulates success (previews only).

## Media
All client photos/videos are optimised in `public/media` (WebP, compressed MP4s; hero 3.2 MB desktop / 1.7 MB mobile).
Some stock photos (Unsplash) and mood clips (Mixkit, free licences) load from their CDNs. To serve **everything
from your own domain**, run once on your computer and commit the result:
```bash
npm run media:pull
```
Logo sources are in `brand-source/` (cleaned transparent PNG).

## Monthly workflow for the team
1. Admin → Events → open last month's event → **Duplicate → next month**.
2. Edit destination, resort, dates, prices and inventory → status **PUBLISHED**.
3. Admin → Casting & votes: approve new casting applications (they then appear on the gentlemen's voting board),
   then **Shortlist top 120** when voting closes.
4. Approve ladies' applications → *Approve & create complimentary booking*.
5. Two weeks before arrival: Guests & room assignment → drag guests into rooms → Export guest list (CSV) for the hotel.

## Before launch — business checks
- Have a lawyer review `/legal/*`, contest rules/prizes, international-introduction rules and seller-of-travel registration.
- Stripe reviews dating/travel businesses — apply early and describe the business accurately; never charge contest entry fees.
- Confirm what "ladies come free" covers per event; confirm photo/model releases for all imagery.
