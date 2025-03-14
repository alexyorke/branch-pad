"use client";

import { ReactNode, useState, useRef, useEffect } from "react";

interface ZoomableCanvasProps {
  children: ReactNode;
}

export function ZoomableCanvas({ children }: ZoomableCanvasProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle mouse wheel for zooming
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();

    // Calculate new scale with limits
    const delta = -e.deltaY * 0.001;
    const newScale = Math.min(Math.max(scale + delta, 0.25), 2);

    // Get mouse position relative to container
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculate new position to zoom toward mouse cursor
    const newPosition = {
      x: position.x - ((mouseX - position.x) * (newScale - scale)) / newScale,
      y: position.y - ((mouseY - position.y) * (newScale - scale)) / newScale,
    };

    setScale(newScale);
    setPosition(newPosition);
  };

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only start dragging on middle mouse button or when holding space
    if (e.button === 1 || e.altKey) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  // Handle mouse move for dragging
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    setPosition({
      x: position.x + dx,
      y: position.y + dy,
    });

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  // Handle mouse up to stop dragging
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Reset zoom and position with "R" key
      if (e.key === "r") {
        setScale(1);
        setPosition({ x: 0, y: 0 });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: isDragging ? "grabbing" : "default" }}
    >
      <div
        className="absolute transition-transform duration-100 ease-out"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: "0 0",
        }}
      >
        {children}
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 bg-background/80 backdrop-blur-sm p-2 rounded-lg shadow-md border border-border">
        <button
          onClick={() => setScale(Math.min(scale + 0.1, 2))}
          className="w-8 h-8 flex items-center justify-center rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground"
          title="Zoom in"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
        <button
          onClick={() => setScale(Math.max(scale - 0.1, 0.25))}
          className="w-8 h-8 flex items-center justify-center rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground"
          title="Zoom out"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
        <button
          onClick={() => {
            setScale(1);
            setPosition({ x: 0, y: 0 });
          }}
          className="w-8 h-8 flex items-center justify-center rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground"
          title="Reset view"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          </svg>
        </button>
      </div>

      {/* Zoom level indicator */}
      <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-lg text-sm text-secondary-foreground/80 border border-border">
        {Math.round(scale * 100)}%
      </div>
    </div>
  );
}
