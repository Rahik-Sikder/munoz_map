import { useEffect } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import type { Entry } from "../types";
import L from "leaflet";
import { maptilerLayer } from "@maptiler/leaflet-maptilersdk";

// Custom marker icon factory
const createCustomIcon = (isSelected: boolean, isSelectedObject: boolean) => {
  const size = isSelected ? 32 : 20;
  const color = isSelectedObject ? "#D4AF37" : "#5C4033";

  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      width: ${size}px;
      height: ${size}px;
      background-color: ${color};
      border: 2px solid white;
      border-radius: 50%;
      transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

// Helper function to get chronological path from entries
const getChronologicalPath = (entries: Entry[]): [number, number][] => {
  return entries
    .sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    )
    .map((entry) => [entry.location.latitude, entry.location.longitude]);
};

interface MapProps {
  entries: Entry[];
  selectedObjectId?: string;
  selectedEntryId?: string | null;
  mapTarget?: { lat: number; lng: number; zoom: number } | null;
  onEntryClick?: (entry: Entry) => void;
  center?: [number, number];
  zoom?: number;
  className?: string;
}

// Component to handle map bounds when entries change
function MapBounds({ entries }: { entries: Entry[] }) {
  const map = useMap();

  useEffect(() => {
    if (entries.length > 0) {
      console.log("MapBounds: Fitting to", entries.length, "entries");
      console.log(
        "MapBounds: Entry locations:",
        entries.map((e) => ({
          id: e.id,
          lat: e.location.latitude,
          lng: e.location.longitude,
          name: e.locationName,
        }))
      );

      const bounds = L.latLngBounds(
        entries.map((entry) => [
          entry.location.latitude,
          entry.location.longitude,
        ])
      );

      console.log("MapBounds: Calculated bounds:", bounds);

      // Add smooth animation like MapController
      map.fitBounds(bounds, {
        padding: [50, 50],
        animate: true,
        duration: 2.5, // Slightly longer /for smoother feel
        easeLinearity: 0.2, // Lower = smoother easing (0-1 range)
      });
    }
  }, [entries, map]);

  return null;
}

// Component to handle map zoom and centering when entry is selected
function MapController({
  target,
}: {
  target?: { lat: number; lng: number; zoom: number } | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lng], target.zoom, {
        duration: 1.5,
        easeLinearity: 0.25,
      });
    }
  }, [target, map]);

  return null;
}

// Component to add MapTiler vector tile layer
function MapTilerLayer() {
  const map = useMap();

  useEffect(() => {
    const layer = maptilerLayer({
      apiKey: import.meta.env.VITE_MAPTILER_KEY,
      style: "topo-v4",
    }).addTo(map);

    return () => {
      map.removeLayer(layer);
    };
  }, [map]);

  return null;
}

// Component to render chronological path with directional arrows
function PathLine({ entries }: { entries: Entry[] }) {
  const path = getChronologicalPath(entries);

  if (path.length < 2) return null;

  return (
    <>
      <Polyline
        positions={path}
        pathOptions={{
          color: "#5C4033",
          weight: 2,
          opacity: 0.6,
        }}
      />
    </>
  );
}

export default function Map({
  entries,
  selectedObjectId,
  selectedEntryId,
  mapTarget,
  onEntryClick,
  center = [20, -80], // Default to Caribbean/Central America region
  zoom = 5,
  className = "",
}: MapProps) {
  // Debug: Log entries to console
  useEffect(() => {
    console.log("Map received entries:", entries.length, entries);
  }, [entries]);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={`h-full w-full ${className}`}
      scrollWheelZoom={true}
    >
      <MapTilerLayer />

      {entries.map((entry) => {
        const isSelectedObject = Boolean(
          selectedObjectId && entry.objectId === selectedObjectId
        );
        const isSelected = entry.id === selectedEntryId;

        return (
          <Marker
            key={entry.id}
            position={[entry.location.latitude, entry.location.longitude]}
            icon={createCustomIcon(isSelected, isSelectedObject)}
            eventHandlers={{
              click: () => onEntryClick?.(entry),
            }}
            zIndexOffset={isSelected ? 1000 : isSelectedObject ? 500 : 0}
          >
            <Popup>
              <div className="min-w-[200px]">
                <h3 className="font-bold text-colonial-brown">
                  {entry.object?.name || "Unknown"}
                </h3>
                <p className="text-sm text-aged-ink">{entry.locationName}</p>
                <p className="text-xs text-sepia mt-1">
                  {entry.startDate.split("T")[0]}
                  {entry.endDate && ` - ${entry.endDate.split("T")[0]}`}
                </p>
                <p className="text-sm mt-2">{entry.description}</p>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* Chronological path with arrows (only for selected object) */}
      {selectedObjectId && entries.length > 1 && (
        <PathLine
          entries={entries.filter((e) => e.objectId === selectedObjectId)}
        />
      )}

      {entries.length > 0 && <MapBounds entries={entries} />}
      <MapController target={mapTarget} />
    </MapContainer>
  );
}
