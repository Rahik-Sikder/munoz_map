import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import type { Entry } from '../types';
import L from 'leaflet';

// Fix for default marker icons in react-leaflet
// This is needed because webpack/vite doesn't bundle the marker images correctly
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapProps {
  entries: Entry[];
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
      const bounds = L.latLngBounds(
        entries.map((entry) => [
          entry.location.latitude,
          entry.location.longitude,
        ])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [entries, map]);

  return null;
}

export default function Map({
  entries,
  onEntryClick,
  center = [20, -80], // Default to Caribbean/Central America region
  zoom = 5,
  className = '',
}: MapProps) {
  // Debug: Log entries to console
  useEffect(() => {
    console.log('Map received entries:', entries.length, entries);
  }, [entries]);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={`h-full w-full ${className}`}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />

      {entries.map((entry) => (
        <Marker
          key={entry.id}
          position={[entry.location.latitude, entry.location.longitude]}
          eventHandlers={{
            click: () => onEntryClick?.(entry),
          }}
        >
          <Popup>
            <div className="min-w-[200px]">
              <h3 className="font-bold text-colonial-brown">
                {entry.object?.name || 'Unknown'}
              </h3>
              <p className="text-sm text-aged-ink">{entry.locationName}</p>
              <p className="text-xs text-sepia mt-1">
                {new Date(entry.startDate).toLocaleDateString()}
                {entry.endDate && ` - ${new Date(entry.endDate).toLocaleDateString()}`}
              </p>
              <p className="text-sm mt-2">{entry.description}</p>
            </div>
          </Popup>
        </Marker>
      ))}

      {entries.length > 0 && <MapBounds entries={entries} />}
    </MapContainer>
  );
}
