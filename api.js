const KEY = "ecoroute-device-id";

export function deviceId() {
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}

const base = import.meta.env.VITE_API_URL || "";

async function request(path, options = {}) {
  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Device-Id": deviceId(),
      ...(options.headers || {}),
    },
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const api = {
  places: (q) => request(`/api/places?q=${encodeURIComponent(q)}`),
  plan: (body) => request("/api/plan", { method: "POST", body: JSON.stringify(body) }),
  journeys: () => request("/api/journeys"),
  saveJourney: (body) => request("/api/journeys", { method: "POST", body: JSON.stringify(body) }),
  deleteJourney: (id) => request(`/api/journeys/${id}`, { method: "DELETE" }),
  dashboard: () => request("/api/dashboard"),
};
