import type { ReactNode } from 'react';

export interface MinimizedWindow {
  id: string;
  title: string;
  icon?: ReactNode;
}

interface WindowBarProps {
  minimizedWindows: MinimizedWindow[];
  onRestore: (windowId: string) => void;
}

export default function WindowBar({
  minimizedWindows,
  onRestore,
}: WindowBarProps) {
  if (minimizedWindows.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-colonial-brown/70 border-t-2 border-map-border z-50">
      <div className="flex gap-2 px-4 py-2">
        {minimizedWindows.map((window) => (
          <button
            key={window.id}
            onClick={() => onRestore(window.id)}
            className="flex items-center gap-2 px-4 py-2 bg-aged-paper border border-map-border rounded hover:bg-parchment transition-colors"
            title={`Restore ${window.title}`}
          >
            {window.icon}
            <span className="text-sm font-semibold text-colonial-brown">
              {window.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
