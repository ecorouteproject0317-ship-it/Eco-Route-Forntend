CREATE TABLE "journeys" (
	"id" serial PRIMARY KEY,
	"device_id" text NOT NULL,
	"kind" text NOT NULL,
	"origin" jsonb NOT NULL,
	"destination" jsonb NOT NULL,
	"vehicle" text,
	"selected_route_id" text,
	"routes" jsonb,
	"comparison" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "journeys_device_kind_idx" ON "journeys" ("device_id","kind","created_at");