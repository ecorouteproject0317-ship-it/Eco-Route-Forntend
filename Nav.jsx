import { NavLink, Outlet } from "react-router-dom";
import { Leaf } from "lucide-react";

const link = ({ isActive }) =>
  `rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
    isActive ? "bg-mint-100 text-forest-900" : "text-slate-muted hover:text-forest-900"
  }`;

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-mint-200/70 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <NavLink to="/" className="flex items-center gap-2 text-forest-900">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-forest-900 text-emerald-300">
            <Leaf size={18} />
          </span>
          <span className="font-display text-lg font-bold">EcoRoute</span>
          <span className="hidden rounded-full bg-mint-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-700 sm:inline">
            Eco routing beta
          </span>
        </NavLink>
        <nav className="flex items-center gap-1">
          <NavLink to="/" className={link} end>
            Plan
          </NavLink>
          <NavLink to="/dashboard" className={link}>
            Dashboard
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

export function Shell() {
  return (
    <div className="min-h-screen bg-white">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] rounded-lg bg-forest-900 px-3 py-2 text-white"
      >
        Skip to content
      </a>
      <Nav />
      <div id="main">
        <Outlet />
      </div>
      <footer className="border-t border-mint-200 bg-mint-50">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-8 text-sm text-slate-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>EcoRoute compares time, cost, walking, transfers and estimated CO₂e.</p>
          <p>Routing via OSRM · Places via Nominatim · OSM map tiles</p>
        </div>
      </footer>
    </div>
  );
}
