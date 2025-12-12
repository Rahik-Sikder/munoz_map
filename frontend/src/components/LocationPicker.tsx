import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

interface LocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  onLocationChange: (lat: number, lng: number) => void;
}

// Custom marker icon
const createPickerIcon = () => {
  return L.divIcon({
    className: "custom-picker-marker",
    html: `<div style="
      width: 32px;
      height: 32px;
      background-color: #D4AF37;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      cursor: pointer;
    "></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

// Component to handle map clicks
function LocationMarker({
  position,
  onPositionChange,
}: {
  position: [number, number] | null;
  onPositionChange: (lat: number, lng: number) => void;
}) {
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(
    position
  );

  useEffect(() => {
    setMarkerPosition(position);
  }, [position]);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setMarkerPosition([lat, lng]);
      onPositionChange(lat, lng);
    },
  });

  return markerPosition ? (
    <Marker
      position={markerPosition}
      icon={createPickerIcon()}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const position = marker.getLatLng();
          setMarkerPosition([position.lat, position.lng]);
          onPositionChange(position.lat, position.lng);
        },
      }}
    />
  ) : null;
}

export default function LocationPicker({
  latitude,
  longitude,
  onLocationChange,
}: LocationPickerProps) {
  const position: [number, number] | null =
    latitude !== null && longitude !== null ? [latitude, longitude] : null;

  const center: [number, number] = position || [20, -80]; // Default to Caribbean/Central America
  const zoom = position ? 6 : 4;

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full rounded"
        scrollWheelZoom={true}
        key={`${center[0]}-${center[1]}-${zoom}`} // Force re-render when center changes
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={18}
        />
        <LocationMarker
          position={position}
          onPositionChange={onLocationChange}
        />
      </MapContainer>

      {/* Instruction overlay */}
      {!position && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-colonial-brown text-parchment px-4 py-2 rounded shadow-lg z-[1000] pointer-events-none">
          <p className="text-sm font-semibold">
            Click on the map to set a location
          </p>
        </div>
      )}
    </div>
  );
}
