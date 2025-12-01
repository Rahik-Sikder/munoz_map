import { useMemo } from 'react';
import type { Entry, HistoricalObject } from '../types';

interface TimelineProps {
  entries: Entry[];
  selectedObject: HistoricalObject;
  onEntryClick?: (entry: Entry) => void;
  selectedEntryId?: string;
  onClearObjectSelection?: () => void;
}

export default function Timeline({
  entries,
  selectedObject,
  onEntryClick,
  selectedEntryId,
}: TimelineProps) {
  // Sort entries by start date
  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => {
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });
  }, [entries]);

  const formatDate = (dateString: string) => {
    // Extract date without timezone conversion (YYYY-MM-DD)
    const datePart = dateString.split('T')[0];
    const [year, month] = datePart.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  return (
    <div className="bg-white">
      {/* Object info banner */}
      <div className="px-4 py-2 bg-aged-paper border-b-2 border-map-border">
        <div className="flex items-center gap-2">
          <span className="bg-colonial-blue text-parchment px-1.5 py-0.5 rounded text-[9px] capitalize">
            {selectedObject.type}
          </span>
          <span className="text-xs text-aged-ink">
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>
      </div>

      {/* Timeline entries */}
      {entries.length === 0 ? (
        <div className="flex items-center justify-center h-full text-aged-ink p-4">
          <p className="text-sm">No entries for this object</p>
        </div>
      ) : (
        <div className="p-3">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-map-border" />

            {/* Timeline entries */}
            <div className="space-y-3">
              {sortedEntries.map((entry) => {
                const isSelected = entry.id === selectedEntryId;

                return (
                  <div
                    key={entry.id}
                    className="relative pl-8 cursor-pointer"
                    onClick={() => onEntryClick?.(entry)}
                  >
                    {/* Timeline dot */}
                    <div
                      className={`absolute left-2 w-3 h-3 rounded-full border-2 ${
                        isSelected
                          ? 'bg-colonial-gold border-colonial-gold'
                          : 'bg-parchment border-map-border'
                      }`}
                    />

                    {/* Entry card - Compact */}
                    <div
                      className={`bg-parchment rounded p-2 shadow border transition-all ${
                        isSelected
                          ? 'border-colonial-gold transform scale-105'
                          : 'border-map-border hover:border-colonial-brown hover:transform hover:scale-102'
                      }`}
                    >
                      {/* Date - Compact */}
                      <div className="text-[10px] font-semibold text-colonial-red mb-1">
                        {formatDate(entry.startDate)}
                      </div>

                      {/* Location - Compact */}
                      <p className="text-[10px] text-aged-ink mb-1 line-clamp-1">
                        {entry.locationName}
                      </p>

                      {/* Description preview */}
                      <p className="text-[10px] text-colonial-brown line-clamp-2">
                        {entry.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
