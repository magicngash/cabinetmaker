import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

export const SideView: React.FC = () => {
  const { activeCabinet } = useProject();
  const [zoom, setZoom] = useState(1);

  const D = activeCabinet.depth;
  const H = activeCabinet.height;
  const T = activeCabinet.boardThickness;
  const BT = activeCabinet.backThickness;
  const backInset = activeCabinet.backInset || 16;
  const toeKickH = activeCabinet.hasToeKick ? activeCabinet.toeKickHeight : 0;
  const toeKickSetback = activeCabinet.hasToeKick ? activeCabinet.toeKickSetback : 0;
  const carcassH = H - toeKickH;

  const padX = 140;
  const padY = 100;
  const vbWidth = D + padX * 2;
  const vbHeight = H + padY * 2;

  const originX = padX;
  const originY = padY;

  return (
    <div className="relative w-full h-full bg-slate-900 overflow-hidden select-none flex flex-col items-center justify-center">
      {/* Zoom Overlay */}
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
        <span className="w-2 h-2 rounded-full bg-amber-400" />
        SIDE VIEW (Depth Cross-Section & Back Rebate)
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
          <pattern id="cad-grid-side" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="0.5" strokeOpacity="0.4" />
          </pattern>
          <marker id="arrow-start-side" markerWidth="6" markerHeight="6" refX="2" refY="3" orient="auto">
            <path d="M6,1 L1,3 L6,5" fill="none" stroke="#94a3b8" strokeWidth="1" />
          </marker>
          <marker id="arrow-end-side" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
            <path d="M0,1 L5,3 L0,5" fill="none" stroke="#94a3b8" strokeWidth="1" />
          </marker>
        </defs>

        <rect x="0" y="0" width={vbWidth} height={vbHeight} fill="url(#cad-grid-side)" />

        {/* REAR is Left (originX), FRONT is Right (originX + D) */}

        {/* 1. Carcass Gable Outline */}
        <rect
          x={originX}
          y={originY}
          width={D}
          height={carcassH}
          fill="rgba(30, 41, 59, 0.6)"
          stroke="#64748b"
          strokeWidth="2"
        />

        {/* 2. Top & Bottom Panels (Horizontal cross-section) */}
        <rect x={originX} y={originY} width={D} height={T} fill="#334155" stroke="#475569" strokeWidth="1" />
        <rect
          x={originX}
          y={originY + carcassH - T}
          width={D}
          height={T}
          fill="#334155"
          stroke="#475569"
          strokeWidth="1"
        />

        {/* 3. Back Panel Groove / Rebate (Inset from rear) */}
        <rect
          x={originX + backInset}
          y={originY + T}
          width={BT}
          height={carcassH - 2 * T}
          fill="#0284c7"
          stroke="#38bdf8"
          strokeWidth="1.5"
        />
        <text
          x={originX + backInset - 8}
          y={originY + carcassH / 2}
          textAnchor="middle"
          fill="#38bdf8"
          fontSize="10"
          fontFamily="monospace"
          transform={`rotate(-90 ${originX + backInset - 8} ${originY + carcassH / 2})`}
        >
          Back ({BT}mm MDF, {backInset}mm inset)
        </text>

        {/* 4. Toe Kick Plinth & Setback (at front bottom) */}
        {activeCabinet.hasToeKick && toeKickH > 0 && (
          <g>
            {/* Plinth board */}
            <rect
              x={originX + D - toeKickSetback - T}
              y={originY + carcassH}
              width={T}
              height={toeKickH}
              fill="#475569"
              stroke="#64748b"
              strokeWidth="1.5"
            />
            {/* Ground line */}
            <line
              x1={originX - 20}
              y1={originY + H}
              x2={originX + D + 40}
              y2={originY + H}
              stroke="#64748b"
              strokeWidth="1"
              strokeDasharray="4 2"
            />
            {/* Plinth setback dimension */}
            <text
              x={originX + D - toeKickSetback / 2}
              y={originY + carcassH + toeKickH / 2}
              fill="#94a3b8"
              fontSize="10"
              fontFamily="monospace"
              textAnchor="middle"
            >
              {toeKickSetback}mm
            </text>
          </g>
        )}

        {/* 5. Doors on Front Edge */}
        {activeCabinet.doors.length > 0 && (
          <g>
            <rect
              x={originX + D}
              y={originY}
              width={T}
              height={carcassH}
              fill="#047857"
              stroke="#34d399"
              strokeWidth="1.5"
              fillOpacity="0.8"
            />
            <text
              x={originX + D + T + 14}
              y={originY + carcassH / 2}
              fill="#34d399"
              fontSize="10"
              fontFamily="monospace"
              textAnchor="middle"
              transform={`rotate(90 ${originX + D + T + 14} ${originY + carcassH / 2})`}
            >
              Door Front ({T}mm)
            </text>
          </g>
        )}

        {/* 6. Shelves Depth (Setback from front) */}
        {activeCabinet.shelves.map((shelf, idx) => {
          const count = shelf.count || 1;
          const sT = shelf.thickness || T;
          const setback = shelf.setback || 12;
          const shelfDepth = D - backInset - BT - setback;

          return Array.from({ length: count }).map((_, sIdx) => {
            const yPos = originY + ((carcassH - 2 * T) / (count + 1)) * (sIdx + 1);
            return (
              <rect
                key={`${idx}-${sIdx}`}
                x={originX + backInset + BT}
                y={yPos}
                width={shelfDepth}
                height={sT}
                fill="#a855f7"
                stroke="#c084fc"
                strokeWidth="1"
              />
            );
          });
        })}

        {/* 7. Drawers Depth Cross-Section */}
        {activeCabinet.drawers.map((dr, dIdx) => {
          const runnerL = dr.runnerLength || 500;
          return (
            <g key={dIdx}>
              {Array.from({ length: dr.count }).map((_, i) => {
                const boxH = 120;
                const boxY = originY + carcassH - T - (i + 1) * (boxH + 30);
                return (
                  <g key={i}>
                    {/* Runner Slide Track */}
                    <line
                      x1={originX + D - runnerL}
                      y1={boxY + boxH}
                      x2={originX + D}
                      y2={boxY + boxH}
                      stroke="#38bdf8"
                      strokeWidth="3"
                    />
                    {/* Box Depth */}
                    <rect
                      x={originX + D - runnerL}
                      y={boxY}
                      width={runnerL}
                      height={boxH}
                      fill="rgba(2, 132, 199, 0.25)"
                      stroke="#38bdf8"
                      strokeWidth="1.5"
                    />
                    <text
                      x={originX + D - runnerL / 2}
                      y={boxY + boxH / 2}
                      textAnchor="middle"
                      fill="#bae6fd"
                      fontSize="10"
                      fontFamily="monospace"
                    >
                      {runnerL}mm Runner
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* 8. Dimension Lines */}
        {/* Top Depth Dimension */}
        <line
          x1={originX}
          y1={originY - 30}
          x2={originX + D}
          y2={originY - 30}
          stroke="#94a3b8"
          strokeWidth="1.2"
          markerStart="url(#arrow-start-side)"
          markerEnd="url(#arrow-end-side)"
        />
        <text
          x={originX + D / 2}
          y={originY - 36}
          textAnchor="middle"
          fill="#e2e8f0"
          fontSize="13"
          fontFamily="monospace"
          fontWeight="bold"
        >
          DEPTH: {D} mm
        </text>

        {/* Height Dimension */}
        <line
          x1={originX - 40}
          y1={originY}
          x2={originX - 40}
          y2={originY + H}
          stroke="#94a3b8"
          strokeWidth="1.2"
          markerStart="url(#arrow-start-side)"
          markerEnd="url(#arrow-end-side)"
        />
        <text
          x={originX - 48}
          y={originY + H / 2}
          textAnchor="middle"
          dominantBaseline="central"
          transform={`rotate(-90 ${originX - 48} ${originY + H / 2})`}
          fill="#e2e8f0"
          fontSize="13"
          fontFamily="monospace"
          fontWeight="bold"
        >
          HEIGHT: {H} mm
        </text>
      </svg>
    </div>
  );
};
