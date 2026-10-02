import { journeys } from "./schema.js";

export const MAX_RECENT = 10;

export function getDeviceId(req: Request) {
  const id = req.headers.get("x-device-id")?.trim();
  return id && id.length <= 100 ? id : null;
}

export function badRequest(error: string, status = 400) {
  return Response.json({ error }, { status });
}

export function isPlace(value: unknown): value is { label: string } {
  return !!value && typeof value === "object" && typeof (value as { label?: unknown }).label === "string";
}

type Row = typeof journeys.$inferSelect;

export function serialize(row: Row) {
  return {
    id: row.id,
    origin: row.origin,
    destination: row.destination,
    vehicle: row.vehicle,
    selectedRouteId: row.selectedRouteId,
    routes: row.routes,
    comparison: row.comparison,
    createdAt: row.createdAt,
  };
}
