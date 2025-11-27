import { useState, useEffect } from 'react';
import { api } from '../api/client';
import type { HistoricalObject, Entry } from '../types';

type TabType = 'objects' | 'entries';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<TabType>('objects');
  const [objects, setObjects] = useState<HistoricalObject[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [objectsData, entriesData] = await Promise.all([
        api.objects.getAll(),
        api.entries.getAll(),
      ]);
      setObjects(objectsData);
      setEntries(entriesData);
    } catch (error) {
      showMessage('error', 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleDeleteObject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this object?')) return;

    try {
      await api.objects.delete(id);
      setObjects(objects.filter((obj) => obj.id !== id));
      showMessage('success', 'Object deleted successfully');
    } catch (error) {
      showMessage('error', 'Failed to delete object');
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
      await api.entries.delete(id);
      setEntries(entries.filter((entry) => entry.id !== id));
      showMessage('success', 'Entry deleted successfully');
    } catch (error) {
      showMessage('error', 'Failed to delete entry');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-parchment">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-colonial-brown border-t-transparent mx-auto mb-4" />
          <p className="text-colonial-brown font-serif">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-parchment">
      {/* Header */}
      <header className="bg-colonial-brown text-parchment shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-serif font-bold">Admin Panel</h1>
            <a
              href="/"
              className="px-4 py-2 bg-colonial-gold text-ink-black rounded hover:bg-aged-paper transition-colors text-sm font-semibold"
            >
              Back to Map
            </a>
          </div>
        </div>
      </header>

      {/* Message Banner */}
      {message && (
        <div
          className={`container mx-auto px-4 py-3 mt-4 rounded ${
            message.type === 'success'
              ? 'bg-aged-green text-parchment'
              : 'bg-colonial-red text-parchment'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b-2 border-map-border">
          <button
            onClick={() => setActiveTab('objects')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'objects'
                ? 'text-colonial-brown border-b-4 border-colonial-brown'
                : 'text-aged-ink hover:text-colonial-brown'
            }`}
          >
            Historical Objects ({objects.length})
          </button>
          <button
            onClick={() => setActiveTab('entries')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'entries'
                ? 'text-colonial-brown border-b-4 border-colonial-brown'
                : 'text-aged-ink hover:text-colonial-brown'
            }`}
          >
            Entries ({entries.length})
          </button>
        </div>

        {/* Objects Tab */}
        {activeTab === 'objects' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-serif font-bold text-colonial-brown">
                Historical Objects
              </h2>
              <button className="px-4 py-2 bg-colonial-blue text-parchment rounded hover:bg-colonial-brown transition-colors">
                Add New Object
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {objects.map((object) => (
                <div
                  key={object.id}
                  className="bg-aged-paper border-2 border-map-border rounded-lg p-4 hover:shadow-lg transition-shadow"
                >
                  {object.imageUrl && (
                    <img
                      src={object.imageUrl}
                      alt={object.name}
                      className="w-full h-48 object-cover rounded mb-3"
                    />
                  )}
                  <h3 className="font-serif font-bold text-colonial-brown mb-2">
                    {object.name}
                  </h3>
                  <span className="inline-block bg-colonial-blue text-parchment px-2 py-1 rounded text-xs mb-2">
                    {object.type}
                  </span>
                  <p className="text-sm text-ink-black line-clamp-3 mb-3">
                    {object.description}
                  </p>
                  <div className="flex gap-2">
                    <button className="flex-1 px-3 py-1 bg-colonial-gold text-ink-black rounded hover:bg-aged-paper transition-colors text-sm">
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteObject(object.id)}
                      className="flex-1 px-3 py-1 bg-colonial-red text-parchment rounded hover:bg-sepia transition-colors text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {objects.length === 0 && (
              <div className="text-center py-12 text-aged-ink">
                <p>No objects yet. Create your first historical object!</p>
              </div>
            )}
          </div>
        )}

        {/* Entries Tab */}
        {activeTab === 'entries' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-serif font-bold text-colonial-brown">
                Historical Entries
              </h2>
              <button className="px-4 py-2 bg-colonial-blue text-parchment rounded hover:bg-colonial-brown transition-colors">
                Add New Entry
              </button>
            </div>

            <div className="space-y-4">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-aged-paper border-2 border-map-border rounded-lg p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-serif font-bold text-colonial-brown mb-1">
                        {entry.object?.name || 'Unknown Object'}
                      </h3>
                      <p className="text-sm text-aged-ink mb-2">
                        {entry.locationName} ({entry.location.latitude.toFixed(4)}°,{' '}
                        {entry.location.longitude.toFixed(4)}°)
                      </p>
                      <p className="text-xs text-sepia mb-2">
                        {new Date(entry.startDate).toLocaleDateString()}
                        {entry.endDate &&
                          ` - ${new Date(entry.endDate).toLocaleDateString()}`}
                      </p>
                      <p className="text-sm text-ink-black line-clamp-2 mb-2">
                        {entry.description}
                      </p>
                      {entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {entry.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-colonial-blue text-parchment px-2 py-0.5 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button className="px-3 py-1 bg-colonial-gold text-ink-black rounded hover:bg-aged-paper transition-colors text-sm">
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="px-3 py-1 bg-colonial-red text-parchment rounded hover:bg-sepia transition-colors text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {entries.length === 0 && (
              <div className="text-center py-12 text-aged-ink">
                <p>No entries yet. Create your first historical entry!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
