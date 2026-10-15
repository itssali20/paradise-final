CREATE TYPE "public"."casting_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'CHOSEN');--> statement-breakpoint
CREATE TABLE "casting_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"status" "casting_status" DEFAULT 'PENDING' NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"country" text,
	"city" text,
	"birth_date" timestamp with time zone NOT NULL,
	"height_cm" integer,
	"instagram" text,
	"languages" text,
	"about" text,
	"event" text,
	"photos" jsonb NOT NULL,
	"user_id" text,
	"admin_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "casting_votes" (
	"entry_id" text NOT NULL,
	"voter_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "casting_votes_entry_id_voter_id_pk" PRIMARY KEY("entry_id","voter_id")
);
--> statement-breakpoint
ALTER TABLE "casting_entries" ADD CONSTRAINT "casting_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "casting_votes" ADD CONSTRAINT "casting_votes_entry_id_casting_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."casting_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "casting_votes" ADD CONSTRAINT "casting_votes_voter_id_users_id_fk" FOREIGN KEY ("voter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "casting_status" ON "casting_entries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "casting_email" ON "casting_entries" USING btree ("email");--> statement-breakpoint
CREATE INDEX "vote_voter" ON "casting_votes" USING btree ("voter_id");