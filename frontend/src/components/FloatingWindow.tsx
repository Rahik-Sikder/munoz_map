import { useState, useRef, useEffect, type ReactNode, type MouseEvent } from 'react';

interface FloatingWindowProps {
  children: ReactNode;
  id: string;
  title: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  customPosition?: { x: number; y: number };
  width?: string;
  height?: string;
  customSize?: { width: number; height: number };
  onPositionChange?: (position: { x: number; y: number }) => void;
  onSizeChange?: (size: { width: number; height: number }) => void;
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
  customPosition,
  width = 'w-80',
  height,
  customSize,
  onPositionChange,
  onSizeChange,
  onClose,
  showCloseButton = true,
  onMinimize,
  showMinimizeButton = true,
  icon,
  headerContent,
  zIndex = 10,
  className = '',
}: FloatingWindowProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  // Position mapping for initial positions
  const positionPresets = {
    'top-left': { x: 24, y: 24 },
    'top-right': { x: window.innerWidth - 400, y: 24 },
    'bottom-left': { x: 24, y: window.innerHeight - 500 },
    'bottom-right': { x: window.innerWidth - 400, y: window.innerHeight - 500 },
  };

  // Use custom position if provided, otherwise use preset
  const currentPosition = customPosition || positionPresets[position];

  // Default sizes (convert Tailwind classes to pixels)
  const defaultWidth = 320; // w-80 = 320px
  const defaultHeight = 400;
  const currentSize = customSize || { width: defaultWidth, height: defaultHeight };

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    // Only start drag if clicking on header (not buttons)
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }

    setIsDragging(true);
    setDragOffset({
      x: e.clientX - currentPosition.x,
      y: e.clientY - currentPosition.y,
    });
  };

  const handleResizeMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: windowRef.current?.offsetWidth || currentSize.width,
      height: windowRef.current?.offsetHeight || currentSize.height,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: globalThis.MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;

        // Constrain to viewport
        const maxX = window.innerWidth - (windowRef.current?.offsetWidth || currentSize.width);
        const maxY = window.innerHeight - (windowRef.current?.offsetHeight || currentSize.height);

        const constrainedX = Math.max(0, Math.min(newX, maxX));
        const constrainedY = Math.max(0, Math.min(newY, maxY));

        onPositionChange?.({ x: constrainedX, y: constrainedY });
      }

      if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;

        const newWidth = Math.max(280, resizeStart.width + deltaX); // Min width 280px
        const newHeight = Math.max(200, resizeStart.height + deltaY); // Min height 200px

        // Constrain to viewport
        const maxWidth = window.innerWidth - currentPosition.x;
        const maxHeight = window.innerHeight - currentPosition.y;

        const constrainedWidth = Math.min(newWidth, maxWidth);
        const constrainedHeight = Math.min(newHeight, maxHeight);

        onSizeChange?.({ width: constrainedWidth, height: constrainedHeight });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, resizeStart, onPositionChange, onSizeChange, currentPosition]);

  // Calculate staggered offset from className if present
  const staggerMatch = className.match(/translate-x-(\d+)/);
  const staggerOffset = staggerMatch ? parseInt(staggerMatch[1]) : 0;

  return (
    <div
      ref={windowRef}
      id={`floating-window-${id}`}
      className={`absolute bg-parchment border-2 border-map-border rounded-2xl shadow-2xl flex flex-col overflow-hidden ${
        isDragging ? 'cursor-grabbing' : ''
      }`}
      style={{
        zIndex,
        left: `${currentPosition.x + staggerOffset}px`,
        top: `${currentPosition.y + staggerOffset}px`,
        width: customSize ? `${currentSize.width}px` : width,
        height: customSize ? `${currentSize.height}px` : height || 'auto',
        maxHeight: customSize ? 'none' : '90vh',
      }}
    >
      {/* Header - Draggable */}
      <div
        className={`px-4 py-3 bg-colonial-brown text-parchment border-b-2 border-map-border flex items-center justify-between ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        onMouseDown={handleMouseDown}
      >
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

      {/* Resize Handle - Bottom Right Corner */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize group"
        onMouseDown={handleResizeMouseDown}
      >
        <div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 border-colonial-brown opacity-40 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}
