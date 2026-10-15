CREATE TYPE "public"."activity_booking_status" AS ENUM('PENDING', 'PAID', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."application_status" AS ENUM('NEW', 'REVIEWING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."application_type" AS ENUM('LADY', 'COMPETITION', 'PARTNER', 'SPONSOR', 'GENERAL', 'MEMBER');--> statement-breakpoint
CREATE TYPE "public"."booking_status" AS ENUM('HOLD', 'PENDING_PAYMENT', 'DEPOSIT_PAID', 'PAID', 'CANCELLED', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."deposit_type" AS ENUM('PERCENT', 'FIXED');--> statement-breakpoint
CREATE TYPE "public"."event_status" AS ENUM('DRAFT', 'PUBLISHED', 'SOLD_OUT', 'CLOSED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('GENTLEMAN', 'LADY');--> statement-breakpoint
CREATE TYPE "public"."intro_status" AS ENUM('PENDING', 'ACCEPTED', 'DECLINED');--> statement-breakpoint
CREATE TYPE "public"."package_type" AS ENUM('GENTLEMAN', 'GENTLEMAN_LADY', 'VILLA', 'LADY_COMPLIMENTARY');--> statement-breakpoint
CREATE TYPE "public"."payment_kind" AS ENUM('FULL', 'DEPOSIT', 'INSTALLMENT', 'ACTIVITY');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('SCHEDULED', 'PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED');--> statement-breakpoint
CREATE TYPE "public"."payment_plan" AS ENUM('FULL', 'DEPOSIT');--> statement-breakpoint
CREATE TYPE "public"."profile_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('OPEN', 'RESOLVED', 'DISMISSED');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('MEMBER', 'ADMIN');--> statement-breakpoint
CREATE TABLE "activities" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"name" text NOT NULL,
	"category" text DEFAULT 'Ocean' NOT NULL,
	"description" text,
	"image" text,
	"price_cents" integer NOT NULL,
	"capacity" integer NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activity_bookings" (
	"id" text PRIMARY KEY NOT NULL,
	"activity_id" text NOT NULL,
	"booking_id" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"status" "activity_booking_status" DEFAULT 'PENDING' NOT NULL,
	"payment_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "activity_bookings_payment_id_unique" UNIQUE("payment_id")
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" text PRIMARY KEY NOT NULL,
	"type" "application_type" NOT NULL,
	"status" "application_status" DEFAULT 'NEW' NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"country" text,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"files" text[] DEFAULT '{}' NOT NULL,
	"user_id" text,
	"admin_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"actor_id" text,
	"action" text NOT NULL,
	"entity" text NOT NULL,
	"entity_id" text,
	"data" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blocks" (
	"blocker_id" text NOT NULL,
	"blocked_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "blocks_blocker_id_blocked_id_pk" PRIMARY KEY("blocker_id","blocked_id")
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" text PRIMARY KEY NOT NULL,
	"ref" text NOT NULL,
	"event_id" text NOT NULL,
	"room_type_id" text NOT NULL,
	"user_id" text,
	"status" "booking_status" DEFAULT 'HOLD' NOT NULL,
	"package_type" "package_type" DEFAULT 'GENTLEMAN' NOT NULL,
	"plan" "payment_plan" DEFAULT 'FULL' NOT NULL,
	"men" integer DEFAULT 1 NOT NULL,
	"women" integer DEFAULT 0 NOT NULL,
	"total_cents" integer NOT NULL,
	"paid_cents" integer DEFAULT 0 NOT NULL,
	"refunded_cents" integer DEFAULT 0 NOT NULL,
	"currency" text DEFAULT 'usd' NOT NULL,
	"hold_expires_at" timestamp with time zone,
	"contact_name" text NOT NULL,
	"contact_email" text NOT NULL,
	"contact_phone" text,
	"contact_country" text,
	"notes" text,
	"stripe_customer_id" text,
	"stripe_payment_method_id" text,
	"room_id" text,
	"cancel_requested_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"cancel_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bookings_ref_unique" UNIQUE("ref"),
	CONSTRAINT "bookings_room_id_unique" UNIQUE("room_id")
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" text PRIMARY KEY NOT NULL,
	"a_id" text NOT NULL,
	"b_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"destination_slug" text NOT NULL,
	"resort_name" text NOT NULL,
	"resort_summary" text,
	"location" text NOT NULL,
	"hero_image" text,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"status" "event_status" DEFAULT 'DRAFT' NOT NULL,
	"men_capacity" integer DEFAULT 100 NOT NULL,
	"women_capacity" integer DEFAULT 100 NOT NULL,
	"currency" text DEFAULT 'usd' NOT NULL,
	"deposit_type" "deposit_type" DEFAULT 'PERCENT' NOT NULL,
	"deposit_value" integer DEFAULT 25 NOT NULL,
	"installments" integer DEFAULT 2 NOT NULL,
	"balance_due_days" integer DEFAULT 45 NOT NULL,
	"hold_minutes" integer DEFAULT 15 NOT NULL,
	"cancellation_policy" jsonb DEFAULT '[{"daysBefore":90,"refundPercent":90},{"daysBefore":60,"refundPercent":50},{"daysBefore":30,"refundPercent":25},{"daysBefore":0,"refundPercent":0}]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "events_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "guests" (
	"id" text PRIMARY KEY NOT NULL,
	"booking_id" text NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"country" text,
	"gender" "gender" NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "introductions" (
	"id" text PRIMARY KEY NOT NULL,
	"from_id" text NOT NULL,
	"to_id" text NOT NULL,
	"note" text,
	"status" "intro_status" DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" text PRIMARY KEY NOT NULL,
	"conversation_id" text NOT NULL,
	"sender_id" text NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"read_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"token_hash" text NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	CONSTRAINT "password_reset_tokens_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" text PRIMARY KEY NOT NULL,
	"booking_id" text NOT NULL,
	"kind" "payment_kind" NOT NULL,
	"sequence" integer DEFAULT 0 NOT NULL,
	"amount_cents" integer NOT NULL,
	"refunded_cents" integer DEFAULT 0 NOT NULL,
	"due_date" timestamp with time zone NOT NULL,
	"status" "payment_status" DEFAULT 'SCHEDULED' NOT NULL,
	"stripe_checkout_session_id" text,
	"stripe_payment_intent_id" text,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_error" text,
	"reminder_sent_at" timestamp with time zone,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payments_stripe_checkout_session_id_unique" UNIQUE("stripe_checkout_session_id"),
	CONSTRAINT "payments_stripe_payment_intent_id_unique" UNIQUE("stripe_payment_intent_id")
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"display_name" text NOT NULL,
	"headline" text,
	"bio" text,
	"city" text,
	"occupation" text,
	"languages" text,
	"interests" text[] DEFAULT '{}' NOT NULL,
	"photos" text[] DEFAULT '{}' NOT NULL,
	"video_url" text,
	"visible" boolean DEFAULT true NOT NULL,
	"status" "profile_status" DEFAULT 'PENDING' NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" text PRIMARY KEY NOT NULL,
	"reporter_id" text NOT NULL,
	"reported_id" text NOT NULL,
	"reason" text NOT NULL,
	"status" "report_status" DEFAULT 'OPEN' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "room_types" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"name" text NOT NULL,
	"tier" integer DEFAULT 1 NOT NULL,
	"description" text,
	"image" text,
	"features" text[] DEFAULT '{}' NOT NULL,
	"price_cents" integer NOT NULL,
	"companion_cents" integer DEFAULT 0 NOT NULL,
	"max_guests" integer DEFAULT 2 NOT NULL,
	"inventory" integer NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"room_type_id" text NOT NULL,
	"label" text NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "stripe_events" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscribers" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"source" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscribers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"name" text NOT NULL,
	"role" "role" DEFAULT 'MEMBER' NOT NULL,
	"gender" "gender",
	"country" text,
	"phone" text,
	"birth_date" timestamp with time zone,
	"suspended" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_bookings" ADD CONSTRAINT "activity_bookings_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_bookings" ADD CONSTRAINT "activity_bookings_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_bookings" ADD CONSTRAINT "activity_bookings_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_blocker_id_users_id_fk" FOREIGN KEY ("blocker_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_blocked_id_users_id_fk" FOREIGN KEY ("blocked_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_room_type_id_room_types_id_fk" FOREIGN KEY ("room_type_id") REFERENCES "public"."room_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_a_id_users_id_fk" FOREIGN KEY ("a_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_b_id_users_id_fk" FOREIGN KEY ("b_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guests" ADD CONSTRAINT "guests_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "introductions" ADD CONSTRAINT "introductions_from_id_users_id_fk" FOREIGN KEY ("from_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "introductions" ADD CONSTRAINT "introductions_to_id_users_id_fk" FOREIGN KEY ("to_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reported_id_users_id_fk" FOREIGN KEY ("reported_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_types" ADD CONSTRAINT "room_types_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_room_type_id_room_types_id_fk" FOREIGN KEY ("room_type_id") REFERENCES "public"."room_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "app_type_status" ON "applications" USING btree ("type","status");--> statement-breakpoint
CREATE INDEX "bk_event_status" ON "bookings" USING btree ("event_id","status");--> statement-breakpoint
CREATE INDEX "bk_rt_status" ON "bookings" USING btree ("room_type_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "conv_pair" ON "conversations" USING btree ("a_id","b_id");--> statement-breakpoint
CREATE UNIQUE INDEX "intro_pair" ON "introductions" USING btree ("from_id","to_id");--> statement-breakpoint
CREATE INDEX "msg_conv_time" ON "messages" USING btree ("conversation_id","created_at");--> statement-breakpoint
CREATE INDEX "pay_status_due" ON "payments" USING btree ("status","due_date");--> statement-breakpoint
CREATE INDEX "rt_event" ON "room_types" USING btree ("event_id");--> statement-breakpoint
CREATE UNIQUE INDEX "room_label" ON "rooms" USING btree ("event_id","label");