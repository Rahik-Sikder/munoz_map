import type { Entry } from '../types';

interface EntryDetailProps {
  entry: Entry | null;
  onClose?: () => void;
}

export default function EntryDetail({ entry, onClose }: EntryDetailProps) {
  if (!entry) {
    return (
      <div className="flex items-center justify-center h-full text-aged-ink">
        <p>Select an entry on the map to view details</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="h-full overflow-y-auto bg-parchment p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header with close button */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-serif font-bold text-colonial-brown mb-2">
              {entry.object?.name || 'Unknown Object'}
            </h2>
            <p className="text-sm text-sepia">
              {entry.object?.type && (
                <span className="inline-block bg-aged-paper px-2 py-1 rounded">
                  {entry.object.type}
                </span>
              )}
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-aged-ink hover:text-colonial-brown transition-colors"
              aria-label="Close"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Object Image */}
        {entry.object?.imageUrl && (
          <div className="mb-6">
            <img
              src={entry.object.imageUrl}
              alt={entry.object.name}
              className="w-full rounded-lg shadow-lg border-4 border-map-border"
            />
          </div>
        )}

        {/* Location Information */}
        <div className="mb-6">
          <h3 className="text-lg font-serif font-semibold text-colonial-brown mb-2">
            Location
          </h3>
          <p className="text-ink-black">{entry.locationName}</p>
          <p className="text-sm text-aged-ink">
            {entry.location.latitude.toFixed(4)}°N,{' '}
            {entry.location.longitude.toFixed(4)}°W
          </p>
        </div>

        {/* Time Period */}
        <div className="mb-6">
          <h3 className="text-lg font-serif font-semibold text-colonial-brown mb-2">
            Time Period
          </h3>
          <p className="text-ink-black">
            {formatDate(entry.startDate)}
            {entry.endDate && ` - ${formatDate(entry.endDate)}`}
          </p>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h3 className="text-lg font-serif font-semibold text-colonial-brown mb-2">
            Description
          </h3>
          <p className="text-ink-black leading-relaxed">{entry.description}</p>
        </div>

        {/* Object Description */}
        {entry.object?.description && (
          <div className="mb-6">
            <h3 className="text-lg font-serif font-semibold text-colonial-brown mb-2">
              About {entry.object.name}
            </h3>
            <p className="text-ink-black leading-relaxed">
              {entry.object.description}
            </p>
          </div>
        )}

        {/* Tags */}
        {entry.tags.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-serif font-semibold text-colonial-brown mb-2">
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {entry.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-colonial-blue text-parchment px-3 py-1 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Sources */}
        {entry.sources.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-serif font-semibold text-colonial-brown mb-2">
              Sources
            </h3>
            <ul className="list-disc list-inside space-y-1">
              {entry.sources.map((source, index) => (
                <li key={index} className="text-ink-black text-sm">
                  {source}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
