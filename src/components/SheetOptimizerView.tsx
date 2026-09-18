import React, { useState, useMemo } from 'react';
import { useProject } from '../context/ProjectContext';
import { OptimizationSettings } from '../types';
import {
  Maximize2,
  Minimize2,
  SlidersHorizontal,
  Layers,
  RotateCw,
  Printer,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { triggerPrint } from '../engine/exportUtils';

export const SheetOptimizerView: React.FC = () => {
  const {
    project,
    sheetOptimizationResults,
    updateOptimizationSettings,
  } = useProject();

  const settings = project.optimizationSettings;
  const [selectedSheetIndex, setSelectedSheetIndex] = useState<number>(0);
  const [hoveredPartId, setHoveredPartId] = useState<string | null>(null);

  // Aggregated waste calculations
  const totalSheets = sheetOptimizationResults.length;
  const totalSheetAreaM2 = useMemo(() => {
    return (
      (totalSheets * settings.sheetWidth * settings.sheetHeight) /
      1000000
    );
  }, [totalSheets, settings.sheetWidth, settings.sheetHeight]);

  const totalUsedAreaM2 = useMemo(() => {
    const mm2 = sheetOptimizationResults.reduce(
      (sum, s) => sum + s.usedArea,
      0
    );
    return Math.round((mm2 / 1000000) * 100) / 100;
  }, [sheetOptimizationResults]);

  const totalWasteAreaM2 = Math.max(
    0,
    Math.round((totalSheetAreaM2 - totalUsedAreaM2) * 100) / 100
  );

  const averageWastePercent =
    totalSheetAreaM2 > 0
      ? Math.round((totalWasteAreaM2 / totalSheetAreaM2) * 1000) / 10
      : 0;

  const currentSheet =
    sheetOptimizationResults[selectedSheetIndex] || sheetOptimizationResults[0];

  const handleStandardSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === '2440x1220') {
      updateOptimizationSettings({ sheetWidth: 2440, sheetHeight: 1220 });
    } else if (val === '2800x1220') {
      updateOptimizationSettings({ sheetWidth: 2800, sheetHeight: 1220 });
    } else if (val === '2440x1830') {
      updateOptimizationSettings({ sheetWidth: 2440, sheetHeight: 1830 });
    }
  };

  return (
    <div className="w-full h-full bg-slate-950 text-slate-100 flex flex-col overflow-hidden p-6 gap-5">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <SlidersHorizontal className="w-5 h-5 text-sky-400" />
            2D Sheet Optimization & Cutting Patterns
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Automated rectangular nesting and guillotine panel cut sequencing to minimize workshop waste.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={triggerPrint}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition"
          >
            <Printer className="w-4 h-4" />
            Print Cut Patterns
          </button>
        </div>
      </div>

      {/* Settings Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label htmlFor="sheet-format-select" className="text-[11px] text-slate-400 block mb-1">Sheet Format</label>
            <select
              id="sheet-format-select"
              value={`${settings.sheetWidth}x${settings.sheetHeight}`}
              onChange={handleStandardSizeChange}
              className="bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-slate-100 focus:border-sky-500"
            >
              <option value="2440x1220">2440 × 1220 mm (Standard 8×4)</option>
              <option value="2800x1220">2800 × 1220 mm (Oversize 9×4)</option>
              <option value="2440x1830">2440 × 1830 mm (Jumbo 8×6)</option>
              <option value="custom">Custom Dimensions</option>
            </select>
          </div>

          <div>
            <label htmlFor="saw-kerf-input" className="text-[11px] text-slate-400 block mb-1">Saw Kerf (mm)</label>
            <input
              id="saw-kerf-input"
              type="number"
              step="0.1"
              min="1"
              max="10"
              value={settings.sawKerf}
              onChange={(e) =>
                updateOptimizationSettings({ sawKerf: Number(e.target.value) })
              }
              className="w-16 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-100 font-mono text-center"
            />
          </div>

          <div>
            <label htmlFor="edge-trim-input" className="text-[11px] text-slate-400 block mb-1">Edge Trim Margin</label>
            <input
              id="edge-trim-input"
              type="number"
              step="1"
              min="0"
              max="50"
              value={settings.edgeTrim}
              onChange={(e) =>
                updateOptimizationSettings({ edgeTrim: Number(e.target.value) })
              }
              className="w-16 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-100 font-mono text-center"
            />
          </div>
        </div>

        <div className="flex items-center gap-5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.allowRotation}
              onChange={(e) =>
                updateOptimizationSettings({ allowRotation: e.target.checked })
              }
              className="w-4 h-4 accent-sky-500 rounded"
            />
            <span className="text-slate-300">Allow Part Rotation (90°)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.respectGrain}
              onChange={(e) =>
                updateOptimizationSettings({ respectGrain: e.target.checked })
              }
              className="w-4 h-4 accent-sky-500 rounded"
            />
            <span className="text-slate-300">Respect Wood Grain</span>
          </label>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col">
          <span className="text-[11px] text-slate-400 font-semibold uppercase">Total Sheets</span>
          <span className="text-xl font-mono font-bold text-sky-400 mt-0.5">
            {totalSheets} {totalSheets === 1 ? 'Sheet' : 'Sheets'}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col">
          <span className="text-[11px] text-slate-400 font-semibold uppercase">Total Raw Area</span>
          <span className="text-xl font-mono font-bold text-slate-100 mt-0.5">
            {Number(totalSheetAreaM2 || 0).toFixed(2)} m²
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col">
          <span className="text-[11px] text-slate-400 font-semibold uppercase">Cut Part Area</span>
          <span className="text-xl font-mono font-bold text-emerald-400 mt-0.5">
            {Number(totalUsedAreaM2 || 0).toFixed(2)} m²
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col">
          <span className="text-[11px] text-slate-400 font-semibold uppercase">Waste Area</span>
          <span className="text-xl font-mono font-bold text-amber-400 mt-0.5">
            {Number(totalWasteAreaM2 || 0).toFixed(2)} m²
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col">
          <span className="text-[11px] text-slate-400 font-semibold uppercase">Waste Ratio</span>
          <span
            className={`text-xl font-mono font-bold mt-0.5 ${
              averageWastePercent < 15
                ? 'text-emerald-400'
                : averageWastePercent < 25
                ? 'text-amber-400'
                : 'text-rose-400'
            }`}
          >
            {averageWastePercent}%
          </span>
        </div>
      </div>

      {/* Sheet Visualizer Container */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col p-4 gap-3">
        {/* Sheet Paginator / Selector */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-slate-100">
              Sheet {selectedSheetIndex + 1} of {totalSheets}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-sky-300 border border-slate-700 font-medium">
              {currentSheet?.material || 'Panel Material'}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ({currentSheet?.placedParts.length || 0} parts nested &bull; Waste:{' '}
              {currentSheet?.wastePercentage || 0}%)
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSelectedSheetIndex((i) => Math.max(0, i - 1))}
              disabled={selectedSheetIndex === 0}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono px-2 text-slate-400">
              {selectedSheetIndex + 1} / {totalSheets}
            </span>
            <button
              onClick={() =>
                setSelectedSheetIndex((i) =>
                  Math.min(totalSheets - 1, i + 1)
                )
              }
              disabled={selectedSheetIndex >= totalSheets - 1}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* SVG Sheet Diagram */}
        <div className="flex-1 w-full flex items-center justify-center p-2 bg-slate-950/80 rounded-lg overflow-hidden border border-slate-800/80">
          {currentSheet ? (
            <svg
              className="max-w-full max-h-full aspect-[2/1] drop-shadow-2xl"
              viewBox={`0 0 ${settings.sheetWidth} ${settings.sheetHeight}`}
            >
              {/* Outer Raw Sheet */}
              <rect
                x="0"
                y="0"
                width={settings.sheetWidth}
                height={settings.sheetHeight}
                fill="#1e293b"
                stroke="#475569"
                strokeWidth="4"
              />

              {/* Edge Trim Margin Line */}
              {settings.edgeTrim > 0 && (
                <rect
                  x={settings.edgeTrim}
                  y={settings.edgeTrim}
                  width={settings.sheetWidth - settings.edgeTrim * 2}
                  height={settings.sheetHeight - settings.edgeTrim * 2}
                  fill="none"
                  stroke="#334155"
                  strokeWidth="2"
                  strokeDasharray="8 6"
                />
              )}

              {/* Placed Parts */}
              {currentSheet.placedParts.map((p, idx) => {
                const isHovered = hoveredPartId === p.partId;
                // Palette colors for distinct parts
                const colors = [
                  '#0284c7',
                  '#059669',
                  '#7c3aed',
                  '#d97706',
                  '#db2777',
                  '#0d9488',
                  '#4f46e5',
                ];
                const baseColor = colors[idx % colors.length];

                return (
                  <g
                    key={p.partId}
                    className="cursor-pointer group"
                    onMouseEnter={() => setHoveredPartId(p.partId)}
                    onMouseLeave={() => setHoveredPartId(null)}
                  >
                    <rect
                      x={p.x}
                      y={p.y}
                      width={p.width}
                      height={p.height}
                      fill={baseColor}
                      fillOpacity={isHovered ? '0.95' : '0.75'}
                      stroke={isHovered ? '#ffffff' : '#0f172a'}
                      strokeWidth={isHovered ? '4' : '2'}
                      rx="3"
                      className="transition-all duration-150"
                    />

                    {/* Part Label & Dimensions inside rectangle */}
                    {p.width > 70 && p.height > 40 && (
                      <g className="pointer-events-none">
                        <text
                          x={p.x + p.width / 2}
                          y={p.y + p.height / 2 - 8}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill="#ffffff"
                          fontSize="22"
                          fontWeight="bold"
                          fontFamily="sans-serif"
                        >
                          {p.partName}
                        </text>
                        <text
                          x={p.x + p.width / 2}
                          y={p.y + p.height / 2 + 14}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill="#e2e8f0"
                          fontSize="18"
                          fontFamily="monospace"
                        >
                          {p.width} × {p.height} mm
                          {p.rotated ? ' ⟳' : ''}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          ) : (
            <div className="text-slate-500 text-xs">No cut parts to nest.</div>
          )}
        </div>
      </div>
    </div>
  );
};
