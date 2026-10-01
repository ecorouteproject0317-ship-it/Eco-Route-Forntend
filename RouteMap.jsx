import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Polyline, Marker, useMap } from "react-leaflet";
import L from "leaflet";

const MODE_COLOR = {
  walk: "#64748b",
  cycle: "#059669",
  transit: "#0369a1",
  shared: "#d97706",
  drive: "#b45309",
  rideshare: "#be123c",
};

const pin = (fill) =>
  L.divIcon({
    className: "eco-marker",
    html: `<svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 1C7.7 1 1 7.4 1 15.3 1 26 16 39 16 39s15-13 15-23.7C31 7.4 24.3 1 16 1Z" fill="#123d2b"/>
      <circle cx="16" cy="15" r="6" fill="${fill}"/></svg>`,
    iconSize: [32, 40],
    iconAnchor: [16, 39],
  });

function Fit({ selected, endpoints }) {
  const map = useMap();
  useEffect(() => {
    const el = map.getContainer();
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(el);
    return () => ro.disconnect();
  }, [map]);

  useEffect(() => {
    let pts = selected?.coordinates?.length
      ? selected.coordinates
      : endpoints
        ? [
            [endpoints.start.lat, endpoints.start.lng],
            [endpoints.destination.lat, endpoints.destination.lng],
          ]
        : [];
    if (pts.length) {
      map.flyToBounds(L.latLngBounds(pts), { padding: [48, 48], duration: 0.6 });
    }
  }, [map, selected, endpoints]);
  return null;
}

export default function RouteMap({ routes, selectedId, onSelect, endpoints, loading }) {
  const selected = routes.find((r) => r.id === selectedId) || null;
  const ordered = useMemo(
    () => [...routes].sort((a, b) => (a.id === selectedId) - (b.id === selectedId)),
    [routes, selectedId],
  );

  return (
    <div className="relative isolate h-[420px] overflow-hidden rounded-2xl border border-mint-200 bg-mint-50 shadow-card sm:h-[500px] lg:h-[640px]">
      <MapContainer
        center={[28.6139, 77.209]}
        zoom={12}
        zoomControl
        scrollWheelZoom={false}
        className="h-full w-full"
        aria-label="Route map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {ordered.map((r) => (
          <Polyline
            key={r.id}
            positions={r.coordinates}
            pathOptions={{
              color: MODE_COLOR[r.mode] || "#059669",
              weight: r.id === selectedId ? 6 : 3,
              opacity: r.id === selectedId ? 0.95 : 0.35,
            }}
            eventHandlers={{ click: () => onSelect(r.id) }}
          />
        ))}
        {endpoints?.start && <Marker position={[endpoints.start.lat, endpoints.start.lng]} icon={pin("#34d399")} />}
        {endpoints?.destination && (
          <Marker position={[endpoints.destination.lat, endpoints.destination.lng]} icon={pin("#fbbf24")} />
        )}
        <Fit selected={selected} endpoints={endpoints} />
      </MapContainer>
      {loading && (
        <div className="absolute inset-0 grid place-items-center bg-white/55 backdrop-blur-[1px]">
          <p className="rounded-full bg-forest-900 px-4 py-2 text-sm font-semibold text-white">Finding routes…</p>
        </div>
      )}
    </div>
  );
}
