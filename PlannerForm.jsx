import { useState } from "react";
import { ArrowDownUp, Leaf } from "lucide-react";
import PlaceInput from "./PlaceInput";

const VEHICLES = [
  { id: "petrol", label: "Petrol car" },
  { id: "diesel", label: "Diesel car" },
  { id: "cng", label: "CNG car" },
  { id: "hybrid", label: "Hybrid car" },
  { id: "electric", label: "Electric car (grid)" },
];

export default function PlannerForm({ onPlan, loading, initial }) {
  const [origin, setOrigin] = useState(initial?.origin || { label: "" });
  const [destination, setDestination] = useState(initial?.destination || { label: "" });
  const [vehicle, setVehicle] = useState(initial?.vehicle || "petrol");
  const [errors, setErrors] = useState({});

  function swap() {
    setOrigin(destination);
    setDestination(origin);
  }

  function submit(e) {
    e.preventDefault();
    const next = {};
    if (!origin.label || origin.label.trim().length < 3) next.origin = "Starting location is too short.";
    if (!destination.label || destination.label.trim().length < 3) next.destination = "Destination is too short.";
    if (origin.label.trim() && origin.label.trim() === destination.label.trim()) {
      next.destination = "Destination must be different from the starting location.";
    }
    setErrors(next);
    if (Object.keys(next).length) return;
    onPlan({ origin, destination, vehicle });
  }

  return (
    <form onSubmit={submit} className="rounded-3xl border border-mint-200 bg-white p-5 shadow-card sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Plan a greener route</p>
      <h2 className="mt-1 font-display text-2xl font-bold text-forest-950">Compare every practical option</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-muted">
        Time, cost, transfers, walking distance and estimated emissions — side by side.
      </p>
      <div className="mt-5 space-y-4">
        <PlaceInput
          id="origin"
          label="Starting location"
          placeholder="e.g. Connaught Place, Delhi"
          value={origin}
          onChange={setOrigin}
          error={errors.origin}
        />
        <div className="flex justify-center">
          <button
            type="button"
            onClick={swap}
            className="inline-flex items-center gap-1.5 rounded-full border border-mint-200 bg-mint-50 px-3 py-1.5 text-xs font-semibold text-forest-800 hover:border-emerald-400"
            aria-label="Swap starting location and destination"
          >
            <ArrowDownUp size={14} /> Swap locations
          </button>
        </div>
        <PlaceInput
          id="destination"
          label="Destination"
          placeholder="e.g. India Gate, Delhi"
          value={destination}
          onChange={setDestination}
          error={errors.destination}
        />
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-forest-900">If you drove, which car?</span>
          <select
            value={vehicle}
            onChange={(e) => setVehicle(e.target.value)}
            className="h-12 w-full appearance-none rounded-xl border border-mint-200 bg-white px-3.5 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          >
            {VEHICLES.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-forest-900 text-sm font-semibold text-white transition-colors hover:bg-forest-800 disabled:cursor-wait disabled:bg-forest-700"
      >
        <Leaf size={16} />
        {loading ? "Searching for routes" : "Compare routes"}
      </button>
    </form>
  );
}
