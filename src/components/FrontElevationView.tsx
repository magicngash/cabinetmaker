import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { calculateCabinetOpenings } from '../engine/parametricEngine';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Eye,
  EyeOff,
  Layers,
  X,
  Sliders,
  DoorClosed,
  Archive,
} from 'lucide-react';

export const FrontElevationView: React.FC = () => {
  const {
    activeCabinet,
    selectedElement,
    setSelectedElement,
  } = useProject();

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const startPanRef = useRef({ x: 0, y: 0 });

  // Fronts visibility mode: 'solid' (normal), 'ghost' (semi-transparent click-through), 'hidden' (no doors/drawers)
  const [frontsMode, setFrontsMode] = useState<'solid' | 'ghost' | 'hidden'>('solid');
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);

  // Keyboard shortcut: Escape to deselect element back to cabinet
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedElement({ type: 'cabinet', id: activeCabinet.id });
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeCabinet.id, setSelectedElement]);

  const openings = useMemo(() => {
    return calculateCabinetOpenings(activeCabinet);
  }, [activeCabinet]);

  const W = activeCabinet.width;
  const H = activeCabinet.height;
  const T = activeCabinet.boardThickness;
  const toeKickH = activeCabinet.hasToeKick ? activeCabinet.toeKickHeight : 0;
  const carcassH = H - toeKickH;

  // ViewBox padding for dimension lines
  const padX = 140;
  const padY = 120;
  const vbWidth = W + padX * 2;
  const vbHeight = H + padY * 2;

  // Carcass top-left in SVG coordinate space
  const originX = padX;
  const originY = padY; // Carcass top edge

  // Handle pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && (e.target as HTMLElement).tagName === 'svg') {
      setIsPanning(true);
      startPanRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - startPanRef.current.x,
        y: e.clientY - startPanRef.current.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Human friendly description of selected element
  const getSelectedElementName = () => {
    if (!selectedElement || selectedElement.type === 'cabinet') return null;
    if (selectedElement.type === 'partition') {
      const p = activeCabinet.partitions.find((item) => item.id === selectedElement.id);
      return p ? `${p.type === 'vertical' ? 'Vertical' : 'Horizontal'} Partition (${p.positionType === 'equal' ? 'Center 50%' : `${p.positionValue}${p.positionType === 'percentage' ? '%' : 'mm'}`})` : 'Partition';
    }
    if (selectedElement.type === 'opening') {
      const op = openings.find((item) => item.id === selectedElement.id);
      return op ? `Opening Bay (${Math.round(op.width)} × ${Math.round(op.height)} mm)` : 'Opening Bay';
    }
    if (selectedElement.type === 'shelf') {
      const s = activeCabinet.shelves.find((item) => item.id === selectedElement.id);
      return s ? `Shelving (${s.count} ${s.shelfType} shelves)` : 'Shelving';
    }
    if (selectedElement.type === 'drawer') {
      const d = activeCabinet.drawers.find((item) => item.id === selectedElement.id);
      return d ? `Drawer Stack (${d.count} drawers)` : 'Drawer Stack';
    }
    if (selectedElement.type === 'door') {
      const dr = activeCabinet.doors.find((item) => item.id === selectedElement.id);
      return dr ? `Door (${dr.doorType})` : 'Door';
    }
    return 'Element';
  };

  const selectedName = getSelectedElementName();

  return (
    <div
      className="relative w-full h-full bg-slate-900 overflow-hidden select-none flex flex-col items-center justify-center"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Zoom / Pan & Fronts Display Mode Controls Overlay */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 bg-slate-800/90 border border-slate-700/80 rounded-lg p-1.5 shadow-lg backdrop-blur">
        <div className="flex items-center gap-1">
          <button
            id="btn-zoom-in"
            onClick={() => setZoom((z) => Math.min(2.5, z + 0.15))}
            className="p-1.5 hover:bg-slate-700 text-slate-300 rounded text-xs transition"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            id="btn-zoom-out"
            onClick={() => setZoom((z) => Math.max(0.4, z - 0.15))}
            className="p-1.5 hover:bg-slate-700 text-slate-300 rounded text-xs transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            id="btn-zoom-reset"
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
            className="p-1.5 hover:bg-slate-700 text-slate-300 rounded text-xs transition"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <span className="text-[11px] text-slate-400 font-mono px-1">
            {Math.round(zoom * 100)}%
          </span>
        </div>

        <div className="h-4 w-px bg-slate-700" />

        {/* Fronts / Door Mode Switcher (Crucial for selecting elements behind doors) */}
        <div className="flex items-center gap-0.5 bg-slate-900/90 p-0.5 rounded border border-slate-700/80">
          <button
            type="button"
            onClick={() => setFrontsMode('solid')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition flex items-center gap-1.5 ${
              frontsMode === 'solid'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Solid Fronts: Standard view with doors and drawers"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Solid Doors</span>
          </button>
          <button
            type="button"
            onClick={() => setFrontsMode('ghost')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition flex items-center gap-1.5 ${
              frontsMode === 'ghost'
                ? 'bg-amber-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="X-Ray Ghost Mode: Doors are semi-transparent and click-through. Allows clicking partitions, shelves, and openings behind doors without selecting the door!"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">X-Ray (Click-through)</span>
          </button>
          <button
            type="button"
            onClick={() => setFrontsMode('hidden')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition flex items-center gap-1.5 ${
              frontsMode === 'hidden'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Internal Only: Hides doors and drawers completely to view and edit internal carcass elements"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Internal Only</span>
          </button>
        </div>
      </div>

      {/* Mode / Scale Badge */}
      <div className="absolute top-4 right-4 z-10 bg-slate-800/90 border border-slate-700/80 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300 backdrop-blur shadow flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        FRONT ELEVATION &bull; {W} × {H} × {activeCabinet.depth} mm
      </div>

      {/* Bottom Floating Status / Selection Banner */}
      <div className="absolute bottom-4 z-10 flex items-center gap-3 bg-slate-800/95 border border-slate-700 px-4 py-2 rounded-xl shadow-xl backdrop-blur text-xs">
        {selectedName ? (
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span className="text-slate-400">Selected:</span>
            <span className="font-semibold text-white font-mono">{selectedName}</span>
            <button
              onClick={() => setSelectedElement({ type: 'cabinet', id: activeCabinet.id })}
              className="ml-2 flex items-center gap-1 text-[11px] bg-slate-700 hover:bg-slate-600 text-slate-200 px-2 py-0.5 rounded transition"
              title="Deselect (or press Esc)"
            >
              <X className="w-3 h-3" />
              Deselect (Esc)
            </button>
          </div>
        ) : hoveredLabel ? (
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Hovering:</span>
            <span className="font-medium text-amber-200">{hoveredLabel}</span>
            <span className="text-[11px] text-slate-500">(Click to select)</span>
          </div>
        ) : (
          <div className="text-slate-400 text-[11px] flex items-center gap-2">
            <span>Click any opening, partition, shelf, or door to inspect &amp; edit properties.</span>
            {frontsMode !== 'ghost' && activeCabinet.doors.length > 0 && (
              <span className="text-amber-400 font-medium hidden md:inline">
                &bull; Tip: Use &ldquo;X-Ray&rdquo; mode to click through doors.
              </span>
            )}
          </div>
        )}
      </div>

      {/* SVG Canvas */}
      <svg
        className="w-full h-full cursor-grab active:cursor-grabbing"
        viewBox={`0 0 ${vbWidth} ${vbHeight}`}
        style={{
          transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
          transformOrigin: 'center center',
          transition: isPanning ? 'none' : 'transform 0.1s ease-out',
        }}
      >
        <defs>
          {/* Subtle Grid Pattern */}
          <pattern id="cad-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="0.5" strokeOpacity="0.4" />
          </pattern>
          {/* Wood grain / melamine texture pattern */}
          <pattern id="melamine-hatch" width="8" height="8" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="8" y2="8" stroke="#cbd5e1" strokeWidth="0.4" strokeOpacity="0.15" />
          </pattern>
          {/* Arrow markers for dimension lines */}
          <marker id="arrow-start" markerWidth="6" markerHeight="6" refX="2" refY="3" orient="auto">
            <path d="M6,1 L1,3 L6,5" fill="none" stroke="#94a3b8" strokeWidth="1" />
          </marker>
          <marker id="arrow-end" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
            <path d="M0,1 L5,3 L0,5" fill="none" stroke="#94a3b8" strokeWidth="1" />
          </marker>
        </defs>

        {/* Background Grid - Clicking deselects to cabinet */}
        <rect
          x={0}
          y={0}
          width={vbWidth}
          height={vbHeight}
          fill="url(#cad-grid)"
          onClick={() => setSelectedElement({ type: 'cabinet', id: activeCabinet.id })}
        />

        {/* 1. TOE KICK / PLINTH (if enabled) */}
        {activeCabinet.hasToeKick && toeKickH > 0 && (
          <g>
            <rect
              x={originX + activeCabinet.toeKickSetback}
              y={originY + carcassH}
              width={W - activeCabinet.toeKickSetback * 2}
              height={toeKickH}
              fill="#1e293b"
              stroke="#475569"
              strokeWidth="1.5"
            />
            <line
              x1={originX}
              y1={originY + H}
              x2={originX + W}
              y2={originY + H}
              stroke="#64748b"
              strokeWidth="1"
              strokeDasharray="4 2"
            />
          </g>
        )}

        {/* 2. CARCASS EXTERIOR PANELS */}
        <g id="carcass-gables">
          {/* Left Gable */}
          <rect
            x={originX}
            y={originY}
            width={T}
            height={carcassH}
            fill="#334155"
            stroke="#64748b"
            strokeWidth="1.5"
            className="transition hover:fill-amber-900/40 cursor-pointer"
            onMouseEnter={() => setHoveredLabel('Left Gable / Carcass')}
            onMouseLeave={() => setHoveredLabel(null)}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedElement({ type: 'cabinet', id: activeCabinet.id });
            }}
          />
          {/* Right Gable */}
          <rect
            x={originX + W - T}
            y={originY}
            width={T}
            height={carcassH}
            fill="#334155"
            stroke="#64748b"
            strokeWidth="1.5"
            className="transition hover:fill-amber-900/40 cursor-pointer"
            onMouseEnter={() => setHoveredLabel('Right Gable / Carcass')}
            onMouseLeave={() => setHoveredLabel(null)}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedElement({ type: 'cabinet', id: activeCabinet.id });
            }}
          />
          {/* Top Panel */}
          <rect
            x={originX + T}
            y={originY}
            width={W - 2 * T}
            height={T}
            fill="#334155"
            stroke="#64748b"
            strokeWidth="1.5"
            className="cursor-pointer hover:fill-amber-900/40 transition"
            onMouseEnter={() => setHoveredLabel('Top Carcass Panel')}
            onMouseLeave={() => setHoveredLabel(null)}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedElement({ type: 'cabinet', id: activeCabinet.id });
            }}
          />
          {/* Bottom Panel */}
          <rect
            x={originX + T}
            y={originY + carcassH - T}
            width={W - 2 * T}
            height={T}
            fill="#334155"
            stroke="#64748b"
            strokeWidth="1.5"
            className="cursor-pointer hover:fill-amber-900/40 transition"
            onMouseEnter={() => setHoveredLabel('Bottom Carcass Panel')}
            onMouseLeave={() => setHoveredLabel(null)}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedElement({ type: 'cabinet', id: activeCabinet.id });
            }}
          />
        </g>

        {/* 3. OPENINGS (Zones for inserting components) */}
        {openings.map((op, idx) => {
          const isSelected =
            selectedElement?.type === 'opening' && selectedElement.id === op.id;
          const svgX = originX + T + op.x;
          const svgY = originY + carcassH - T - op.y - op.height;

          return (
            <g key={op.id} className="group">
              <rect
                x={svgX}
                y={svgY}
                width={op.width}
                height={op.height}
                fill={isSelected ? 'rgba(59, 130, 246, 0.18)' : 'rgba(15, 23, 42, 0.4)'}
                stroke={isSelected ? '#3b82f6' : '#334155'}
                strokeWidth={isSelected ? '2.5' : '1'}
                strokeDasharray={isSelected ? 'none' : '4 4'}
                className="cursor-pointer transition hover:fill-blue-500/15 hover:stroke-blue-400"
                onMouseEnter={() => setHoveredLabel(`Opening Bay ${idx + 1} (${Math.round(op.width)} × ${Math.round(op.height)} mm)`)}
                onMouseLeave={() => setHoveredLabel(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedElement({ type: 'opening', id: op.id, data: op });
                }}
              />
              {/* Opening Dimension Hint Label */}
              <text
                x={svgX + op.width / 2}
                y={svgY + op.height / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fill={isSelected ? '#93c5fd' : '#64748b'}
                fontSize="12"
                fontFamily="monospace"
                className="pointer-events-none select-none opacity-50 group-hover:opacity-100 transition font-semibold"
              >
                Bay {idx + 1}: {Math.round(op.width)} × {Math.round(op.height)}
              </text>
            </g>
          );
        })}

        {/* 4. PARTITIONS */}
        {activeCabinet.partitions.map((part, pIdx) => {
          const isSelected =
            selectedElement?.type === 'partition' && selectedElement.id === part.id;
          const pT = part.thickness || T;

          let partX = originX + T;
          let partY = originY + T;
          let partW = pT;
          let partH = carcassH - 2 * T;

          if (part.type === 'vertical') {
            const internalW = W - 2 * T;
            let splitPos = 0;
            if (part.positionType === 'equal') splitPos = (internalW - pT) / 2;
            else if (part.positionType === 'percentage')
              splitPos = (internalW - pT) * (part.positionValue / 100);
            else if (part.positionType === 'from-left')
              splitPos = part.positionValue;
            else if (part.positionType === 'from-right')
              splitPos = internalW - part.positionValue - pT;

            partX = originX + T + splitPos;
            partW = pT;
          } else {
            const internalH = carcassH - 2 * T;
            let splitPos = 0;
            if (part.positionType === 'equal') splitPos = (internalH - pT) / 2;
            else if (part.positionType === 'percentage')
              splitPos = (internalH - pT) * (part.positionValue / 100);
            else if (part.positionType === 'from-bottom')
              splitPos = part.positionValue;
            else if (part.positionType === 'from-top')
              splitPos = internalH - part.positionValue - pT;

            partX = originX + T;
            partY = originY + carcassH - T - splitPos - pT;
            partW = W - 2 * T;
            partH = pT;
          }

          const label = `${part.type === 'vertical' ? 'Vertical' : 'Horizontal'} Partition #${pIdx + 1}`;

          return (
            <g
              key={part.id}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredLabel(label)}
              onMouseLeave={() => setHoveredLabel(null)}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedElement({ type: 'partition', id: part.id, data: part });
              }}
            >
              <rect
                x={partX}
                y={partY}
                width={partW}
                height={partH}
                fill={isSelected ? '#38bdf8' : '#475569'}
                stroke={isSelected ? '#0284c7' : '#64748b'}
                strokeWidth={isSelected ? '2.5' : '1.5'}
                className="transition hover:fill-sky-400"
              />
              {/* Center partition label */}
              {isSelected && (
                <text
                  x={partX + partW / 2}
                  y={partY + partH / 2 - 10}
                  textAnchor="middle"
                  fill="#38bdf8"
                  fontSize="11"
                  fontFamily="sans-serif"
                  fontWeight="bold"
                >
                  Partition ({part.positionType}: {part.positionValue}mm)
                </text>
              )}
            </g>
          );
        })}

        {/* 5. SHELVES */}
        {activeCabinet.shelves.map((shelf, sIdx) => {
          const isSelected =
            selectedElement?.type === 'shelf' && selectedElement.id === shelf.id;
          const op = openings.find((o) => o.id === shelf.openingId) || openings[0];
          if (!op) return null;

          const svgX = originX + T + op.x;
          const sT = shelf.thickness || T;
          const count = shelf.count || 1;
          const spacing = op.height / (count + 1);
          const shelfLabel = `Shelving Group #${sIdx + 1} (${count} ${shelf.shelfType} shelves)`;

          return (
            <g
              key={shelf.id}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredLabel(shelfLabel)}
              onMouseLeave={() => setHoveredLabel(null)}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedElement({ type: 'shelf', id: shelf.id, data: shelf });
              }}
            >
              {Array.from({ length: count }).map((_, idx) => {
                const shelfYFromBottom = spacing * (idx + 1);
                const svgY = originY + carcassH - T - op.y - shelfYFromBottom;

                return (
                  <g key={idx}>
                    <rect
                      x={svgX}
                      y={svgY - sT / 2}
                      width={op.width}
                      height={sT}
                      fill={isSelected ? '#a855f7' : '#64748b'}
                      stroke={isSelected ? '#c084fc' : '#475569'}
                      strokeWidth={isSelected ? '2.5' : '1'}
                      className="transition hover:fill-purple-400"
                    />
                    {/* Shelf Pin hole indicators on left and right */}
                    <circle cx={svgX + 4} cy={svgY} r="2" fill="#94a3b8" />
                    <circle cx={svgX + op.width - 4} cy={svgY} r="2" fill="#94a3b8" />
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* 6. DRAWERS (Front View) */}
        {frontsMode !== 'hidden' &&
          activeCabinet.drawers.map((dr, dIdx) => {
            const isSelected =
              selectedElement?.type === 'drawer' && selectedElement.id === dr.id;
            const op = openings.find((o) => o.id === dr.openingId) || openings[0];
            if (!op) return null;

            const N = dr.count || 3;
            const gap = dr.frontGap || 3;
            const equalH = (op.height - (N - 1) * gap) / N;
            const opSvgX = originX + T + op.x;
            const opSvgY = originY + carcassH - T - op.y - op.height;

            let currentY = opSvgY;
            const isGhost = frontsMode === 'ghost';
            const drawerLabel = `Drawer Stack #${dIdx + 1} (${N} drawers)`;

            return (
              <g
                key={dr.id}
                className={isGhost ? 'pointer-events-none opacity-30' : 'cursor-pointer'}
                style={{ pointerEvents: isGhost ? 'none' : 'auto' }}
                onMouseEnter={() => !isGhost && setHoveredLabel(drawerLabel)}
                onMouseLeave={() => !isGhost && setHoveredLabel(null)}
                onClick={(e) => {
                  if (isGhost) return;
                  e.stopPropagation();
                  setSelectedElement({ type: 'drawer', id: dr.id, data: dr });
                }}
              >
                {Array.from({ length: N }).map((_, i) => {
                  const frontH =
                    dr.customHeights && dr.customHeights[i]
                      ? dr.customHeights[i]
                      : equalH;
                  const frontY = currentY;
                  currentY += frontH + gap;

                  return (
                    <g key={i}>
                      {/* Drawer Front Panel */}
                      <rect
                        x={opSvgX + gap}
                        y={frontY}
                        width={op.width - gap * 2}
                        height={frontH}
                        rx="2"
                        fill={isSelected ? '#0284c7' : '#1e293b'}
                        stroke={isSelected ? '#38bdf8' : isGhost ? '#64748b' : '#475569'}
                        strokeWidth={isSelected ? '2.5' : '1.5'}
                        strokeDasharray={isGhost ? '4 2' : 'none'}
                        className="transition hover:fill-sky-800/80"
                      />
                      {/* Handle pull */}
                      <rect
                        x={opSvgX + op.width / 2 - 35}
                        y={frontY + frontH / 2 - 4}
                        width="70"
                        height="8"
                        rx="3"
                        fill="#94a3b8"
                        stroke="#475569"
                        strokeWidth="0.8"
                      />
                      {/* Drawer text label */}
                      <text
                        x={opSvgX + 12}
                        y={frontY + 16}
                        fill="#94a3b8"
                        fontSize="10"
                        fontFamily="sans-serif"
                      >
                        D{i + 1} ({Math.round(frontH)}mm)
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}

        {/* 7. DOORS (Front View) */}
        {frontsMode !== 'hidden' &&
          activeCabinet.doors.map((door, doorIdx) => {
            const isSelected =
              selectedElement?.type === 'door' && selectedElement.id === door.id;
            const op = openings.find((o) => o.id === door.openingId) || openings[0];
            if (!op) return null;

            const gap = door.doorGap || 2;
            const cGap = door.centreGap || 3;
            const opSvgX = originX + T + op.x;
            const opSvgY = originY + carcassH - T - op.y - op.height;
            const doorH = op.height - gap * 2;

            const isGhost = frontsMode === 'ghost';
            const doorLabel = `Door #${doorIdx + 1} (${door.doorType})`;

            return (
              <g
                key={door.id}
                className={isGhost ? 'pointer-events-none' : 'cursor-pointer'}
                style={{
                  pointerEvents: isGhost ? 'none' : 'auto',
                  opacity: isGhost ? 0.25 : 1,
                }}
                onMouseEnter={() => !isGhost && setHoveredLabel(doorLabel)}
                onMouseLeave={() => !isGhost && setHoveredLabel(null)}
                onClick={(e) => {
                  if (isGhost) return;
                  e.stopPropagation();
                  setSelectedElement({ type: 'door', id: door.id, data: door });
                }}
              >
                {door.doorType === 'double' ? (
                  // Double Doors
                  <g>
                    {/* Left Door Leaf */}
                    {(() => {
                      const leafW = (op.width - gap * 2 - cGap) / 2;
                      return (
                        <g>
                          <rect
                            x={opSvgX + gap}
                            y={opSvgY + gap}
                            width={leafW}
                            height={doorH}
                            rx="2"
                            fill={isSelected ? '#047857' : '#0f172a'}
                            stroke={isSelected ? '#34d399' : isGhost ? '#64748b' : '#334155'}
                            strokeWidth={isSelected ? '2.5' : '1.5'}
                            strokeDasharray={isGhost ? '4 2' : 'none'}
                            fillOpacity={isGhost ? 0.2 : 0.85}
                            className="transition hover:fill-emerald-900/60"
                          />
                          {/* Door Swing Diagonal Dashed Line (Left hinge) */}
                          <path
                            d={`M ${opSvgX + gap} ${opSvgY + gap} L ${opSvgX + gap + leafW} ${opSvgY + gap + doorH / 2} L ${opSvgX + gap} ${opSvgY + gap + doorH}`}
                            fill="none"
                            stroke="#64748b"
                            strokeWidth="1"
                            strokeDasharray="4 3"
                          />
                          {/* Handle */}
                          <rect
                            x={opSvgX + gap + leafW - 14}
                            y={opSvgY + gap + doorH / 2 - 25}
                            width="6"
                            height="50"
                            rx="2"
                            fill="#cbd5e1"
                            stroke="#64748b"
                            strokeWidth="0.8"
                          />
                        </g>
                      );
                    })()}

                    {/* Right Door Leaf */}
                    {(() => {
                      const leafW = (op.width - gap * 2 - cGap) / 2;
                      const rightX = opSvgX + gap + leafW + cGap;
                      return (
                        <g>
                          <rect
                            x={rightX}
                            y={opSvgY + gap}
                            width={leafW}
                            height={doorH}
                            rx="2"
                            fill={isSelected ? '#047857' : '#0f172a'}
                            stroke={isSelected ? '#34d399' : isGhost ? '#64748b' : '#334155'}
                            strokeWidth={isSelected ? '2.5' : '1.5'}
                            strokeDasharray={isGhost ? '4 2' : 'none'}
                            fillOpacity={isGhost ? 0.2 : 0.85}
                            className="transition hover:fill-emerald-900/60"
                          />
                          {/* Door Swing Diagonal Dashed Line (Right hinge) */}
                          <path
                            d={`M ${rightX + leafW} ${opSvgY + gap} L ${rightX} ${opSvgY + gap + doorH / 2} L ${rightX + leafW} ${opSvgY + gap + doorH}`}
                            fill="none"
                            stroke="#64748b"
                            strokeWidth="1"
                            strokeDasharray="4 3"
                          />
                          {/* Handle */}
                          <rect
                            x={rightX + 8}
                            y={opSvgY + gap + doorH / 2 - 25}
                            width="6"
                            height="50"
                            rx="2"
                            fill="#cbd5e1"
                            stroke="#64748b"
                            strokeWidth="0.8"
                          />
                        </g>
                      );
                    })()}
                  </g>
                ) : (
                  // Single Door
                  (() => {
                    const doorW = op.width - gap * 2;
                    const isRight = door.doorType === 'single-right';
                    const hingeX = isRight ? opSvgX + gap + doorW : opSvgX + gap;
                    const openX = isRight ? opSvgX + gap : opSvgX + gap + doorW;
                    const handleX = isRight ? opSvgX + gap + 10 : opSvgX + gap + doorW - 16;

                    return (
                      <g>
                        <rect
                          x={opSvgX + gap}
                          y={opSvgY + gap}
                          width={doorW}
                          height={doorH}
                          rx="2"
                          fill={isSelected ? '#047857' : '#0f172a'}
                          stroke={isSelected ? '#34d399' : isGhost ? '#64748b' : '#334155'}
                          strokeWidth={isSelected ? '2.5' : '1.5'}
                          strokeDasharray={isGhost ? '4 2' : 'none'}
                          fillOpacity={isGhost ? 0.2 : 0.85}
                          className="transition hover:fill-emerald-900/60"
                        />
                        {/* Door Swing Triangle */}
                        <path
                          d={`M ${hingeX} ${opSvgY + gap} L ${openX} ${opSvgY + gap + doorH / 2} L ${hingeX} ${opSvgY + gap + doorH}`}
                          fill="none"
                          stroke="#64748b"
                          strokeWidth="1"
                          strokeDasharray="4 3"
                        />
                        {/* Handle */}
                        <rect
                          x={handleX}
                          y={opSvgY + gap + doorH / 2 - 25}
                          width="6"
                          height="50"
                          rx="2"
                          fill="#cbd5e1"
                          stroke="#64748b"
                          strokeWidth="0.8"
                        />
                      </g>
                    );
                  })()
                )}
              </g>
            );
          })}

        {/* 8. DIMENSION LINES (CAD Workshop Styling) */}
        <g id="dimension-lines" className="pointer-events-none">
          {/* Top Overall Width */}
          <line
            x1={originX}
            y1={originY - 35}
            x2={originX + W}
            y2={originY - 35}
            stroke="#94a3b8"
            strokeWidth="1.2"
            markerStart="url(#arrow-start)"
            markerEnd="url(#arrow-end)"
          />
          <line x1={originX} y1={originY - 45} x2={originX} y2={originY} stroke="#475569" strokeWidth="0.8" />
          <line x1={originX + W} y1={originY - 45} x2={originX + W} y2={originY} stroke="#475569" strokeWidth="0.8" />
          <text
            x={originX + W / 2}
            y={originY - 42}
            textAnchor="middle"
            fill="#e2e8f0"
            fontSize="14"
            fontFamily="monospace"
            fontWeight="bold"
          >
            WIDTH: {W} mm
          </text>

          {/* Left Overall Height */}
          <line
            x1={originX - 45}
            y1={originY}
            x2={originX - 45}
            y2={originY + H}
            stroke="#94a3b8"
            strokeWidth="1.2"
            markerStart="url(#arrow-start)"
            markerEnd="url(#arrow-end)"
          />
          <line x1={originX - 55} y1={originY} x2={originX} y2={originY} stroke="#475569" strokeWidth="0.8" />
          <line x1={originX - 55} y1={originY + H} x2={originX} y2={originY + H} stroke="#475569" strokeWidth="0.8" />
          <text
            x={originX - 52}
            y={originY + H / 2}
            textAnchor="middle"
            dominantBaseline="central"
            transform={`rotate(-90 ${originX - 52} ${originY + H / 2})`}
            fill="#e2e8f0"
            fontSize="14"
            fontFamily="monospace"
            fontWeight="bold"
          >
            HEIGHT: {H} mm
          </text>

          {/* Plinth / Toe Kick dimension if present */}
          {activeCabinet.hasToeKick && toeKickH > 0 && (
            <g>
              <line
                x1={originX + W + 20}
                y1={originY + carcassH}
                x2={originX + W + 20}
                y2={originY + H}
                stroke="#64748b"
                strokeWidth="1"
                markerStart="url(#arrow-start)"
                markerEnd="url(#arrow-end)"
              />
              <text
                x={originX + W + 30}
                y={originY + carcassH + toeKickH / 2}
                fill="#94a3b8"
                fontSize="11"
                fontFamily="monospace"
                dominantBaseline="central"
              >
                Toe Kick {toeKickH} mm
              </text>
            </g>
          )}
        </g>
      </svg>
    </div>
  );
};
