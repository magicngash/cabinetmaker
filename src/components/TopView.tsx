import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

export const TopView: React.FC = () => {
  const { activeCabinet } = useProject();
  const [zoom, setZoom] = useState(1);

  const W = activeCabinet.width;
  const D = activeCabinet.depth;
  const T = activeCabinet.boardThickness;
  const BT = activeCabinet.backThickness;
  const backInset = activeCabinet.backInset || 16;

  const padX = 120;
  const padY = 80;
  const vbWidth = W + padX * 2;
  const vbHeight = D + padY * 2;

  const originX = padX;
  const originY = padY; // Back edge at top, front edge at bottom

  return (
    <div className="relative w-full h-full bg-slate-900 overflow-hidden select-none flex flex-col items-center justify-center">
      <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-slate-800/90 border border-slate-700/80 rounded-lg p-1.5 shadow-lg backdrop-blur">
        <button
          onClick={() => setZoom((z) => Math.min(2.5, z + 0.15))}
          className="p-1.5 hover:bg-slate-700 text-slate-300 rounded text-xs transition"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(0.4, z - 0.15))}
          className="p-1.5 hover:bg-slate-700 text-slate-300 rounded text-xs transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(1)}
          className="p-1.5 hover:bg-slate-700 text-slate-300 rounded text-xs transition"
          title="Reset View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="absolute top-4 right-4 z-10 bg-slate-800/90 border border-slate-700/80 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300 backdrop-blur shadow flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-purple-400" />
        TOP PLAN VIEW ({W}w × {D}d mm)
      </div>

      <svg
        className="w-full h-full"
        viewBox={`0 0 ${vbWidth} ${vbHeight}`}
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
          transition: 'transform 0.1s ease-out',
        }}
      >
        <defs>
          <pattern id="cad-grid-top" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="0.5" strokeOpacity="0.4" />
          </pattern>
          <marker id="arrow-start-top" markerWidth="6" markerHeight="6" refX="2" refY="3" orient="auto">
            <path d="M6,1 L1,3 L6,5" fill="none" stroke="#94a3b8" strokeWidth="1" />
          </marker>
          <marker id="arrow-end-top" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
            <path d="M0,1 L5,3 L0,5" fill="none" stroke="#94a3b8" strokeWidth="1" />
          </marker>
        </defs>

        <rect x="0" y="0" width={vbWidth} height={vbHeight} fill="url(#cad-grid-top)" />

        {/* Back Edge is Top (originY), Front Edge is Bottom (originY + D) */}

        {/* 1. Left Gable */}
        <rect x={originX} y={originY} width={T} height={D} fill="#475569" stroke="#64748b" strokeWidth="1.5" />

        {/* 2. Right Gable */}
        <rect x={originX + W - T} y={originY} width={T} height={D} fill="#475569" stroke="#64748b" strokeWidth="1.5" />

        {/* 3. Back Panel */}
        <rect
          x={originX + T - 8}
          y={originY + backInset}
          width={W - 2 * T + 16}
          height={BT}
          fill="#0284c7"
          stroke="#38bdf8"
          strokeWidth="1.2"
        />

        {/* 4. Vertical Partitions */}
        {activeCabinet.partitions
          .filter((p) => p.type === 'vertical')
          .map((part) => {
            const pT = part.thickness || T;
            const internalW = W - 2 * T;
            let splitPos = (internalW - pT) / 2;
            if (part.positionType === 'percentage') splitPos = (internalW - pT) * (part.positionValue / 100);
            else if (part.positionType === 'from-left') splitPos = part.positionValue;
            else if (part.positionType === 'from-right') splitPos = internalW - part.positionValue - pT;

            return (
              <rect
                key={part.id}
                x={originX + T + splitPos}
                y={originY + backInset + BT}
                width={pT}
                height={D - backInset - BT}
                fill="#64748b"
                stroke="#94a3b8"
                strokeWidth="1.5"
              />
            );
          })}

        {/* 5. Doors across front edge */}
        {activeCabinet.doors.length > 0 && (
          <rect
            x={originX}
            y={originY + D}
            width={W}
            height={T}
            fill="#047857"
            stroke="#34d399"
            strokeWidth="1.5"
            fillOpacity="0.8"
          />
        )}

        {/* 6. Dimensions */}
        {/* Width Dimension */}
        <line
          x1={originX}
          y1={originY - 25}
          x2={originX + W}
          y2={originY - 25}
          stroke="#94a3b8"
          strokeWidth="1.2"
          markerStart="url(#arrow-start-top)"
          markerEnd="url(#arrow-end-top)"
        />
        <text
          x={originX + W / 2}
          y={originY - 30}
          textAnchor="middle"
          fill="#e2e8f0"
          fontSize="13"
          fontFamily="monospace"
          fontWeight="bold"
        >
          WIDTH: {W} mm
        </text>

        {/* Depth Dimension */}
        <line
          x1={originX - 30}
          y1={originY}
          x2={originX - 30}
          y2={originY + D}
          stroke="#94a3b8"
          strokeWidth="1.2"
          markerStart="url(#arrow-start-top)"
          markerEnd="url(#arrow-end-top)"
        />
        <text
          x={originX - 38}
          y={originY + D / 2}
          textAnchor="middle"
          dominantBaseline="central"
          transform={`rotate(-90 ${originX - 38} ${originY + D / 2})`}
          fill="#e2e8f0"
          fontSize="13"
          fontFamily="monospace"
          fontWeight="bold"
        >
          DEPTH: {D} mm
        </text>

        <text x={originX + W / 2} y={originY + D + 35} textAnchor="middle" fill="#64748b" fontSize="11" fontFamily="sans-serif">
          [ FRONT OF CABINET ]
        </text>
        <text x={originX + W / 2} y={originY - 50} textAnchor="middle" fill="#64748b" fontSize="11" fontFamily="sans-serif">
          [ WALL / REAR ]
        </text>
      </svg>
    </div>
  );
};
