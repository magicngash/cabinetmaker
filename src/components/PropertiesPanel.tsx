import React from 'react';
import { useProject } from '../context/ProjectContext';
import { calculateCabinetOpenings } from '../engine/parametricEngine';
import {
  Settings,
  Trash2,
  SplitSquareVertical,
  SplitSquareHorizontal,
  Layers,
  DoorClosed,
  Archive,
  Maximize2,
  Sliders,
  ChevronLeft,
  ChevronRight,
  ListFilter,
  Eye,
  Eraser,
} from 'lucide-react';

export const PropertiesPanel: React.FC = () => {
  const {
    activeCabinet,
    updateActiveCabinet,
    selectedElement,
    setSelectedElement,
    updatePartition,
    deletePartition,
    updateShelfGroup,
    deleteShelfGroup,
    updateDrawerStack,
    deleteDrawerStack,
    updateDoorConfig,
    deleteDoorConfig,
    addPartition,
    addShelfGroup,
    addDrawerStack,
    addDoorConfig,
    clearActiveCabinet,
  } = useProject();

  const openings = calculateCabinetOpenings(activeCabinet);

  // Helper to determine active dropdown key
  const currentKey =
    !selectedElement || selectedElement.type === 'cabinet'
      ? 'cabinet'
      : `${selectedElement.type}:${selectedElement.id}`;

  const handleDropdownSelect = (val: string) => {
    if (val === 'cabinet') {
      setSelectedElement({ type: 'cabinet', id: activeCabinet.id });
      return;
    }
    const [type, id] = val.split(':');
    if (type === 'partition') {
      const p = activeCabinet.partitions.find((item) => item.id === id);
      setSelectedElement({ type: 'partition', id, data: p });
    } else if (type === 'shelf') {
      const s = activeCabinet.shelves.find((item) => item.id === id);
      setSelectedElement({ type: 'shelf', id, data: s });
    } else if (type === 'drawer') {
      const d = activeCabinet.drawers.find((item) => item.id === id);
      setSelectedElement({ type: 'drawer', id, data: d });
    } else if (type === 'door') {
      const dr = activeCabinet.doors.find((item) => item.id === id);
      setSelectedElement({ type: 'door', id, data: dr });
    } else if (type === 'opening') {
      const op = openings.find((item) => item.id === id);
      setSelectedElement({ type: 'opening', id, data: op });
    }
  };

  // Reusable Top Element Switcher Bar
  const renderElementSwitcher = () => (
    <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 flex flex-col gap-2 shadow-inner">
      <div className="flex items-center justify-between">
        <label
          htmlFor="element-jump-selector"
          className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"
        >
          <ListFilter className="w-3.5 h-3.5 text-sky-400" />
          Select Element
        </label>
        {selectedElement && selectedElement.type !== 'cabinet' && (
          <button
            onClick={() => setSelectedElement({ type: 'cabinet', id: activeCabinet.id })}
            className="text-[11px] text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1 transition"
            title="Deselect element and return to cabinet parameters"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Back to Cabinet
          </button>
        )}
      </div>

      <select
        id="element-jump-selector"
        value={currentKey}
        onChange={(e) => handleDropdownSelect(e.target.value)}
        className="w-full bg-slate-800 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500 font-medium cursor-pointer"
      >
        <option value="cabinet">
          &bull; Entire Cabinet ({activeCabinet.width} × {activeCabinet.height} mm)
        </option>

        {activeCabinet.partitions.length > 0 && (
          <optgroup label="── Partitions ──">
            {activeCabinet.partitions.map((p, idx) => (
              <option key={p.id} value={`partition:${p.id}`}>
                {p.type === 'vertical' ? 'Vertical' : 'Horizontal'} #{idx + 1} ({p.positionType}: {p.positionValue}
                {p.positionType === 'percentage' ? '%' : 'mm'})
              </option>
            ))}
          </optgroup>
        )}

        {openings.length > 0 && (
          <optgroup label="── Bays & Openings ──">
            {openings.map((op, idx) => (
              <option key={op.id} value={`opening:${op.id}`}>
                Bay {idx + 1} ({Math.round(op.width)} × {Math.round(op.height)} mm)
              </option>
            ))}
          </optgroup>
        )}

        {activeCabinet.shelves.length > 0 && (
          <optgroup label="── Shelves ──">
            {activeCabinet.shelves.map((s, idx) => (
              <option key={s.id} value={`shelf:${s.id}`}>
                Shelving #{idx + 1} ({s.count} {s.shelfType} shelves)
              </option>
            ))}
          </optgroup>
        )}

        {activeCabinet.drawers.length > 0 && (
          <optgroup label="── Drawer Stacks ──">
            {activeCabinet.drawers.map((d, idx) => (
              <option key={d.id} value={`drawer:${d.id}`}>
                Drawer Stack #{idx + 1} ({d.count} drawers)
              </option>
            ))}
          </optgroup>
        )}

        {activeCabinet.doors.length > 0 && (
          <optgroup label="── Doors ──">
            {activeCabinet.doors.map((dr, idx) => (
              <option key={dr.id} value={`door:${dr.id}`}>
                Door #{idx + 1} ({dr.doorType})
              </option>
            ))}
          </optgroup>
        )}
      </select>
    </div>
  );

  // If no element selected or cabinet selected, render Cabinet Global Properties & Elements Outliner
  if (!selectedElement || selectedElement.type === 'cabinet') {
    return (
      <div className="w-80 h-full bg-slate-900 border-l border-slate-800 p-5 overflow-y-auto flex flex-col gap-6 text-slate-200 select-none">
        {/* Element Switcher Dropdown */}
        {renderElementSwitcher()}

        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 font-medium text-sm text-slate-100">
            <Settings className="w-4 h-4 text-emerald-400" />
            Cabinet Parameters
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            {activeCabinet.constructionType.toUpperCase()}
          </span>
        </div>

        {/* Cabinet Name */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="cab-name-input" className="text-xs text-slate-400 font-medium">Cabinet Name</label>
          <input
            id="cab-name-input"
            type="text"
            value={activeCabinet.name}
            onChange={(e) => updateActiveCabinet({ name: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-medium"
          />
        </div>

        {/* Overall Dimensions */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Overall Dimensions (mm)
          </span>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label htmlFor="cab-width-input" className="text-[11px] text-slate-400 block mb-1">Width</label>
              <input
                id="cab-width-input"
                type="number"
                min="200"
                max="3000"
                step="10"
                value={activeCabinet.width}
                onChange={(e) => updateActiveCabinet({ width: Math.max(100, Number(e.target.value)) })}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs font-mono text-slate-100 text-center focus:border-emerald-500"
              />
            </div>
            <div>
              <label htmlFor="cab-height-input" className="text-[11px] text-slate-400 block mb-1">Height</label>
              <input
                id="cab-height-input"
                type="number"
                min="200"
                max="3000"
                step="10"
                value={activeCabinet.height}
                onChange={(e) => updateActiveCabinet({ height: Math.max(100, Number(e.target.value)) })}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs font-mono text-slate-100 text-center focus:border-emerald-500"
              />
            </div>
            <div>
              <label htmlFor="cab-depth-input" className="text-[11px] text-slate-400 block mb-1">Depth</label>
              <input
                id="cab-depth-input"
                type="number"
                min="150"
                max="1200"
                step="10"
                value={activeCabinet.depth}
                onChange={(e) => updateActiveCabinet({ depth: Math.max(100, Number(e.target.value)) })}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs font-mono text-slate-100 text-center focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Board & Back Material Thickness */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Board &amp; Construction
          </span>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="board-thickness-select" className="text-[11px] text-slate-400 block mb-1">Carcass Board</label>
              <select
                id="board-thickness-select"
                value={activeCabinet.boardThickness}
                onChange={(e) => updateActiveCabinet({ boardThickness: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:border-emerald-500"
              >
                <option value={16}>16 mm (Standard)</option>
                <option value={18}>18 mm (Heavy Duty)</option>
                <option value={25}>25 mm (Premium)</option>
              </select>
            </div>

            <div>
              <label htmlFor="back-thickness-select" className="text-[11px] text-slate-400 block mb-1">Back Panel</label>
              <select
                id="back-thickness-select"
                value={activeCabinet.backThickness}
                onChange={(e) => updateActiveCabinet({ backThickness: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:border-emerald-500"
              >
                <option value={3}>3 mm Hardboard</option>
                <option value={6}>6 mm MDF</option>
                <option value={16}>16 mm Solid</option>
                <option value={18}>18 mm Solid</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="material-select" className="text-[11px] text-slate-400 block mb-1">Carcass Material</label>
            <select
              id="material-select"
              value={activeCabinet.material}
              onChange={(e) => updateActiveCabinet({ material: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:border-emerald-500"
            >
              <option value="White Melamine">White Melamine</option>
              <option value="MDF">MDF (Paint Grade)</option>
              <option value="Birch Plywood">Birch Plywood</option>
              <option value="Oak Veneer">Oak Veneer</option>
              <option value="Chipboard">Raw Chipboard</option>
              <option value="Custom">Custom Workshop Stock</option>
            </select>
          </div>

          <div>
            <label htmlFor="construction-type-select" className="text-[11px] text-slate-400 block mb-1">Construction Type</label>
            <select
              id="construction-type-select"
              value={activeCabinet.constructionType}
              onChange={(e) =>
                updateActiveCabinet({
                  constructionType: e.target.value as 'frameless' | 'face-frame',
                })
              }
              className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:border-emerald-500"
            >
              <option value="frameless">Frameless (Euro 32mm System)</option>
              <option value="face-frame">Face Frame (Traditional)</option>
            </select>
          </div>
        </div>

        {/* Toe Kick Plinth */}
        <div className="flex flex-col gap-3 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Toe Kick / Plinth
            </span>
            <input
              id="has-toe-kick-checkbox"
              type="checkbox"
              checked={activeCabinet.hasToeKick}
              onChange={(e) => updateActiveCabinet({ hasToeKick: e.target.checked })}
              className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
            />
          </div>

          {activeCabinet.hasToeKick && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="toe-kick-height-input" className="text-[11px] text-slate-400 block mb-1">Height (mm)</label>
                <input
                  id="toe-kick-height-input"
                  type="number"
                  min="50"
                  max="250"
                  step="5"
                  value={activeCabinet.toeKickHeight}
                  onChange={(e) => updateActiveCabinet({ toeKickHeight: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs font-mono text-slate-100 text-center"
                />
              </div>
              <div>
                <label htmlFor="toe-kick-setback-input" className="text-[11px] text-slate-400 block mb-1">Setback (mm)</label>
                <input
                  id="toe-kick-setback-input"
                  type="number"
                  min="0"
                  max="150"
                  step="5"
                  value={activeCabinet.toeKickSetback}
                  onChange={(e) => updateActiveCabinet({ toeKickSetback: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs font-mono text-slate-100 text-center"
                />
              </div>
            </div>
          )}
        </div>

        {/* CABINET STRUCTURE & ELEMENTS OUTLINER (Guarantees zero-misclick selection) */}
        <div className="flex flex-col gap-3 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <ListFilter className="w-3.5 h-3.5 text-emerald-400" />
              Cabinet Outliner
            </span>
            {activeCabinet.partitions.length > 0 ||
            activeCabinet.shelves.length > 0 ||
            activeCabinet.drawers.length > 0 ||
            activeCabinet.doors.length > 0 ? (
              <button
                id="btn-clear-cabinet-outliner"
                onClick={clearActiveCabinet}
                className="text-[11px] text-orange-400 hover:text-orange-300 hover:underline flex items-center gap-1 transition"
                title="Remove all partitions, shelves, drawers and doors from this cabinet"
              >
                <Eraser className="w-3 h-3" />
                Clear All
              </button>
            ) : (
              <span className="text-[10px] text-slate-500 font-mono">Empty Carcass</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5 max-h-80 overflow-y-auto pr-1">
            {/* Partitions */}
            {activeCabinet.partitions.map((p, idx) => (
              <div
                key={p.id}
                onClick={() => setSelectedElement({ type: 'partition', id: p.id, data: p })}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 cursor-pointer transition group"
              >
                <div className="flex items-center gap-2.5">
                  {p.type === 'vertical' ? (
                    <SplitSquareVertical className="w-4 h-4 text-sky-400 shrink-0" />
                  ) : (
                    <SplitSquareHorizontal className="w-4 h-4 text-sky-400 shrink-0" />
                  )}
                  <div>
                    <div className="text-xs font-medium text-slate-200 group-hover:text-sky-300">
                      {p.type === 'vertical' ? 'Vertical Partition' : 'Horizontal Partition'} #{idx + 1}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {p.positionType === 'equal' ? 'Center (50%)' : `${p.positionType}: ${p.positionValue}${p.positionType === 'percentage' ? '%' : 'mm'}`}
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePartition(p.id);
                  }}
                  className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-950/40 rounded transition opacity-0 group-hover:opacity-100"
                  title="Delete Partition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {/* Shelves */}
            {activeCabinet.shelves.map((s, idx) => (
              <div
                key={s.id}
                onClick={() => setSelectedElement({ type: 'shelf', id: s.id, data: s })}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 cursor-pointer transition group"
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-purple-400 shrink-0" />
                  <div>
                    <div className="text-xs font-medium text-slate-200 group-hover:text-purple-300">
                      Shelving Group #{idx + 1}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {s.count} &bull; {s.shelfType}
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteShelfGroup(s.id);
                  }}
                  className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-950/40 rounded transition opacity-0 group-hover:opacity-100"
                  title="Delete Shelves"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {/* Drawers */}
            {activeCabinet.drawers.map((d, idx) => (
              <div
                key={d.id}
                onClick={() => setSelectedElement({ type: 'drawer', id: d.id, data: d })}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 cursor-pointer transition group"
              >
                <div className="flex items-center gap-2.5">
                  <Archive className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="text-xs font-medium text-slate-200 group-hover:text-amber-300">
                      Drawer Stack #{idx + 1}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {d.count} drawers &bull; {d.runnerType}
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteDrawerStack(d.id);
                  }}
                  className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-950/40 rounded transition opacity-0 group-hover:opacity-100"
                  title="Delete Drawers"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {/* Doors */}
            {activeCabinet.doors.map((dr, idx) => (
              <div
                key={dr.id}
                onClick={() => setSelectedElement({ type: 'door', id: dr.id, data: dr })}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 cursor-pointer transition group"
              >
                <div className="flex items-center gap-2.5">
                  <DoorClosed className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-xs font-medium text-slate-200 group-hover:text-emerald-300">
                      Door #{idx + 1}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {dr.doorType} &bull; {dr.overlay}
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteDoorConfig(dr.id);
                  }}
                  className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-950/40 rounded transition opacity-0 group-hover:opacity-100"
                  title="Delete Door"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {/* Openings / Bays */}
            {openings.map((op, idx) => (
              <div
                key={op.id}
                onClick={() => setSelectedElement({ type: 'opening', id: op.id, data: op })}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/60 border border-slate-700/40 cursor-pointer transition group"
              >
                <div className="flex items-center gap-2.5">
                  <Maximize2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <div>
                    <div className="text-xs font-medium text-slate-200 group-hover:text-blue-300">
                      Opening Bay {idx + 1}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {Math.round(op.width)} × {Math.round(op.height)} mm
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-blue-400 font-medium px-1.5 py-0.5 rounded bg-blue-950/50 border border-blue-800/40">
                  Insert
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Opening Selected
  if (selectedElement.type === 'opening') {
    const opening = openings.find((o) => o.id === selectedElement.id) || selectedElement.data;
    return (
      <div className="w-80 h-full bg-slate-900 border-l border-slate-800 p-5 overflow-y-auto flex flex-col gap-6 text-slate-200 select-none">
        {/* Element Switcher Dropdown */}
        {renderElementSwitcher()}

        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 font-medium text-sm text-blue-400">
            <Maximize2 className="w-4 h-4" />
            Selected Opening ({opening ? `${Math.round(opening.width)} × ${Math.round(opening.height)} mm` : ''})
          </div>
        </div>

        <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60 flex flex-col gap-1 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Available Width:</span>
            <span className="font-mono text-slate-100 font-semibold">{Math.round(opening?.width || 0)} mm</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Available Height:</span>
            <span className="font-mono text-slate-100 font-semibold">{Math.round(opening?.height || 0)} mm</span>
          </div>
        </div>

        {/* Subdivide or Insert Components */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Insert Into This Opening
          </span>

          <button
            id="btn-insert-shelves"
            onClick={() => addShelfGroup(opening?.id)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 transition text-left"
          >
            <Layers className="w-4 h-4 text-purple-400" />
            <div>
              <div className="font-medium">Add Shelves</div>
              <div className="text-[11px] text-slate-400">Insert adjustable or fixed shelves</div>
            </div>
          </button>

          <button
            id="btn-insert-drawers"
            onClick={() => addDrawerStack(opening?.id)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 transition text-left"
          >
            <Archive className="w-4 h-4 text-sky-400" />
            <div>
              <div className="font-medium">Add Drawer Stack</div>
              <div className="text-[11px] text-slate-400">Insert 2, 3, or 4 drawers</div>
            </div>
          </button>

          <button
            id="btn-insert-door"
            onClick={() => addDoorConfig(opening?.id)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 transition text-left"
          >
            <DoorClosed className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="font-medium">Add Door</div>
              <div className="text-[11px] text-slate-400">Single or pair of doors</div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // Partition Selected
  if (selectedElement.type === 'partition') {
    const part = activeCabinet.partitions.find((p) => p.id === selectedElement.id);
    if (!part) return null;

    return (
      <div className="w-80 h-full bg-slate-900 border-l border-slate-800 p-5 overflow-y-auto flex flex-col gap-6 text-slate-200 select-none">
        {/* Element Switcher Dropdown */}
        {renderElementSwitcher()}

        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 font-medium text-sm text-sky-400">
            <Sliders className="w-4 h-4" />
            {part.type === 'vertical' ? 'Vertical Partition' : 'Horizontal Partition'}
          </div>
          <button
            onClick={() => deletePartition(part.id)}
            className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-950/40"
            title="Delete Partition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Position Type */}
        <div className="flex flex-col gap-2">
          <label htmlFor="partition-position-type" className="text-xs text-slate-400 font-medium">Position Method</label>
          <select
            id="partition-position-type"
            value={part.positionType}
            onChange={(e) => updatePartition(part.id, { positionType: e.target.value as any })}
            className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100"
          >
            <option value="equal">Equal Division (Center / 50%)</option>
            <option value="percentage">Percentage (%)</option>
            {part.type === 'vertical' ? (
              <>
                <option value="from-left">Fixed from Left (mm)</option>
                <option value="from-right">Fixed from Right (mm)</option>
              </>
            ) : (
              <>
                <option value="from-bottom">Fixed from Bottom (mm)</option>
                <option value="from-top">Fixed from Top (mm)</option>
              </>
            )}
          </select>
        </div>

        {/* Position Value */}
        {part.positionType !== 'equal' && (
          <div className="flex flex-col gap-2">
            <label htmlFor="partition-position-value" className="text-xs text-slate-400 font-medium">
              Position Value ({part.positionType === 'percentage' ? '%' : 'mm'})
            </label>
            <input
              id="partition-position-value"
              type="number"
              min={part.positionType === 'percentage' ? 5 : 50}
              max={part.positionType === 'percentage' ? 95 : 2500}
              step={part.positionType === 'percentage' ? 5 : 10}
              value={part.positionValue}
              onChange={(e) => updatePartition(part.id, { positionValue: Number(e.target.value) })}
              className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs font-mono text-slate-100"
            />
          </div>
        )}

        {/* Thickness */}
        <div className="flex flex-col gap-2">
          <label htmlFor="partition-thickness" className="text-xs text-slate-400 font-medium">Partition Thickness (mm)</label>
          <input
            id="partition-thickness"
            type="number"
            min="12"
            max="30"
            value={part.thickness}
            onChange={(e) => updatePartition(part.id, { thickness: Number(e.target.value) })}
            className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs font-mono text-slate-100"
          />
        </div>

        <button
          onClick={() => deletePartition(part.id)}
          className="mt-4 flex items-center justify-center gap-2 py-2 px-3 rounded bg-red-900/30 hover:bg-red-900/50 text-red-300 border border-red-800/60 text-xs transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Remove Partition
        </button>
      </div>
    );
  }

  // Shelf Selected
  if (selectedElement.type === 'shelf') {
    const shelf = activeCabinet.shelves.find((s) => s.id === selectedElement.id);
    if (!shelf) return null;

    return (
      <div className="w-80 h-full bg-slate-900 border-l border-slate-800 p-5 overflow-y-auto flex flex-col gap-6 text-slate-200 select-none">
        {/* Element Switcher Dropdown */}
        {renderElementSwitcher()}

        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 font-medium text-sm text-purple-400">
            <Layers className="w-4 h-4" />
            Shelving Configuration
          </div>
          <button
            onClick={() => deleteShelfGroup(shelf.id)}
            className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-950/40"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="shelf-type-select" className="text-xs text-slate-400 font-medium">Shelf Type</label>
          <select
            id="shelf-type-select"
            value={shelf.shelfType}
            onChange={(e) => updateShelfGroup(shelf.id, { shelfType: e.target.value as any })}
            className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100"
          >
            <option value="adjustable">Adjustable (32mm Pin System)</option>
            <option value="fixed">Fixed Structural (Dowelled/Screwed)</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="shelf-count-input" className="text-xs text-slate-400 font-medium">Number of Shelves</label>
          <input
            id="shelf-count-input"
            type="number"
            min="1"
            max="12"
            value={shelf.count}
            onChange={(e) => updateShelfGroup(shelf.id, { count: Math.max(1, Number(e.target.value)) })}
            className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs font-mono text-slate-100"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="shelf-setback-input" className="text-xs text-slate-400 font-medium">Front Setback (mm)</label>
          <input
            id="shelf-setback-input"
            type="number"
            min="0"
            max="50"
            value={shelf.setback}
            onChange={(e) => updateShelfGroup(shelf.id, { setback: Number(e.target.value) })}
            className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs font-mono text-slate-100"
          />
        </div>

        <button
          onClick={() => deleteShelfGroup(shelf.id)}
          className="mt-4 flex items-center justify-center gap-2 py-2 px-3 rounded bg-red-900/30 hover:bg-red-900/50 text-red-300 border border-red-800/60 text-xs transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Remove Shelves
        </button>
      </div>
    );
  }

  // Drawer Stack Selected
  if (selectedElement.type === 'drawer') {
    const dr = activeCabinet.drawers.find((d) => d.id === selectedElement.id);
    if (!dr) return null;

    return (
      <div className="w-80 h-full bg-slate-900 border-l border-slate-800 p-5 overflow-y-auto flex flex-col gap-6 text-slate-200 select-none">
        {/* Element Switcher Dropdown */}
        {renderElementSwitcher()}

        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 font-medium text-sm text-sky-400">
            <Archive className="w-4 h-4" />
            Drawer Stack Parameters
          </div>
          <button
            onClick={() => deleteDrawerStack(dr.id)}
            className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-950/40"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="drawer-count-input" className="text-xs text-slate-400 font-medium">Number of Drawers</label>
          <input
            id="drawer-count-input"
            type="number"
            min="1"
            max="6"
            value={dr.count}
            onChange={(e) => {
              const count = Math.max(1, Number(e.target.value));
              updateDrawerStack(dr.id, { count, customHeights: undefined });
            }}
            className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs font-mono text-slate-100"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="runner-type-select" className="text-xs text-slate-400 font-medium">Drawer Runner Type</label>
          <select
            id="runner-type-select"
            value={dr.runnerType}
            onChange={(e) =>
              updateDrawerStack(dr.id, {
                runnerType: e.target.value as any,
                sideClearance: e.target.value === 'undermount-soft-close' ? 21 : 25.4,
              })
            }
            className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100"
          >
            <option value="undermount-soft-close">Undermount Soft-Close (e.g. Blum Tandem/Movento)</option>
            <option value="side-mount-ball-bearing">Side-Mount Ball Bearing (12.7mm each side)</option>
            <option value="roller">Roller Runners</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="runner-length-input" className="text-[11px] text-slate-400 block mb-1">Runner Length</label>
            <select
              id="runner-length-input"
              value={dr.runnerLength || 500}
              onChange={(e) => updateDrawerStack(dr.id, { runnerLength: Number(e.target.value) })}
              className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-100"
            >
              <option value={300}>300 mm</option>
              <option value={350}>350 mm</option>
              <option value={400}>400 mm</option>
              <option value={450}>450 mm</option>
              <option value={500}>500 mm</option>
              <option value={550}>550 mm</option>
            </select>
          </div>

          <div>
            <label htmlFor="drawer-gap-input" className="text-[11px] text-slate-400 block mb-1">Reveal Gap</label>
            <input
              id="drawer-gap-input"
              type="number"
              min="1"
              max="6"
              value={dr.frontGap || 3}
              onChange={(e) => updateDrawerStack(dr.id, { frontGap: Number(e.target.value) })}
              className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs font-mono text-slate-100"
            />
          </div>
        </div>

        <button
          onClick={() => deleteDrawerStack(dr.id)}
          className="mt-4 flex items-center justify-center gap-2 py-2 px-3 rounded bg-red-900/30 hover:bg-red-900/50 text-red-300 border border-red-800/60 text-xs transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Remove Drawer Stack
        </button>
      </div>
    );
  }

  // Door Selected
  if (selectedElement.type === 'door') {
    const door = activeCabinet.doors.find((d) => d.id === selectedElement.id);
    if (!door) return null;

    return (
      <div className="w-80 h-full bg-slate-900 border-l border-slate-800 p-5 overflow-y-auto flex flex-col gap-6 text-slate-200 select-none">
        {/* Element Switcher Dropdown */}
        {renderElementSwitcher()}

        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 font-medium text-sm text-emerald-400">
            <DoorClosed className="w-4 h-4" />
            Door Configuration
          </div>
          <button
            onClick={() => deleteDoorConfig(door.id)}
            className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-950/40"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="door-type-select" className="text-xs text-slate-400 font-medium">Door Type</label>
          <select
            id="door-type-select"
            value={door.doorType}
            onChange={(e) => updateDoorConfig(door.id, { doorType: e.target.value as any })}
            className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100"
          >
            <option value="single-left">Single Door (Left Hinge)</option>
            <option value="single-right">Single Door (Right Hinge)</option>
            <option value="double">Pair of Doors (Double)</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="door-overlay-select" className="text-xs text-slate-400 font-medium">Hinge Overlay Style</label>
          <select
            id="door-overlay-select"
            value={door.overlay}
            onChange={(e) => updateDoorConfig(door.id, { overlay: e.target.value as any })}
            className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100"
          >
            <option value="full-overlay">Full Overlay (Standard Euro)</option>
            <option value="half-overlay">Half Overlay (Twin Door on Center Gable)</option>
            <option value="inset">Inset (Flush with Carcass Face)</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="perimeter-gap-input" className="text-[11px] text-slate-400 block mb-1">Perimeter Gap (mm)</label>
            <input
              id="perimeter-gap-input"
              type="number"
              min="1"
              max="6"
              value={door.doorGap}
              onChange={(e) => updateDoorConfig(door.id, { doorGap: Number(e.target.value) })}
              className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-xs font-mono text-slate-100 text-center"
            />
          </div>
          {door.doorType === 'double' && (
            <div>
              <label htmlFor="centre-gap-input" className="text-[11px] text-slate-400 block mb-1">Centre Gap (mm)</label>
              <input
                id="centre-gap-input"
                type="number"
                min="1"
                max="6"
                value={door.centreGap}
                onChange={(e) => updateDoorConfig(door.id, { centreGap: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-xs font-mono text-slate-100 text-center"
              />
            </div>
          )}
        </div>

        <button
          onClick={() => deleteDoorConfig(door.id)}
          className="mt-4 flex items-center justify-center gap-2 py-2 px-3 rounded bg-red-900/30 hover:bg-red-900/50 text-red-300 border border-red-800/60 text-xs transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Remove Door
        </button>
      </div>
    );
  }

  return null;
};
