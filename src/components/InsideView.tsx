import React, { useState, useMemo } from 'react';
import { useProject } from '../context/ProjectContext';
import { calculateCabinetOpenings } from '../engine/parametricEngine';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

export const InsideView: React.FC = () => {
  const { activeCabinet, setSelectedElement } = useProject();
  const [zoom, setZoom] = useState(1);

  const openings = useMemo(() => calculateCabinetOpenings(activeCabinet), [activeCabinet]);

  const W = activeCabinet.width;
  const H = activeCabinet.height;
  const T = activeCabinet.boardThickness;
  const toeKickH = activeCabinet.hasToeKick ? activeCabinet.toeKickHeight : 0;
  const carcassH = H - toeKickH;

  const padX = 120;
  const padY = 100;
  const vbWidth = W + padX * 2;
  const vbHeight = H + padY * 2;
  const originX = padX;
  const originY = padY;

  return (
    <div className="relative w-full h-full bg-slate-900 overflow-hidden select-none flex flex-col items-center justify-center">
      {/* Zoom / Info Overlay */}
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
        <span className="w-2 h-2 rounded-full bg-blue-400" />
        INSIDE VIEW (Carcass & Internal Joinery)
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
          <pattern id="cad-grid-inside" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="0.5" strokeOpacity="0.4" />
          </pattern>
        </defs>

        <rect x="0" y="0" width={vbWidth} height={vbHeight} fill="url(#cad-grid-inside)" />

        {/* Back Panel (visible inside) */}
        <rect
          x={originX + T}
          y={originY + T}
          width={W - 2 * T}
          height={carcassH - 2 * T}
          fill="#1e293b"
          stroke="#334155"
          strokeWidth="1"
        />

        {/* 32mm System Line Boring Holes preview on gables */}
        {Array.from({ length: Math.floor((carcassH - 200) / 32) }).map((_, idx) => (
          <g key={idx} opacity="0.3">
            <circle cx={originX + T + 37} cy={originY + 100 + idx * 32} r="2" fill="#94a3b8" />
            <circle cx={originX + W - T - 37} cy={originY + 100 + idx * 32} r="2" fill="#94a3b8" />
          </g>
        ))}

        {/* Carcass Gables and Panels */}
        <rect x={originX} y={originY} width={T} height={carcassH} fill="#475569" stroke="#64748b" strokeWidth="1.5" />
        <rect x={originX + W - T} y={originY} width={T} height={carcassH} fill="#475569" stroke="#64748b" strokeWidth="1.5" />
        <rect x={originX + T} y={originY} width={W - 2 * T} height={T} fill="#475569" stroke="#64748b" strokeWidth="1.5" />
        <rect x={originX + T} y={originY + carcassH - T} width={W - 2 * T} height={T} fill="#475569" stroke="#64748b" strokeWidth="1.5" />

        {/* Plinth */}
        {activeCabinet.hasToeKick && toeKickH > 0 && (
          <rect
            x={originX + activeCabinet.toeKickSetback}
            y={originY + carcassH}
            width={W - activeCabinet.toeKickSetback * 2}
            height={toeKickH}
            fill="#1e293b"
            stroke="#475569"
            strokeWidth="1.5"
          />
        )}

        {/* Partitions */}
        {activeCabinet.partitions.map((part) => {
          const pT = part.thickness || T;
          if (part.type === 'vertical') {
            const internalW = W - 2 * T;
            let splitPos = (internalW - pT) / 2;
            if (part.positionType === 'percentage') splitPos = (internalW - pT) * (part.positionValue / 100);
            else if (part.positionType === 'from-left') splitPos = part.positionValue;
            else if (part.positionType === 'from-right') splitPos = internalW - part.positionValue - pT;

            return (
              <rect
                key={part.id}
                x={originX + T + splitPos}
                y={originY + T}
                width={pT}
                height={carcassH - 2 * T}
                fill="#64748b"
                stroke="#94a3b8"
                strokeWidth="1.5"
              />
            );
          } else {
            const internalH = carcassH - 2 * T;
            let splitPos = (internalH - pT) / 2;
            if (part.positionType === 'percentage') splitPos = (internalH - pT) * (part.positionValue / 100);
            else if (part.positionType === 'from-bottom') splitPos = part.positionValue;
            else if (part.positionType === 'from-top') splitPos = internalH - part.positionValue - pT;

            return (
              <rect
                key={part.id}
                x={originX + T}
                y={originY + carcassH - T - splitPos - pT}
                width={W - 2 * T}
                height={pT}
                fill="#64748b"
                stroke="#94a3b8"
                strokeWidth="1.5"
              />
            );
          }
        })}

        {/* Shelves */}
        {activeCabinet.shelves.map((shelf) => {
          const op = openings.find((o) => o.id === shelf.openingId) || openings[0];
          if (!op) return null;
          const svgX = originX + T + op.x;
          const sT = shelf.thickness || T;
          const count = shelf.count || 1;
          const spacing = op.height / (count + 1);

          return (
            <g key={shelf.id}>
              {Array.from({ length: count }).map((_, sIdx) => {
                const shelfYFromBottom = spacing * (sIdx + 1);
                const svgY = originY + carcassH - T - op.y - shelfYFromBottom;

                return (
                  <g key={sIdx}>
                    <rect
                      x={svgX}
                      y={svgY - sT / 2}
                      width={op.width}
                      height={sT}
                      fill="#9333ea"
                      stroke="#c084fc"
                      strokeWidth="1.2"
                    />
                    <circle cx={svgX + 4} cy={svgY} r="3" fill="#e2e8f0" />
                    <circle cx={svgX + op.width - 4} cy={svgY} r="3" fill="#e2e8f0" />
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* Drawer Boxes (Internal view without door fronts) */}
        {activeCabinet.drawers.map((dr) => {
          const op = openings.find((o) => o.id === dr.openingId) || openings[0];
          if (!op) return null;

          const N = dr.count || 3;
          const gap = dr.frontGap || 3;
          const equalH = (op.height - (N - 1) * gap) / N;
          const opSvgX = originX + T + op.x;
          const opSvgY = originY + carcassH - T - op.y - op.height;
          const sideClearance = dr.sideClearance || 25.4;
          const boxWidth = op.width - sideClearance;

          let currentY = opSvgY;

          return (
            <g key={dr.id}>
              {Array.from({ length: N }).map((_, i) => {
                const frontH =
                  dr.customHeights && dr.customHeights[i]
                    ? dr.customHeights[i]
                    : equalH;
                const boxH = Math.max(40, frontH - 45);
                const frontY = currentY;
                currentY += frontH + gap;

                return (
                  <g key={i}>
                    {/* Drawer Box Outer Body */}
                    <rect
                      x={opSvgX + sideClearance / 2}
                      y={frontY + (frontH - boxH)}
                      width={boxWidth}
                      height={boxH}
                      fill="#0284c7"
                      stroke="#38bdf8"
                      strokeWidth="1.5"
                    />
                    {/* Runner Slides (left & right) */}
                    <rect
                      x={opSvgX + 2}
                      y={frontY + frontH - 24}
                      width={sideClearance / 2 - 2}
                      height="12"
                      fill="#94a3b8"
                    />
                    <rect
                      x={opSvgX + op.width - sideClearance / 2}
                      y={frontY + frontH - 24}
                      width={sideClearance / 2 - 2}
                      height="12"
                      fill="#94a3b8"
                    />
                    <text
                      x={opSvgX + op.width / 2}
                      y={frontY + frontH - boxH / 2}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="#e0f2fe"
                      fontSize="11"
                      fontFamily="monospace"
                    >
                      Box {Number(boxWidth || 0).toFixed(0)}w × {Number(boxH || 0).toFixed(0)}h
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
