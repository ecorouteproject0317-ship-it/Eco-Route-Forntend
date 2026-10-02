import { index, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

// One table for both explicitly saved journeys ("saved") and automatically
// recorded searches ("recent"). Rows are scoped to an anonymous device id.
export const journeys = pgTable(
  "journeys",
  {
    id: serial().primaryKey(),
    deviceId: text("device_id").notNull(),
    kind: text().notNull(),
    origin: jsonb().notNull(),
    destination: jsonb().notNull(),
    vehicle: text(),
    selectedRouteId: text("selected_route_id"),
    routes: jsonb(),
    comparison: jsonb(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("journeys_device_kind_idx").on(t.deviceId, t.kind, t.createdAt)],
);
