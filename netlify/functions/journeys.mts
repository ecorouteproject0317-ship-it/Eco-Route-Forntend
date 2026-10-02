import type { Config, Context } from "@netlify/functions";
import { and, desc, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { journeys } from "../../db/schema.js";
import { badRequest, getDeviceId, isPlace, serialize } from "../../db/http.js";

export default async (req: Request, context: Context) => {
  const deviceId = getDeviceId(req);
  if (!deviceId) return badRequest("Missing device id");

  const { id } = context.params;

  if (req.method === "DELETE") {
    const journeyId = Number(id);
    if (!Number.isInteger(journeyId)) return badRequest("Invalid journey id");
    await db
      .delete(journeys)
      .where(and(eq(journeys.id, journeyId), eq(journeys.deviceId, deviceId), eq(journeys.kind, "saved")));
    return new Response(null, { status: 204 });
  }

  if (id) return badRequest("Method not allowed", 405);

  if (req.method === "GET") {
    const rows = await db
      .select()
      .from(journeys)
      .where(and(eq(journeys.deviceId, deviceId), eq(journeys.kind, "saved")))
      .orderBy(desc(journeys.createdAt));
    return Response.json(rows.map(serialize));
  }

  if (req.method === "POST") {
    const body = await req.json().catch(() => null);
    if (!body || !isPlace(body.origin) || !isPlace(body.destination)) {
      return badRequest("Origin and destination are required");
    }
    const [row] = await db
      .insert(journeys)
      .values({
        deviceId,
        kind: "saved",
        origin: body.origin,
        destination: body.destination,
        vehicle: typeof body.vehicle === "string" ? body.vehicle : null,
        selectedRouteId: typeof body.selectedRouteId === "string" ? body.selectedRouteId : null,
        routes: Array.isArray(body.routes) ? body.routes : null,
        comparison: body.comparison ?? null,
      })
      .returning();
    return Response.json(serialize(row), { status: 201 });
  }

  return badRequest("Method not allowed", 405);
};

export const config: Config = {
  path: ["/api/journeys", "/api/journeys/:id"],
};
