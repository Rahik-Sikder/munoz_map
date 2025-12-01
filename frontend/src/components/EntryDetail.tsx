import type { Entry, HistoricalObject } from '../types';

interface EntryDetailProps {
  entry: Entry | null;
  onViewObjectTimeline?: (object: HistoricalObject) => void;
}

export default function EntryDetail({
  entry,
  onViewObjectTimeline,
}: EntryDetailProps) {
  if (!entry) {
    return (
      <div className="flex items-center justify-center h-full text-aged-ink">
        <p>Select an entry on the map to view details</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    // Extract date without timezone conversion (YYYY-MM-DD)
    const datePart = dateString.split('T')[0];
    const [year, month, day] = datePart.split('-');
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];
    return `${monthNames[parseInt(month) - 1]} ${parseInt(day)}, ${year}`;
  };

  return (
    <div className="h-full overflow-y-auto bg-parchment p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-serif font-bold text-colonial-brown mb-2">
            {entry.locationName || 'Unknown Location'}
          </h2>
          <p className="text-sm text-sepia">
            {entry.object?.type && (
              <span className="inline-block bg-aged-paper px-2 py-1 rounded">
                {entry.object.type}
              </span>
            )}
          </p>
        </div>

        {/* Object Image */}
        {/* {entry.object?.imageUrl && (
          <div className="mb-6">
            <img
              src={entry.object.imageUrl}
              alt={entry.object.name}
              className="w-full rounded-lg shadow-lg border-4 border-map-border"
            />
          </div>
        )} */}

        {/* Location Information */}
        <div className="mb-6">
          <h3 className="text-lg font-serif font-semibold text-colonial-brown mb-2">
            Location
          </h3>
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
            {onViewObjectTimeline && (
              <button
                onClick={() => onViewObjectTimeline(entry.object!)}
                className="mt-3 px-4 py-2 bg-colonial-blue text-parchment rounded hover:bg-colonial-brown transition-colors text-sm font-semibold"
              >
                View All Entries for {entry.object.name}
              </button>
            )}
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
          <div className="mb-6 border-t border-aged-paper pt-4">
            <h3 className="text-lg font-serif font-semibold text-colonial-brown mb-3">
              Sources
            </h3>
            <ul className="space-y-2">
              {entry.sources.map((source, index) => {
                // Check if source contains a URL
                const urlMatch = source.match(/(https?:\/\/[^\s]+)/g);
                const isUrl = urlMatch && urlMatch.length > 0;

                return (
                  <li key={index} className="text-ink-black text-sm leading-relaxed pl-4 border-l-2 border-colonial-blue">
                    {isUrl ? (
                      <a
                        href={urlMatch[0]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-colonial-blue hover:text-colonial-brown underline transition-colors"
                      >
                        {source}
                      </a>
                    ) : (
                      source
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
