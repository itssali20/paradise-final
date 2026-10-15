// Paradise Club · data model (Drizzle ORM / Postgres)
// Events (one resort per month) → room types (inventory + prices) → bookings → scheduled payments.
import {
  pgTable, pgEnum, text, integer, boolean, timestamp, jsonb, primaryKey, uniqueIndex, index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

const id = () => text("id").primaryKey().$defaultFn(() => crypto.randomUUID());
const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date());

export const roleEnum = pgEnum("role", ["MEMBER", "ADMIN"]);
export const genderEnum = pgEnum("gender", ["GENTLEMAN", "LADY"]);
export const profileStatusEnum = pgEnum("profile_status", ["PENDING", "APPROVED", "REJECTED"]);
export const introStatusEnum = pgEnum("intro_status", ["PENDING", "ACCEPTED", "DECLINED"]);
export const reportStatusEnum = pgEnum("report_status", ["OPEN", "RESOLVED", "DISMISSED"]);
export const eventStatusEnum = pgEnum("event_status", ["DRAFT", "PUBLISHED", "SOLD_OUT", "CLOSED", "CANCELLED"]);
export const depositTypeEnum = pgEnum("deposit_type", ["PERCENT", "FIXED"]);
export const bookingStatusEnum = pgEnum("booking_status", [
  "HOLD", "PENDING_PAYMENT", "DEPOSIT_PAID", "PAID", "CANCELLED", "EXPIRED",
]);
export const packageEnum = pgEnum("package_type", ["GENTLEMAN", "GENTLEMAN_LADY", "VILLA", "LADY_COMPLIMENTARY"]);
export const planEnum = pgEnum("payment_plan", ["FULL", "DEPOSIT"]);
export const paymentKindEnum = pgEnum("payment_kind", ["FULL", "DEPOSIT", "INSTALLMENT", "ACTIVITY"]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "SCHEDULED", "PENDING", "PAID", "FAILED", "CANCELLED", "REFUNDED", "PARTIALLY_REFUNDED",
]);
export const activityBookingStatusEnum = pgEnum("activity_booking_status", ["PENDING", "PAID", "CANCELLED"]);
export const applicationTypeEnum = pgEnum("application_type", [
  "LADY", "COMPETITION", "PARTNER", "SPONSOR", "GENERAL", "MEMBER",
]);
export const applicationStatusEnum = pgEnum("application_status", ["NEW", "REVIEWING", "APPROVED", "REJECTED"]);
export const castingStatusEnum = pgEnum("casting_status", ["PENDING", "APPROVED", "REJECTED", "CHOSEN"]);

// ─────────────────────────── People ───────────────────────────
export const users = pgTable("users", {
  id: id(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: roleEnum("role").notNull().default("MEMBER"),
  gender: genderEnum("gender"),
  country: text("country"),
  phone: text("phone"),
  birthDate: timestamp("birth_date", { withTimezone: true }),
  suspended: boolean("suspended").notNull().default(false),
  createdAt: createdAt(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: id(),
  tokenHash: text("token_hash").notNull().unique(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
});

export const profiles = pgTable("profiles", {
  id: id(),
  userId: text("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  displayName: text("display_name").notNull(),
  headline: text("headline"),
  bio: text("bio"),
  city: text("city"),
  occupation: text("occupation"),
  languages: text("languages"),
  interests: text("interests").array().notNull().default([]),
  photos: text("photos").array().notNull().default([]),
  videoUrl: text("video_url"),
  visible: boolean("visible").notNull().default(true),
  status: profileStatusEnum("status").notNull().default("PENDING"),
  verified: boolean("verified").notNull().default(false),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const introductions = pgTable(
  "introductions",
  {
    id: id(),
    fromId: text("from_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    toId: text("to_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    note: text("note"),
    status: introStatusEnum("status").notNull().default("PENDING"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("intro_pair").on(t.fromId, t.toId)],
);

export const conversations = pgTable(
  "conversations",
  {
    id: id(),
    aId: text("a_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    bId: text("b_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("conv_pair").on(t.aId, t.bId)],
);

export const messages = pgTable(
  "messages",
  {
    id: id(),
    conversationId: text("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
    senderId: text("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    createdAt: createdAt(),
    readAt: timestamp("read_at", { withTimezone: true }),
  },
  (t) => [index("msg_conv_time").on(t.conversationId, t.createdAt)],
);

export const blocks = pgTable(
  "blocks",
  {
    blockerId: text("blocker_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    blockedId: text("blocked_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.blockerId, t.blockedId] })],
);

export const reports = pgTable("reports", {
  id: id(),
  reporterId: text("reporter_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  reportedId: text("reported_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  reason: text("reason").notNull(),
  status: reportStatusEnum("status").notNull().default("OPEN"),
  createdAt: createdAt(),
});

// ─────────────────────────── Events & inventory ───────────────────────────
export type PolicyTier = { daysBefore: number; refundPercent: number };
export const DEFAULT_POLICY: PolicyTier[] = [
  { daysBefore: 90, refundPercent: 90 },
  { daysBefore: 60, refundPercent: 50 },
  { daysBefore: 30, refundPercent: 25 },
  { daysBefore: 0, refundPercent: 0 },
];

export const events = pgTable("events", {
  id: id(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  destinationSlug: text("destination_slug").notNull(),
  resortName: text("resort_name").notNull(),
  resortSummary: text("resort_summary"),
  location: text("location").notNull(),
  heroImage: text("hero_image"),
  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true }).notNull(),
  status: eventStatusEnum("status").notNull().default("DRAFT"),
  menCapacity: integer("men_capacity").notNull().default(100),
  womenCapacity: integer("women_capacity").notNull().default(100),
  currency: text("currency").notNull().default("usd"),
  depositType: depositTypeEnum("deposit_type").notNull().default("PERCENT"),
  depositValue: integer("deposit_value").notNull().default(25), // percent, or cents when FIXED
  installments: integer("installments").notNull().default(2), // scheduled balance payments after the deposit
  balanceDueDays: integer("balance_due_days").notNull().default(45), // final payment due N days before arrival
  holdMinutes: integer("hold_minutes").notNull().default(15),
  cancellationPolicy: jsonb("cancellation_policy").$type<PolicyTier[]>().notNull().default(DEFAULT_POLICY),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const roomTypes = pgTable(
  "room_types",
  {
    id: id(),
    eventId: text("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    tier: integer("tier").notNull().default(1),
    description: text("description"),
    image: text("image"),
    features: text("features").array().notNull().default([]),
    priceCents: integer("price_cents").notNull(), // package price for one gentleman, 7 days / 6 nights
    companionCents: integer("companion_cents").notNull().default(0), // added when he brings a lady
    maxGuests: integer("max_guests").notNull().default(2),
    inventory: integer("inventory").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("rt_event").on(t.eventId)],
);

export const rooms = pgTable(
  "rooms",
  {
    id: id(),
    eventId: text("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
    roomTypeId: text("room_type_id").notNull().references(() => roomTypes.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    notes: text("notes"),
  },
  (t) => [uniqueIndex("room_label").on(t.eventId, t.label)],
);

// ─────────────────────────── Bookings & payments ───────────────────────────
export const bookings = pgTable(
  "bookings",
  {
    id: id(),
    ref: text("ref").notNull().unique(),
    eventId: text("event_id").notNull().references(() => events.id),
    roomTypeId: text("room_type_id").notNull().references(() => roomTypes.id),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    status: bookingStatusEnum("status").notNull().default("HOLD"),
    packageType: packageEnum("package_type").notNull().default("GENTLEMAN"),
    plan: planEnum("plan").notNull().default("FULL"),
    men: integer("men").notNull().default(1),
    women: integer("women").notNull().default(0),
    totalCents: integer("total_cents").notNull(),
    paidCents: integer("paid_cents").notNull().default(0),
    refundedCents: integer("refunded_cents").notNull().default(0),
    currency: text("currency").notNull().default("usd"),
    holdExpiresAt: timestamp("hold_expires_at", { withTimezone: true }),
    contactName: text("contact_name").notNull(),
    contactEmail: text("contact_email").notNull(),
    contactPhone: text("contact_phone"),
    contactCountry: text("contact_country"),
    notes: text("notes"),
    stripeCustomerId: text("stripe_customer_id"),
    stripePaymentMethodId: text("stripe_payment_method_id"),
    // one physical room can only ever be assigned to one booking → prevents double assignment
    roomId: text("room_id").unique().references(() => rooms.id, { onDelete: "set null" }),
    cancelRequestedAt: timestamp("cancel_requested_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    cancelReason: text("cancel_reason"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("bk_event_status").on(t.eventId, t.status), index("bk_rt_status").on(t.roomTypeId, t.status)],
);

export const guests = pgTable("guests", {
  id: id(),
  bookingId: text("booking_id").notNull().references(() => bookings.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email"),
  country: text("country"),
  gender: genderEnum("gender").notNull(),
  isPrimary: boolean("is_primary").notNull().default(false),
});

export const payments = pgTable(
  "payments",
  {
    id: id(),
    bookingId: text("booking_id").notNull().references(() => bookings.id, { onDelete: "cascade" }),
    kind: paymentKindEnum("kind").notNull(),
    sequence: integer("sequence").notNull().default(0),
    amountCents: integer("amount_cents").notNull(),
    refundedCents: integer("refunded_cents").notNull().default(0),
    dueDate: timestamp("due_date", { withTimezone: true }).notNull(),
    status: paymentStatusEnum("status").notNull().default("SCHEDULED"),
    stripeCheckoutSessionId: text("stripe_checkout_session_id").unique(),
    stripePaymentIntentId: text("stripe_payment_intent_id").unique(),
    attempts: integer("attempts").notNull().default(0),
    lastError: text("last_error"),
    reminderSentAt: timestamp("reminder_sent_at", { withTimezone: true }),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [index("pay_status_due").on(t.status, t.dueDate)],
);

export const activities = pgTable("activities", {
  id: id(),
  eventId: text("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  category: text("category").notNull().default("Ocean"),
  description: text("description"),
  image: text("image"),
  priceCents: integer("price_cents").notNull(),
  capacity: integer("capacity").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const activityBookings = pgTable("activity_bookings", {
  id: id(),
  activityId: text("activity_id").notNull().references(() => activities.id, { onDelete: "cascade" }),
  bookingId: text("booking_id").notNull().references(() => bookings.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
  status: activityBookingStatusEnum("status").notNull().default("PENDING"),
  paymentId: text("payment_id").unique().references(() => payments.id, { onDelete: "set null" }),
  createdAt: createdAt(),
});

// ─────────────────────────── Applications & marketing ───────────────────────────
export const applications = pgTable(
  "applications",
  {
    id: id(),
    type: applicationTypeEnum("type").notNull(),
    status: applicationStatusEnum("status").notNull().default("NEW"),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    country: text("country"),
    data: jsonb("data").$type<Record<string, string>>().notNull().default({}),
    files: text("files").array().notNull().default([]),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    adminNotes: text("admin_notes"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("app_type_status").on(t.type, t.status)],
);

// ─────────────────────────── Casting (ladies apply, gentlemen vote) ───────────────────────────
export type CastingPhotoSets = { dress: string[]; sport: string[]; bikini: string[] };

export const castingEntries = pgTable(
  "casting_entries",
  {
    id: id(),
    // PENDING → admin review · APPROVED → open for votes · CHOSEN → shortlisted / invited
    status: castingStatusEnum("status").notNull().default("PENDING"),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    country: text("country"),
    city: text("city"),
    birthDate: timestamp("birth_date", { withTimezone: true }).notNull(),
    heightCm: integer("height_cm"),
    instagram: text("instagram"),
    languages: text("languages"),
    about: text("about"),
    event: text("event"),
    photos: jsonb("photos").$type<CastingPhotoSets>().notNull(),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    adminNotes: text("admin_notes"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("casting_status").on(t.status), index("casting_email").on(t.email)],
);

export const castingVotes = pgTable(
  "casting_votes",
  {
    entryId: text("entry_id").notNull().references(() => castingEntries.id, { onDelete: "cascade" }),
    voterId: text("voter_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
  },
  // one heart per gentleman per lady
  (t) => [primaryKey({ columns: [t.entryId, t.voterId] }), index("vote_voter").on(t.voterId)],
);

export const subscribers = pgTable("subscribers", {
  id: id(),
  email: text("email").notNull().unique(),
  source: text("source"),
  createdAt: createdAt(),
});

export const auditLogs = pgTable("audit_logs", {
  id: id(),
  actorId: text("actor_id"),
  action: text("action").notNull(),
  entity: text("entity").notNull(),
  entityId: text("entity_id"),
  data: jsonb("data"),
  createdAt: createdAt(),
});

export const stripeEvents = pgTable("stripe_events", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  createdAt: createdAt(),
});

// ─────────────────────────── Relations ───────────────────────────
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, { fields: [users.id], references: [profiles.userId] }),
  bookings: many(bookings),
}));
export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, { fields: [profiles.userId], references: [users.id] }),
}));
export const eventsRelations = relations(events, ({ many }) => ({
  roomTypes: many(roomTypes),
  rooms: many(rooms),
  bookings: many(bookings),
  activities: many(activities),
}));
export const roomTypesRelations = relations(roomTypes, ({ one, many }) => ({
  event: one(events, { fields: [roomTypes.eventId], references: [events.id] }),
  rooms: many(rooms),
  bookings: many(bookings),
}));
export const roomsRelations = relations(rooms, ({ one }) => ({
  event: one(events, { fields: [rooms.eventId], references: [events.id] }),
  roomType: one(roomTypes, { fields: [rooms.roomTypeId], references: [roomTypes.id] }),
}));
export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  event: one(events, { fields: [bookings.eventId], references: [events.id] }),
  roomType: one(roomTypes, { fields: [bookings.roomTypeId], references: [roomTypes.id] }),
  user: one(users, { fields: [bookings.userId], references: [users.id] }),
  room: one(rooms, { fields: [bookings.roomId], references: [rooms.id] }),
  guests: many(guests),
  payments: many(payments),
  activities: many(activityBookings),
}));
export const guestsRelations = relations(guests, ({ one }) => ({
  booking: one(bookings, { fields: [guests.bookingId], references: [bookings.id] }),
}));
export const paymentsRelations = relations(payments, ({ one }) => ({
  booking: one(bookings, { fields: [payments.bookingId], references: [bookings.id] }),
}));
export const activitiesRelations = relations(activities, ({ one, many }) => ({
  event: one(events, { fields: [activities.eventId], references: [events.id] }),
  bookings: many(activityBookings),
}));
export const activityBookingsRelations = relations(activityBookings, ({ one }) => ({
  activity: one(activities, { fields: [activityBookings.activityId], references: [activities.id] }),
  booking: one(bookings, { fields: [activityBookings.bookingId], references: [bookings.id] }),
  payment: one(payments, { fields: [activityBookings.paymentId], references: [payments.id] }),
}));
export const conversationsRelations = relations(conversations, ({ many }) => ({
  messages: many(messages),
}));
export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, { fields: [messages.conversationId], references: [conversations.id] }),
}));
export const applicationsRelations = relations(applications, ({ one }) => ({
  user: one(users, { fields: [applications.userId], references: [users.id] }),
}));

export type Event = typeof events.$inferSelect;
export type RoomType = typeof roomTypes.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type User = typeof users.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type Activity = typeof activities.$inferSelect;
export type Application = typeof applications.$inferSelect;
export type CastingEntry = typeof castingEntries.$inferSelect;
