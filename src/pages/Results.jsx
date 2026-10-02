import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bookmark, BookmarkCheck } from "lucide-react";
import RouteMap from "../components/RouteMap.jsx";
import RouteCard from "../components/RouteCard.jsx";
import { api } from "../api";

export default function Results() {
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [selected, setSelected] = useState(null);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const raw = sessionStorage.getItem("ecoroute-plan");
    if (!raw) {
      navigate("/");
      return;
    }
    const data = JSON.parse(raw);
    setPlan(data);
    setSelected(data.comparison?.balancedId || data.routes?.[0]?.id);
  }, [navigate]);

  if (!plan) return null;
  const current = plan.routes.find((r) => r.id === selected);

  async function save() {
    try {
      await api.saveJourney({
        origin: plan.origin,
        destination: plan.destination,
        vehicle: plan.vehicle,
        selectedRouteId: selected,
        routes: plan.routes.map(({ coordinates, ...rest }) => rest),
        comparison: plan.comparison,
      });
      setSaved(true);
      setMessage("Saved to your journey dashboard.");
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <p className="text-sm text-slate-muted">
        <Link to="/" className="font-semibold text-emerald-700 hover:underline">
          New search
        </Link>
        <span className="mx-2">·</span>
        {plan.origin.label.split(",")[0]} → {plan.destination.label.split(",")[0]}
      </p>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-forest-950">Comparable route options</h1>
          <p className="mt-2 max-w-2xl text-slate-muted">{plan.comparison.headline}</p>
          {plan.comparison.vsCarKg > 0 && (
            <p className="mt-1 text-sm font-medium text-emerald-700">
              Choosing the greenest option instead of driving avoids about {plan.comparison.vsCarKg} kg CO₂e on this trip.
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={save}
          disabled={saved}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-forest-900 px-4 text-sm font-semibold text-white hover:bg-forest-800 disabled:opacity-60"
        >
          {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
          {saved ? "Saved" : "Save this journey"}
        </button>
      </div>
      {message && <p className="mt-3 text-sm font-medium text-emerald-700">{message}</p>}

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(340px,420px)_1fr]">
        <div className="space-y-3 lg:max-h-[640px] lg:overflow-auto pr-1">
          {plan.routes.map((route) => (
            <RouteCard key={route.id} route={route} selected={route.id === selected} onSelect={setSelected} />
          ))}
        </div>
        <div className="lg:sticky lg:top-24">
          <RouteMap
            routes={plan.routes}
            selectedId={selected}
            onSelect={setSelected}
            endpoints={{ start: plan.origin, destination: plan.destination }}
          />
          {current && (
            <p className="mt-3 text-sm text-slate-muted">
              Emission factor used: {current.factorNote}. Inputs: {current.factors.time}, {current.factors.cost},{" "}
              {current.factors.transfers} transfers, {current.factors.walking}.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
