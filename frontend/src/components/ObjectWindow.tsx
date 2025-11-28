import type { HistoricalObject } from '../types';

interface ObjectWindowProps {
  object: HistoricalObject;
  onToggleTimeline?: () => void;
  showTimeline?: boolean;
}

export default function ObjectWindow({
  object,
  onToggleTimeline,
  showTimeline = false,
}: ObjectWindowProps) {
  return (
    <div className="h-full bg-parchment p-4">
      {/* Image */}
      {object.imageUrl && (
        <img
          src={object.imageUrl}
          alt={object.name}
          className="w-full h-48 object-cover rounded-lg border-2 border-map-border mb-3"
        />
      )}

      {/* Type Badge */}
      <div className="mb-3">
        <span className="inline-block bg-colonial-blue text-parchment px-2 py-1 rounded text-xs capitalize">
          {object.type}
        </span>
      </div>

      {/* Description */}
      {object.description && (
        <div className="mb-4">
          <h3 className="text-sm font-serif font-semibold text-colonial-brown mb-2">
            About
          </h3>
          <p className="text-sm text-ink-black leading-relaxed">
            {object.description}
          </p>
        </div>
      )}

      {/* Timeline Toggle Button */}
      {onToggleTimeline && (
        <button
          onClick={onToggleTimeline}
          className="w-full px-4 py-2 bg-colonial-blue text-parchment rounded hover:bg-colonial-brown transition-colors text-sm font-semibold"
        >
          {showTimeline ? 'Hide Timeline' : 'View Timeline'}
        </button>
      )}
    </div>
  );
}
