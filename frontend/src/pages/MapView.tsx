import { useState, useEffect, useMemo, useCallback } from 'react';
import Map from '../components/Map';
import Timeline from '../components/Timeline';
import EntryDetail from '../components/EntryDetail';
import ObjectFilter from '../components/ObjectFilter';
import { api } from '../api/client';
import type { Entry, EntryFilters } from '../types';

export default function MapView() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [filters, setFilters] = useState<EntryFilters>({});

  // Fetch entries from API
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.entries.getAll(filters);
        setEntries(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch entries');
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, [filters]);

  // Extract unique tags from all entries
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    entries.forEach((entry) => {
      entry.tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [entries]);

  // Filter entries based on client-side filters
  const filteredEntries = useMemo(() => {
    let filtered = entries;

    // Client-side search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (entry) =>
          entry.object?.name.toLowerCase().includes(searchLower) ||
          entry.locationName.toLowerCase().includes(searchLower) ||
          entry.description.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [entries, filters]);

  const handleEntryClick = useCallback((entry: Entry) => {
    setSelectedEntry(entry);
  }, []);

  const handleFilterChange = useCallback((newFilters: EntryFilters) => {
    setFilters(newFilters);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-parchment">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-colonial-brown border-t-transparent mx-auto mb-4" />
          <p className="text-colonial-brown font-serif">Loading historical data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-parchment">
        <div className="text-center max-w-md p-6 bg-aged-paper border-2 border-colonial-red rounded-lg">
          <h2 className="text-xl font-serif font-bold text-colonial-red mb-2">
            Error Loading Data
          </h2>
          <p className="text-ink-black">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-colonial-brown text-parchment rounded hover:bg-sepia transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-parchment">
      {/* Header */}
      <header className="bg-colonial-brown text-parchment shadow-lg z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-serif font-bold">
              Colonial Latin America Historical Map
            </h1>
            <div className="flex gap-2">
              <a
                href="/admin"
                className="px-4 py-2 bg-colonial-gold text-ink-black rounded hover:bg-aged-paper transition-colors text-sm font-semibold"
              >
                Admin Panel
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Filters Bar - Compact */}
      <div className="bg-aged-paper border-b-2 border-map-border p-2 z-20">
        <ObjectFilter
          onFilterChange={handleFilterChange}
          availableTags={availableTags}
        />
      </div>

      {/* Main Content Area - Map with Floating Panels */}
      <div className="flex-1 relative">
        {/* Full-screen Map */}
        <div className="absolute inset-0 z-0 w-full h-full">
          <Map
            entries={filteredEntries}
            onEntryClick={handleEntryClick}
          />
        </div>

        {/* Floating Timeline - Right Side - Compact */}
        <div className="absolute top-6 right-6 w-72 max-h-96 bg-white border-2 border-map-border rounded-2xl shadow-2xl z-10 flex flex-col overflow-hidden">
          {/* Timeline Header */}
          <div className="px-4 py-3 bg-colonial-brown text-parchment border-b-2 border-map-border flex items-center justify-between">
            <h3 className="font-serif font-bold text-sm">Timeline</h3>
            <span className="text-xs">
              {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>

          {/* Timeline Content - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            <Timeline
              entries={filteredEntries}
              onEntryClick={handleEntryClick}
              selectedEntryId={selectedEntry?.id}
            />
          </div>
        </div>

        {/* Floating Detail Panel - Left Side (appears when entry selected) - Smaller */}
        {selectedEntry && (
          <div className="absolute top-6 left-6 w-80 max-h-[calc(100%-3rem)] bg-parchment border-2 border-colonial-gold rounded-2xl shadow-2xl z-20 overflow-hidden">
            <EntryDetail
              entry={selectedEntry}
              onClose={() => setSelectedEntry(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
