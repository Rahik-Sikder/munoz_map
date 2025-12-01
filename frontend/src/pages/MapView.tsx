import { useState, useEffect, useMemo, useCallback } from 'react';
import LeafletMap from '../components/Map';
import ObjectWindow from '../components/ObjectWindow';
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

  // Object state
  const [objects, setObjects] = useState<HistoricalObject[]>([]);
  const [selectedObject, setSelectedObject] = useState<HistoricalObject | null>(null);
  const [showObjectBrowser, setShowObjectBrowser] = useState(true);
  const [showTimeline, setShowTimeline] = useState(false);

  // Selected entry state (for single entry window and marker/timeline selection)
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);

  // Map target state (for zooming to entry locations)
  const [mapTarget, setMapTarget] = useState<{lat: number, lng: number, zoom: number} | null>(null);

  // Window minimization state (only for ObjectBrowser and ObjectWindow)
  const [minimizedWindows, setMinimizedWindows] = useState<Set<string>>(new Set());

  // Window positions/sizes state
  // ObjectBrowser: persisted (remembers position/size)
  const [objectBrowserPosition, setObjectBrowserPosition] = useState<{ x: number; y: number } | null>(null);
  const [objectBrowserSize, setObjectBrowserSize] = useState<{ width: number; height: number } | null>(null);

  // ObjectWindow: temporary (allows dragging while open, but resets when closed)
  const [objectWindowPosition, setObjectWindowPosition] = useState<{ x: number; y: number } | null>(null);
  const [objectWindowSize, setObjectWindowSize] = useState<{ width: number; height: number } | null>(null);

  // Timeline: temporary (allows dragging while open, but resets when closed)
  const [timelinePosition, setTimelinePosition] = useState<{ x: number; y: number } | null>(null);
  const [timelineSize, setTimelineSize] = useState<{ width: number; height: number } | null>(null);

  // Entry Window: temporary (allows dragging while open, but resets when closed)
  const [entryWindowPosition, setEntryWindowPosition] = useState<{ x: number; y: number } | null>(null);
  const [entryWindowSize, setEntryWindowSize] = useState<{ width: number; height: number } | null>(null);

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

  // Fetch all entries once on mount (no refetching when object selected)
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        setLoading(true);
        setError(null);

        // Always fetch all entries
        const data = await api.entries.getAll();
        setEntries(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch entries');
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, []); // Only run once on mount

  // Create object lookup map for O(1) access
  const objectsMap = useMemo(() => {
    const lookupMap = new Map<string, HistoricalObject>();
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

  // Filter entries by selected object (frontend filtering - no API call)
  const filteredEntries = useMemo(() => {
    if (selectedObject) {
      console.log('Filtering entries for object:', selectedObject.id, selectedObject.name);
      const filtered = entriesWithObjects.filter(entry => entry.objectId === selectedObject.id);
      console.log('Filtered entries count:', filtered.length);
      return filtered;
    }
    console.log('No object selected, showing all entries:', entriesWithObjects.length);
    return entriesWithObjects;
  }, [entriesWithObjects, selectedObject]);

  // Extract unique tags from all entries
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    entriesWithObjects.forEach((entry) => {
      entry.tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [entriesWithObjects]);

  // Entry window management
  const handleEntryClick = useCallback((entry: Entry) => {
    setSelectedEntry(entry);
    setMapTarget({
      lat: entry.location.latitude,
      lng: entry.location.longitude,
      zoom: 6  // Subtle zoom level
    });
  }, []);

  const handleCloseEntryWindow = useCallback(() => {
    setSelectedEntry(null);
    // Clear position/size state to reset to defaults on next open
    setEntryWindowPosition(null);
    setEntryWindowSize(null);
    setMapTarget(null);
  }, []);

  // Object selection
  const handleObjectSelect = useCallback((object: HistoricalObject) => {
    setSelectedObject(object);
    setMapTarget(null);
  }, []);

  const handleViewObjectFromEntry = useCallback((object: HistoricalObject) => {
    setSelectedObject(object);
    setShowTimeline(true); // Show timeline when viewing object from entry
    setMapTarget(null);
  }, []);

  const handleToggleObjectBrowser = useCallback(() => {
    setShowObjectBrowser((prev) => !prev);
  }, []);

  const handleToggleTimeline = useCallback(() => {
    setShowTimeline((prev) => !prev);
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
      case 'objectWindow':
        setSelectedObject(null); // Deselect object (closes both windows)
        setShowTimeline(false); // Hide timeline
        setObjectWindowPosition(null); // Reset position to default
        setObjectWindowSize(null); // Reset size to default
        setTimelinePosition(null); // Also reset timeline position
        setTimelineSize(null); // Also reset timeline size
        break;
      case 'timeline':
        setShowTimeline(false); // Hide timeline only
        setTimelinePosition(null); // Reset position to default
        setTimelineSize(null); // Reset size to default
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

  // ObjectBrowser position/size handlers (persisted)
  const handleObjectBrowserPositionChange = useCallback(
    (position: { x: number; y: number }) => {
      setObjectBrowserPosition(position);
    },
    []
  );

  const handleObjectBrowserSizeChange = useCallback(
    (size: { width: number; height: number }) => {
      setObjectBrowserSize(size);
    },
    []
  );

  // ObjectWindow position/size handlers (temporary)
  const handleObjectWindowPositionChange = useCallback(
    (position: { x: number; y: number }) => {
      setObjectWindowPosition(position);
    },
    []
  );

  const handleObjectWindowSizeChange = useCallback(
    (size: { width: number; height: number }) => {
      setObjectWindowSize(size);
    },
    []
  );

  // Timeline position/size handlers (temporary)
  const handleTimelinePositionChange = useCallback(
    (position: { x: number; y: number }) => {
      setTimelinePosition(position);
    },
    []
  );

  const handleTimelineSizeChange = useCallback(
    (size: { width: number; height: number }) => {
      setTimelineSize(size);
    },
    []
  );

  // Entry window position/size handlers (temporary)
  const handleEntryWindowPositionChange = useCallback(
    (position: { x: number; y: number }) => {
      setEntryWindowPosition(position);
    },
    []
  );

  const handleEntryWindowSizeChange = useCallback(
    (size: { width: number; height: number }) => {
      setEntryWindowSize(size);
    },
    []
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

    if (isWindowMinimized('objectWindow') && selectedObject) {
      windows.push({
        id: 'objectWindow',
        title: selectedObject.name,
        icon: <span className="text-lg">📦</span>,
      });
    }

    if (isWindowMinimized('timeline') && selectedObject && showTimeline) {
      windows.push({
        id: 'timeline',
        title: `Timeline: ${selectedObject.name}`,
        icon: <span className="text-lg">📅</span>,
      });
    }

    return windows;
  }, [minimizedWindows, showObjectBrowser, selectedObject, showTimeline, isWindowMinimized]);

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
              HIS 346K Colonial Latin America Historical Map
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
          <LeafletMap
            entries={filteredEntries}
            selectedObjectId={selectedObject?.id}
            selectedEntryId={selectedEntry?.id}
            mapTarget={mapTarget}
            onEntryClick={handleEntryClick}
          />
        </div>

        {/* ObjectBrowser (replaces filters bar) */}
        {showObjectBrowser && !isWindowMinimized('objectBrowser') && (
          <FloatingWindow
            id="objectBrowser"
            position="top-left"
            customPosition={objectBrowserPosition || undefined}
            customSize={objectBrowserSize || undefined}
            onPositionChange={handleObjectBrowserPositionChange}
            onSizeChange={handleObjectBrowserSizeChange}
            width="384px"
            title="Historical Objects"
            onClose={() => handleCloseWindow('objectBrowser')}
            onMinimize={() => handleMinimizeWindow('objectBrowser')}
            showCloseButton={true}
            showMinimizeButton={true}
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

        {/* ObjectWindow (shows object info when object selected) */}
        {selectedObject && !isWindowMinimized('objectWindow') && (
          <FloatingWindow
            id="objectWindow"
            position="top-right"
            customPosition={objectWindowPosition || undefined}
            customSize={objectWindowSize || undefined}
            onPositionChange={handleObjectWindowPositionChange}
            onSizeChange={handleObjectWindowSizeChange}
            width="400px"
            height="450px"
            title={selectedObject.name}
            onClose={() => handleCloseWindow('objectWindow')}
            onMinimize={() => handleMinimizeWindow('objectWindow')}
            showCloseButton={true}
            showMinimizeButton={true}
            zIndex={10}
          >
            <ObjectWindow
              object={selectedObject}
              onToggleTimeline={handleToggleTimeline}
              showTimeline={showTimeline}
            />
          </FloatingWindow>
        )}

        {/* Timeline (shows timeline for selected object when enabled) */}
        {selectedObject && showTimeline && !isWindowMinimized('timeline') && (
          <FloatingWindow
            id="timeline"
            position="bottom-right"
            customPosition={timelinePosition || undefined}
            customSize={timelineSize || undefined}
            onPositionChange={handleTimelinePositionChange}
            onSizeChange={handleTimelineSizeChange}
            width="400px"
            height="400px"
            title={`Timeline: ${selectedObject.name}`}
            onClose={() => handleCloseWindow('timeline')}
            onMinimize={() => handleMinimizeWindow('timeline')}
            showCloseButton={true}
            showMinimizeButton={true}
            zIndex={10}
          >
            <Timeline
              entries={filteredEntries}
              selectedObject={selectedObject}
              selectedEntryId={selectedEntry?.id}
              onEntryClick={handleEntryClick}
            />
          </FloatingWindow>
        )}

        {/* Entry Window (single) */}
        {selectedEntry && (
          <FloatingWindow
            key={selectedEntry.id}
            id="entry-window"
            position="bottom-left"
            customPosition={entryWindowPosition || undefined}
            customSize={entryWindowSize || undefined}
            onPositionChange={handleEntryWindowPositionChange}
            onSizeChange={handleEntryWindowSizeChange}
            width="500px"
            height="400px"
            title={selectedEntry.object?.name || 'Entry Detail'}
            onClose={handleCloseEntryWindow}
            showCloseButton={true}
            showMinimizeButton={false}
            zIndex={20}
          >
            <EntryDetail
              entry={selectedEntry}
              onViewObjectTimeline={handleViewObjectFromEntry}
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
