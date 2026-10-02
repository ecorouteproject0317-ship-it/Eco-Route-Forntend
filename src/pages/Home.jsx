import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Leaf, Wallet } from "lucide-react";
import PlannerForm from "../components/PlannerForm.jsx";
import { api } from "../api";

export default function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onPlan(payload) {
    setError("");
    setLoading(true);
    try {
      const plan = await api.plan({
        origin: payload.origin.lat ? payload.origin : payload.origin.label,
        destination: payload.destination.lat ? payload.destination : payload.destination.label,
        vehicle: payload.vehicle,
      });
      sessionStorage.setItem("ecoroute-plan", JSON.stringify(plan));
      api
        .recordTrip({ origin: plan.origin, destination: plan.destination, vehicle: plan.vehicle })
        .catch(() => {});
      navigate("/results");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <section className="relative overflow-hidden bg-mint-50">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:px-8 lg:pb-28 md:pt-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Route comparison with emissions in view</p>
            <h1 className="mt-3 font-display text-4xl font-bold leading-[1.05] text-forest-950 sm:text-5xl lg:text-6xl">
              Greener journeys.
              <br />
              Smarter choices.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-muted">
              Urban commuters often pick a trip by time or cost alone. EcoRoute puts public transport, walking,
              cycling, shared mobility and driving on one comparable card — including estimated CO₂e.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <Stat icon={Clock} title="Time & transfers" copy="See which option is actually faster door to door." />
              <Stat icon={Wallet} title="Transparent cost" copy="Approximate fares, fuel and shared-mobility pricing." />
              <Stat icon={Leaf} title="Impact indicator" copy="Spot the lowest-emission alternative instantly." />
            </div>
          </div>
          <div>
            <PlannerForm onPlan={onPlan} loading={loading} />
            {error && (
              <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
              </p>
            )}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl font-bold text-forest-950">Every journey can make a lighter footprint</h2>
        <p className="mt-3 max-w-2xl text-slate-muted">
          Save frequent commutes on your personal dashboard, replay recent trips, and compare what a week of driving
          would emit versus the greener option you keep choosing.
        </p>
      </section>
    </main>
  );
}

function Stat({ icon: Icon, title, copy }) {
  return (
    <div className="rounded-2xl border border-mint-200 bg-white/95 p-4 shadow-card">
      <Icon className="text-emerald-600" size={18} />
      <p className="mt-2 font-semibold text-forest-900">{title}</p>
      <p className="mt-1 text-sm text-slate-muted">{copy}</p>
    </div>
  );
}
