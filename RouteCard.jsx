import { Bike, Bus, Car, Footprints, Sparkles, Zap } from "lucide-react";

const ICONS = {
  walk: Footprints,
  cycle: Bike,
  transit: Bus,
  shared: Zap,
  drive: Car,
  rideshare: Car,
};

export default function RouteCard({ route, selected, onSelect }) {
  const Icon = ICONS[route.mode] || Sparkles;
  return (
    <button
      type="button"
      onClick={() => onSelect(route.id)}
      className={`w-full rounded-2xl border p-4 text-left shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lift ${
        selected ? "border-emerald-500 ring-4 ring-emerald-100" : "border-mint-200 hover:border-emerald-300"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-mint-100 text-forest-900">
            <Icon size={18} />
          </span>
          <div>
            <p className="font-display font-semibold text-forest-950">{route.name}</p>
            <p className="text-xs text-slate-muted">{route.summary}</p>
          </div>
        </div>
        <p className="text-lg font-bold tabular-nums text-forest-900">{route.durationMin} min</p>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {route.tags?.map((t) => (
          <span key={t} className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
            {t}
          </span>
        ))}
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
        <Fact label="Cost" value={route.factors.cost} />
        <Fact label="CO₂e" value={route.factors.emissions} />
        <Fact label="Walk" value={route.factors.walking} />
        <Fact label="Transfers" value={route.factors.transfers} />
        <Fact label="Distance" value={`${route.distanceKm} km`} />
        <Fact label="Factor" value={route.factorNote} />
      </dl>
    </button>
  );
}

function Fact({ label, value }) {
  return (
    <div className="rounded-lg bg-mint-50 px-2.5 py-2">
      <dt className="uppercase tracking-wider text-slate-muted">{label}</dt>
      <dd className="mt-0.5 font-semibold text-charcoal">{value}</dd>
    </div>
  );
}
