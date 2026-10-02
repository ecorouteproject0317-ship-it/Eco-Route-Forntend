import type { Config } from "@netlify/functions";
import { and, desc, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { journeys } from "../../db/schema.js";
import { MAX_RECENT, badRequest, getDeviceId, serialize } from "../../db/http.js";

// A typical 5-day return commute.
const WEEKLY_TRIPS = 10;

type Route = {
  id?: string;
  mode?: string;
  co2Kg?: number;
  emissionsKg?: number;
  factors?: { emissions?: string };
};

// Routes carry a display string like "1.8 kg CO₂e" or "120 g CO₂e"; prefer a
// numeric field if one is present.
function routeKg(route: Route | undefined): number | null {
  if (!route) return null;
  for (const v of [route.co2Kg, route.emissionsKg]) {
    if (typeof v === "number" && Number.isFinite(v)) return v;
  }
  const match = route.factors?.emissions?.replace(",", ".").match(/(\d+(?:\.\d+)?)\s*(kg|g)?/i);
  if (!match) return null;
  const value = Number(match[1]);
  return match[2]?.toLowerCase() === "g" ? value / 1000 : value;
}

const round = (n: number) => Math.round(n * 10) / 10;

export default async (req: Request) => {
  if (req.method !== "GET") return badRequest("Method not allowed", 405);
  const deviceId = getDeviceId(req);
  if (!deviceId) return badRequest("Missing device id");

  const [savedRows, recentRows] = await Promise.all([
    db
      .select()
      .from(journeys)
      .where(and(eq(journeys.deviceId, deviceId), eq(journeys.kind, "saved")))
      .orderBy(desc(journeys.createdAt)),
    db
      .select()
      .from(journeys)
      .where(and(eq(journeys.deviceId, deviceId), eq(journeys.kind, "recent")))
      .orderBy(desc(journeys.createdAt))
      .limit(MAX_RECENT),
  ]);

  const commute = savedRows.flatMap((row) => {
    const routes = (Array.isArray(row.routes) ? row.routes : []) as Route[];
    const driveKg = routeKg(routes.find((r) => r.mode === "drive"));
    const chosenKg = routeKg(routes.find((r) => r.id === row.selectedRouteId));
    if (driveKg === null || chosenKg === null) return [];
    const origin = row.origin as { label: string };
    const destination = row.destination as { label: string };
    const weeklyDriveKg = round(driveKg * WEEKLY_TRIPS);
    const weeklyChosenKg = round(chosenKg * WEEKLY_TRIPS);
    return [
      {
        id: row.id,
        label: `${origin.label.split(",")[0]} → ${destination.label.split(",")[0]}`,
        weeklyDriveKg,
        weeklyChosenKg,
        savedKg: round(weeklyDriveKg - weeklyChosenKg),
      },
    ];
  });

  return Response.json({
    saved: savedRows.map(serialize),
    recent: recentRows.map(serialize),
    commute,
  });
};

export const config: Config = {
  path: "/api/dashboard",
};
