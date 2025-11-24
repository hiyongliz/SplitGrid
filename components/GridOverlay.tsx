import React, { useEffect, useState } from 'react';
import { GridConfig } from '../types';

interface GridOverlayProps {
  imageSrc: string;
  config: GridConfig;
}

const GridOverlay: React.FC<GridOverlayProps> = ({ imageSrc, config }) => {
  const [aspectRatio, setAspectRatio] = useState<number>(1);

  // Load image to determine aspect ratio for container if needed,
  // but usually object-contain works well.
  useEffect(() => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      setAspectRatio(img.width / img.height);
    };
  }, [imageSrc]);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-slate-900/50 rounded-lg overflow-hidden border border-slate-700 shadow-xl">
      <div className="relative inline-block max-w-full max-h-[60vh]">
        <img
          src={imageSrc}
          alt="Source"
          className="block max-w-full max-h-[60vh] object-contain"
        />
        
        {/* Grid Overlay */}
        <div className="absolute inset-0 pointer-events-none">
            {/* Rows */}
            {Array.from({ length: config.rows - 1 }).map((_, i) => (
                <div
                    key={`row-${i}`}
                    className="absolute w-full border-t border-indigo-500/70 shadow-[0_0_5px_rgba(99,102,241,0.5)]"
                    style={{ top: `${((i + 1) / config.rows) * 100}%` }}
                />
            ))}
            {/* Cols */}
            {Array.from({ length: config.cols - 1 }).map((_, i) => (
                <div
                    key={`col-${i}`}
                    className="absolute h-full border-l border-indigo-500/70 shadow-[0_0_5px_rgba(99,102,241,0.5)]"
                    style={{ left: `${((i + 1) / config.cols) * 100}%` }}
                />
            ))}
        </div>
      </div>
    </div>
  );
};

export default GridOverlay;