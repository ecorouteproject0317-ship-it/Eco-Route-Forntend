import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { api } from "../api";

export default function PlaceInput({ id, label, value, onChange, error, placeholder }) {
  const [open, setOpen] = useState(false);
  const [hints, setHints] = useState([]);
  const box = useRef(null);

  useEffect(() => {
    const q = value?.label || "";
    if (q.length < 3) {
      setHints([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        setHints(await api.places(q));
      } catch {
        setHints([]);
      }
    }, 280);
    return () => clearTimeout(t);
  }, [value?.label]);

  useEffect(() => {
    const onDoc = (e) => {
      if (!box.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <label className="block" ref={box}>
      <span className="mb-1.5 block text-sm font-semibold text-forest-900">{label}</span>
      <div className="relative">
        <MapPin className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-emerald-600" />
        <input
          id={id}
          autoComplete="off"
          value={value?.label || ""}
          placeholder={placeholder}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            onChange({ label: e.target.value });
            setOpen(true);
          }}
          aria-invalid={Boolean(error)}
          className={`h-12 w-full rounded-xl border bg-white pl-11 pr-4 text-sm shadow-sm outline-none transition-colors focus:ring-4 ${
            error
              ? "border-red-400 focus:border-red-500 focus:ring-red-100"
              : "border-mint-200 hover:border-emerald-300 focus:border-emerald-500 focus:ring-emerald-100"
          }`}
        />
        {open && hints.length > 0 && (
          <ul className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-mint-200 bg-white py-1 shadow-lift">
            {hints.map((h) => (
              <li key={`${h.lat}-${h.lng}`}>
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm hover:bg-mint-50"
                  onClick={() => {
                    onChange(h);
                    setOpen(false);
                  }}
                >
                  {h.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-1.5 text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </label>
  );
}
