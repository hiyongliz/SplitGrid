import React, { useEffect, useState } from 'react';
import { GridConfig } from '../types';

interface GridOverlayProps {
  imageSrc: string;
  config: GridConfig;
  onGridDrag?: (type: 'row' | 'col', index: number, newPos: number) => void;
}

const GridOverlay: React.FC<GridOverlayProps> = ({ imageSrc, config, onGridDrag }) => {
  const [aspectRatio, setAspectRatio] = useState<number>(1);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<{ type: 'row' | 'col', index: number } | null>(null);

  // Load image to determine aspect ratio
  useEffect(() => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      setAspectRatio(img.width / img.height);
    };
  }, [imageSrc]);

  // Calculate positions (use config or default equal distribution)
  const rowPositions = config.rows > 0
    ? (config.rowPositions || Array.from({ length: config.rows - 1 }, (_, i) => ((i + 1) / config.rows) * 100))
    : [];
  const colPositions = config.cols > 0
    ? (config.colPositions || Array.from({ length: config.cols - 1 }, (_, i) => ((i + 1) / config.cols) * 100))
    : [];

  const handleMouseDown = (e: React.MouseEvent, type: 'row' | 'col', index: number) => {
    e.preventDefault();
    setDragging({ type, index });
  };

  const handleMouseMove = React.useCallback((e: MouseEvent) => {
    if (!dragging || !containerRef.current || !onGridDrag) return;

    const rect = containerRef.current.getBoundingClientRect();
    let newPos = 0;

    if (dragging.type === 'row') {
      const relativeY = e.clientY - rect.top;
      newPos = (relativeY / rect.height) * 100;
    } else {
      const relativeX = e.clientX - rect.left;
      newPos = (relativeX / rect.width) * 100;
    }

    // Clamp between 0 and 100
    newPos = Math.max(0, Math.min(100, newPos));

    onGridDrag(dragging.type, dragging.index, newPos);
  }, [dragging, onGridDrag]);

  const handleMouseUp = React.useCallback(() => {
    setDragging(null);
  }, []);

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, handleMouseMove, handleMouseUp]);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-slate-900/50 rounded-lg overflow-hidden border border-slate-700 shadow-xl select-none">
      <div
        ref={containerRef}
        className="relative inline-block max-w-full max-h-[60vh]"
      >
        <img
          src={imageSrc}
          alt="Source"
          className="block max-w-full max-h-[60vh] object-contain pointer-events-none"
        />

        {/* Grid Overlay */}
        <div className="absolute inset-0">
          {/* Rows */}
          {rowPositions.map((pos, i) => (
            <div
              key={`row-${i}`}
              className="absolute w-full h-1 -mt-0.5 cursor-row-resize group z-10 hover:z-20"
              style={{ top: `${pos}%` }}
              onMouseDown={(e) => handleMouseDown(e, 'row', i)}
            >
              <div className="w-full h-px bg-indigo-500/70 shadow-[0_0_5px_rgba(99,102,241,0.5)] group-hover:bg-indigo-400 group-hover:h-0.5 transition-all" />
            </div>
          ))}
          {/* Cols */}
          {colPositions.map((pos, i) => (
            <div
              key={`col-${i}`}
              className="absolute h-full w-1 -ml-0.5 cursor-col-resize group z-10 hover:z-20"
              style={{ left: `${pos}%` }}
              onMouseDown={(e) => handleMouseDown(e, 'col', i)}
            >
              <div className="h-full w-px bg-indigo-500/70 shadow-[0_0_5px_rgba(99,102,241,0.5)] group-hover:bg-indigo-400 group-hover:w-0.5 transition-all" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GridOverlay;
