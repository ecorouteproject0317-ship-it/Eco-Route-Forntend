import type { Config } from "@netlify/functions";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "../../db/index.js";
import { journeys } from "../../db/schema.js";
import { MAX_RECENT, badRequest, getDeviceId, isPlace } from "../../db/http.js";

// Records a completed search so it shows up under "Recent trips".
export default async (req: Request) => {
  if (req.method !== "POST") return badRequest("Method not allowed", 405);
  const deviceId = getDeviceId(req);
  if (!deviceId) return badRequest("Missing device id");

  const body = await req.json().catch(() => null);
  if (!body || !isPlace(body.origin) || !isPlace(body.destination)) {
    return badRequest("Origin and destination are required");
  }

  await db.insert(journeys).values({
    deviceId,
    kind: "recent",
    origin: body.origin,
    destination: body.destination,
    vehicle: typeof body.vehicle === "string" ? body.vehicle : null,
  });

  // Keep only the latest trips per device.
  const stale = await db
    .select({ id: journeys.id })
    .from(journeys)
    .where(and(eq(journeys.deviceId, deviceId), eq(journeys.kind, "recent")))
    .orderBy(desc(journeys.createdAt))
    .offset(MAX_RECENT);
  if (stale.length) {
    await db.delete(journeys).where(inArray(journeys.id, stale.map((r) => r.id)));
  }

  return new Response(null, { status: 204 });
};

export const config: Config = {
  path: "/api/trips",
};
