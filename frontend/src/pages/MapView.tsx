import { useState, useEffect, useMemo, useCallback } from 'react';
import Map from '../components/Map';
import Timeline from '../components/Timeline';
import EntryDetail from '../components/EntryDetail';
import FloatingWindow from '../components/FloatingWindow';
import WindowBar from '../components/WindowBar';
import ObjectBrowser from '../components/ObjectBrowser';
import { api } from '../api/client';
import type { Entry, HistoricalObject } from '../types';

export default function MapView() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);

  // Object state
  const [objects, setObjects] = useState<HistoricalObject[]>([]);
  const [selectedObject, setSelectedObject] = useState<HistoricalObject | null>(null);
  const [showObjectBrowser, setShowObjectBrowser] = useState(true);

  // Window minimization state
  const [minimizedWindows, setMinimizedWindows] = useState<Set<string>>(new Set());

  // Fetch all objects on mount
  useEffect(() => {
    const fetchObjects = async () => {
      try {
        const data = await api.objects.getAll();
        setObjects(data);
      } catch (err) {
        console.error('Failed to fetch objects:', err);
        // Don't show error UI, just log - objects are optional feature
      }
    };

    fetchObjects();
  }, []);

  // Fetch entries - all entries or filtered by selected object
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        setLoading(true);
        setError(null);

        if (selectedObject) {
          // Fetch entries for selected object
          const data = await api.entries.getByObjectId(selectedObject.id);
          setEntries(data);
        } else {
          // Fetch all entries when no object selected
          const data = await api.entries.getAll();
          setEntries(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch entries');
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, [selectedObject]);

  // Create object lookup map for O(1) access
  const objectsMap = useMemo(() => {
    const lookupMap = new globalThis.Map<string, HistoricalObject>();
    objects.forEach((obj) => lookupMap.set(obj.id, obj));
    return lookupMap;
  }, [objects]);

  // Populate entry.object field for entries that don't have it
  const entriesWithObjects = useMemo(() => {
    return entries.map((entry) => ({
      ...entry,
      object: entry.object || objectsMap.get(entry.objectId),
    }));
  }, [entries, objectsMap]);

  // Extract unique tags from all entries
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    entriesWithObjects.forEach((entry) => {
      entry.tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [entriesWithObjects]);

  // Entry selection
  const handleEntryClick = useCallback((entry: Entry) => {
    setSelectedEntry(entry);
  }, []);

  // Object selection
  const handleObjectSelect = useCallback((object: HistoricalObject) => {
    setSelectedObject(object);
    setSelectedEntry(null); // Clear entry selection when object changes
  }, []);

  const handleClearObjectSelection = useCallback(() => {
    setSelectedObject(null);
  }, []);

  const handleViewObjectTimeline = useCallback((object: HistoricalObject) => {
    setSelectedObject(object);
    // Keep selectedEntry as-is (don't clear)
  }, []);

  const handleToggleObjectBrowser = useCallback(() => {
    setShowObjectBrowser((prev) => !prev);
  }, []);

  // Window management
  const handleMinimizeWindow = useCallback((windowId: string) => {
    setMinimizedWindows((prev) => new Set(prev).add(windowId));
  }, []);

  const handleRestoreWindow = useCallback((windowId: string) => {
    setMinimizedWindows((prev) => {
      const next = new Set(prev);
      next.delete(windowId);
      return next;
    });
  }, []);

  const handleCloseWindow = useCallback((windowId: string) => {
    // Handle window-specific close logic
    switch (windowId) {
      case 'objectBrowser':
        setShowObjectBrowser(false);
        break;
      case 'timeline':
        setSelectedObject(null); // Closing timeline clears object selection
        break;
      case 'entryDetail':
        setSelectedEntry(null);
        break;
    }
    // Also remove from minimized set if it was minimized
    setMinimizedWindows((prev) => {
      const next = new Set(prev);
      next.delete(windowId);
      return next;
    });
  }, []);

  // Helper to check if window is minimized
  const isWindowMinimized = useCallback(
    (windowId: string) => minimizedWindows.has(windowId),
    [minimizedWindows]
  );

  // Compute minimized windows array for WindowBar
  const minimizedWindowsList = useMemo(() => {
    const windows: Array<{
      id: string;
      title: string;
      icon?: React.ReactNode;
    }> = [];

    if (isWindowMinimized('objectBrowser') && showObjectBrowser) {
      windows.push({
        id: 'objectBrowser',
        title: 'Historical Objects',
        icon: <span className="text-lg">🗺️</span>,
      });
    }

    if (isWindowMinimized('timeline') && selectedObject) {
      windows.push({
        id: 'timeline',
        title: `Timeline: ${selectedObject.name}`,
        icon: <span className="text-lg">📅</span>,
      });
    }

    if (isWindowMinimized('entryDetail') && selectedEntry) {
      windows.push({
        id: 'entryDetail',
        title: selectedEntry.object?.name || 'Entry Detail',
        icon: <span className="text-lg">📄</span>,
      });
    }

    return windows;
  }, [minimizedWindows, showObjectBrowser, selectedObject, selectedEntry, isWindowMinimized]);

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
              <button
                onClick={handleToggleObjectBrowser}
                className="px-4 py-2 bg-colonial-blue text-parchment rounded hover:bg-aged-green transition-colors text-sm font-semibold"
              >
                {showObjectBrowser ? 'Hide' : 'Show'} Object Browser
              </button>
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

      {/* Main Content Area - Map with Floating Panels */}
      <div className="flex-1 relative">
        {/* Full-screen Map */}
        <div className="absolute inset-0 z-0">
          <Map
            entries={entriesWithObjects}
            selectedObjectId={selectedObject?.id}
            onEntryClick={handleEntryClick}
          />
        </div>

        {/* ObjectBrowser (replaces filters bar) */}
        {showObjectBrowser && !isWindowMinimized('objectBrowser') && (
          <FloatingWindow
            id="objectBrowser"
            position="top-left"
            width="w-96"
            maxHeight="max-h-[calc(100vh-10rem)]"
            title="Historical Objects"
            onClose={() => handleCloseWindow('objectBrowser')}
            onMinimize={() => handleMinimizeWindow('objectBrowser')}
            showCloseButton={true}
            showMinimizeButton={true}
            icon={<span className="text-lg">🗺️</span>}
            zIndex={10}
          >
            <ObjectBrowser
              objects={objects}
              selectedObjectId={selectedObject?.id}
              onObjectSelect={handleObjectSelect}
              availableTags={availableTags}
            />
          </FloatingWindow>
        )}

        {/* Timeline (only when object selected) */}
        {selectedObject && !isWindowMinimized('timeline') && (
          <FloatingWindow
            id="timeline"
            position="top-right"
            width="w-80"
            maxHeight="max-h-[calc(100vh-10rem)]"
            title={`Timeline: ${selectedObject.name}`}
            onClose={() => handleCloseWindow('timeline')}
            onMinimize={() => handleMinimizeWindow('timeline')}
            showCloseButton={true}
            showMinimizeButton={true}
            icon={<span className="text-lg">📅</span>}
            zIndex={10}
          >
            <Timeline
              entries={entriesWithObjects}
              selectedObject={selectedObject}
              onEntryClick={handleEntryClick}
              selectedEntryId={selectedEntry?.id}
              onClearObjectSelection={handleClearObjectSelection}
            />
          </FloatingWindow>
        )}

        {/* EntryDetail (when entry selected) */}
        {selectedEntry && !isWindowMinimized('entryDetail') && (
          <FloatingWindow
            id="entryDetail"
            position="bottom-left"
            width="w-96"
            maxHeight="max-h-[calc(100vh-10rem)]"
            title={selectedEntry.object?.name || 'Entry Detail'}
            onClose={() => handleCloseWindow('entryDetail')}
            onMinimize={() => handleMinimizeWindow('entryDetail')}
            showCloseButton={true}
            showMinimizeButton={true}
            icon={<span className="text-lg">📄</span>}
            zIndex={20}
          >
            <EntryDetail
              entry={selectedEntry}
              onClose={() => setSelectedEntry(null)}
              onViewObjectTimeline={handleViewObjectTimeline}
            />
          </FloatingWindow>
        )}
      </div>

      {/* WindowBar at bottom - only visible when windows are minimized */}
      {minimizedWindowsList.length > 0 && (
        <WindowBar
          minimizedWindows={minimizedWindowsList}
          onRestore={handleRestoreWindow}
        />
      )}
    </div>
  );
}
