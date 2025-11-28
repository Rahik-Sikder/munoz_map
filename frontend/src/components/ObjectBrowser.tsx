import { useState, useMemo } from 'react';
import type { HistoricalObject, ObjectType } from '../types';

interface ObjectBrowserProps {
  objects: HistoricalObject[];
  selectedObjectId?: string;
  onObjectSelect: (object: HistoricalObject) => void;
  availableTags: string[];
}

const OBJECT_TYPES: ObjectType[] = [
  'person',
  'place',
  'artifact',
  'event',
  'institution',
  'other',
];

export default function ObjectBrowser({
  objects,
  selectedObjectId,
  onObjectSelect,
}: ObjectBrowserProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<ObjectType | null>(null);

  // Filter objects based on search and type
  const filteredObjects = useMemo(() => {
    return objects.filter((obj) => {
      const matchesSearch =
        !searchTerm ||
        obj.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        obj.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = !typeFilter || obj.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [objects, searchTerm, typeFilter]);

  return (
    <div className="h-full flex flex-col bg-parchment">
      {/* Search */}
      <div className="p-3 border-b border-map-border">
        <input
          type="text"
          placeholder="Search objects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border-2 border-map-border rounded focus:outline-none focus:border-colonial-brown bg-aged-paper text-sm"
        />
      </div>

      {/* Type Filters */}
      <div className="p-3 border-b border-map-border">
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setTypeFilter(null)}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              !typeFilter
                ? 'bg-colonial-blue text-parchment'
                : 'bg-aged-paper text-colonial-brown border border-map-border hover:bg-white'
            }`}
          >
            All
          </button>
          {OBJECT_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-2 py-1 rounded text-xs capitalize transition-colors ${
                typeFilter === type
                  ? 'bg-colonial-blue text-parchment'
                  : 'bg-aged-paper text-colonial-brown border border-map-border hover:bg-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Object List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredObjects.length === 0 ? (
          <div className="text-center text-aged-ink py-8">
            <p className="text-sm">No objects found</p>
          </div>
        ) : (
          filteredObjects.map((obj) => (
            <div
              key={obj.id}
              onClick={() => onObjectSelect(obj)}
              className={`p-3 rounded cursor-pointer transition-all border-2 ${
                obj.id === selectedObjectId
                  ? 'border-colonial-gold bg-aged-paper shadow-md'
                  : 'border-map-border bg-white hover:border-colonial-brown hover:shadow-md'
              }`}
            >
              <div className="flex gap-3">
                {/* Thumbnail */}
                {obj.imageUrl && (
                  <img
                    src={obj.imageUrl}
                    alt={obj.name}
                    className="w-12 h-12 object-cover rounded border border-map-border flex-shrink-0"
                  />
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-serif font-bold text-sm text-colonial-brown truncate">
                    {obj.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-block bg-colonial-blue text-parchment px-1.5 py-0.5 rounded text-[9px] capitalize">
                      {obj.type}
                    </span>
                    <span className="text-[10px] text-aged-ink">
                      {obj.entryIds.length}{' '}
                      {obj.entryIds.length === 1 ? 'entry' : 'entries'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
