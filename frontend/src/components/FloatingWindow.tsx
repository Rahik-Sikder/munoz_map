import type { ReactNode } from 'react';

interface FloatingWindowProps {
  children: ReactNode;
  id: string;
  title: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  width?: string;
  maxHeight?: string;
  onClose?: () => void;
  showCloseButton?: boolean;
  onMinimize?: () => void;
  showMinimizeButton?: boolean;
  icon?: ReactNode;
  headerContent?: ReactNode;
  zIndex?: number;
  className?: string;
}

export default function FloatingWindow({
  children,
  id,
  title,
  position = 'top-right',
  width = 'w-80',
  maxHeight = 'max-h-96',
  onClose,
  showCloseButton = true,
  onMinimize,
  showMinimizeButton = true,
  icon,
  headerContent,
  zIndex = 10,
  className = '',
}: FloatingWindowProps) {
  // Position mapping
  const positionClasses = {
    'top-left': 'top-6 left-6',
    'top-right': 'top-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'bottom-right': 'bottom-6 right-6',
  };

  const positionClass = positionClasses[position];

  return (
    <div
      id={`floating-window-${id}`}
      className={`absolute ${positionClass} ${width} ${maxHeight} bg-parchment border-2 border-map-border rounded-2xl shadow-2xl flex flex-col overflow-hidden ${className}`}
      style={{ zIndex }}
    >
      {/* Header */}
      <div className="px-4 py-3 bg-colonial-brown text-parchment border-b-2 border-map-border flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <h3 className="font-serif font-bold text-sm truncate">{title}</h3>
          {headerContent && <div className="flex-shrink-0">{headerContent}</div>}
        </div>

        {/* Window controls */}
        <div className="flex items-center gap-2 ml-2 flex-shrink-0">
          {/* Minimize button */}
          {showMinimizeButton && onMinimize && (
            <button
              onClick={onMinimize}
              className="text-parchment hover:text-colonial-gold transition-colors"
              title="Minimize"
              aria-label="Minimize window"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 12H4"
                />
              </svg>
            </button>
          )}

          {/* Close button */}
          {showCloseButton && onClose && (
            <button
              onClick={onClose}
              className="text-parchment hover:text-colonial-gold transition-colors"
              title="Close"
              aria-label="Close window"
            >
              <svg
                className="w-5 h-5"
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
      </div>

      {/* Body - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
