import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { api } from "../api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState({ saved: [], recent: [], commute: [] });
  const [error, setError] = useState("");

  async function load() {
    try {
      setError("");
      setData(await api.dashboard());
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function replay(item) {
    setError("");
    try {
      const plan = await api.plan({
        origin: item.origin,
        destination: item.destination,
        vehicle: item.vehicle || "petrol",
      });
      sessionStorage.setItem("ecoroute-plan", JSON.stringify(plan));
      navigate("/results");
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove(id) {
    setError("");
    try {
      await api.deleteJourney(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-forest-950">Personal journey dashboard</h1>
      <p className="mt-2 max-w-2xl text-slate-muted">
        Saved routes, recent trips, and a simple weekly commute comparison so recurring patterns stay visible.
      </p>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <section className="mt-10">
        <h2 className="font-display text-xl font-bold text-forest-900">Recurring commute impact</h2>
        {data.commute.length === 0 ? (
          <p className="mt-3 text-sm text-slate-muted">
            Save a journey from results to estimate 10 weekly trips (typical 5-day return commute).
          </p>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {data.commute.map((c) => (
              <div key={c.id} className="rounded-2xl border border-mint-200 bg-white p-5 shadow-card">
                <p className="font-semibold text-forest-900">{c.label}</p>
                <p className="mt-2 text-sm text-slate-muted">
                  Weekly driving: <strong>{c.weeklyDriveKg} kg</strong> · your saved choice:{" "}
                  <strong>{c.weeklyChosenKg} kg</strong>
                </p>
                <p className="mt-1 text-sm font-medium text-emerald-700">
                  {c.savedKg >= 0 ? `${c.savedKg} kg CO₂e avoided / week vs always driving` : "Driving is currently the saved choice."}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-12 grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-xl font-bold text-forest-900">Saved journeys</h2>
          <ul className="mt-4 space-y-3">
            {data.saved.length === 0 && (
              <li className="rounded-xl border border-dashed border-mint-200 p-5 text-sm text-slate-muted">
                Nothing saved yet. <Link to="/" className="font-semibold text-emerald-700">Plan a route</Link>.
              </li>
            )}
            {data.saved.map((j) => (
              <li key={j.id} className="flex items-start justify-between gap-3 rounded-2xl border border-mint-200 p-4">
                <button type="button" className="text-left" onClick={() => replay(j)}>
                  <p className="font-semibold text-forest-900">
                    {j.origin.label.split(",")[0]} → {j.destination.label.split(",")[0]}
                  </p>
                  <p className="mt-1 text-xs text-slate-muted">
                    Prefer {j.selectedRouteId} · saved {new Date(j.createdAt).toLocaleString()}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => remove(j.id)}
                  className="rounded-lg p-2 text-slate-muted hover:bg-mint-50 hover:text-red-600"
                  aria-label="Delete saved journey"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-forest-900">Recent trips</h2>
          <ul className="mt-4 space-y-3">
            {data.recent.length === 0 && (
              <li className="rounded-xl border border-dashed border-mint-200 p-5 text-sm text-slate-muted">
                Your last searches will show up here.
              </li>
            )}
            {data.recent.map((j) => (
              <li key={j.id}>
                <button
                  type="button"
                  onClick={() => replay(j)}
                  className="w-full rounded-2xl border border-mint-200 p-4 text-left hover:border-emerald-400"
                >
                  <p className="font-semibold text-forest-900">
                    {j.origin.label.split(",")[0]} → {j.destination.label.split(",")[0]}
                  </p>
                  <p className="mt-1 text-xs text-slate-muted">{new Date(j.createdAt).toLocaleString()}</p>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
