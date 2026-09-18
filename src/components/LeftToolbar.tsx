import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { CABINET_PRESETS } from '../engine/sampleData';
import {
  SplitSquareVertical,
  SplitSquareHorizontal,
  DoorClosed,
  Archive,
  Layers,
  Trash2,
  Copy,
  PlusCircle,
  FolderPlus,
  Eraser,
  RotateCcw,
  AlertCircle,
  Check,
  X,
  Undo2,
  Redo2,
  FileText,
} from 'lucide-react';

interface LeftToolbarProps {
  onOpenManual?: () => void;
}

export const LeftToolbar: React.FC<LeftToolbarProps> = ({ onOpenManual }) => {
  const {
    activeCabinet,
    addPartition,
    addShelfGroup,
    addDrawerStack,
    addDoorConfig,
    deleteSelectedElement,
    selectedElement,
    addCabinet,
    clearActiveCabinet,
    clearWorkspace,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useProject();

  const [confirmClearCab, setConfirmClearCab] = useState(false);
  const [confirmClearWork, setConfirmClearWork] = useState(false);

  const hasInteriorElements =
    activeCabinet &&
    (activeCabinet.partitions.length > 0 ||
      activeCabinet.shelves.length > 0 ||
      activeCabinet.drawers.length > 0 ||
      activeCabinet.doors.length > 0);

  return (
    <div className="w-56 h-full bg-slate-900 border-r border-slate-800 p-3 flex flex-col justify-between select-none text-slate-200 overflow-y-auto">
      {/* Primary CAD Action Buttons */}
      <div className="flex flex-col gap-4">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 block mb-2">
            Cabinet Components
          </span>

          <div className="flex flex-col gap-1">
            <button
              id="tb-add-vertical-partition"
              onClick={() => addPartition('vertical')}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
              title="Add Vertical Partition"
            >
              <SplitSquareVertical className="w-4 h-4 text-sky-400" />
              <span>Vertical Partition</span>
            </button>

            <button
              id="tb-add-horizontal-partition"
              onClick={() => addPartition('horizontal')}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
              title="Add Horizontal Partition"
            >
              <SplitSquareHorizontal className="w-4 h-4 text-sky-400" />
              <span>Horizontal Partition</span>
            </button>

            <button
              id="tb-add-door"
              onClick={() => addDoorConfig()}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
              title="Add Door"
            >
              <DoorClosed className="w-4 h-4 text-emerald-400" />
              <span>Add Door</span>
            </button>

            <button
              id="tb-add-drawers"
              onClick={() => addDrawerStack()}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
              title="Add Drawer Stack"
            >
              <Archive className="w-4 h-4 text-amber-400" />
              <span>Add Drawer Stack</span>
            </button>

            <button
              id="tb-add-shelves"
              onClick={() => addShelfGroup()}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
              title="Add Shelves"
            >
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Add Shelves</span>
            </button>
          </div>
        </div>

        {/* Selected Element Controls */}
        {selectedElement && selectedElement.type !== 'cabinet' && (
          <div className="pt-2 border-t border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 block mb-2">
              Element Actions
            </span>

            <button
              id="tb-delete-selected"
              onClick={deleteSelectedElement}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium text-red-400 hover:bg-red-950/40 hover:text-red-300 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected</span>
            </button>
          </div>
        )}

        {/* History / Undo & Redo Controls */}
        <div className="pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              History
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Ctrl+Z</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              id="tb-undo-btn"
              onClick={undo}
              disabled={!canUndo}
              className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-200 disabled:text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700/60 transition cursor-pointer"
              title="Undo last action (Ctrl+Z or Cmd+Z)"
            >
              <Undo2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Undo</span>
            </button>
            <button
              id="tb-redo-btn"
              onClick={redo}
              disabled={!canRedo}
              className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-200 disabled:text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700/60 transition cursor-pointer"
              title="Redo action (Ctrl+Y or Cmd+Shift+Z)"
            >
              <Redo2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Redo</span>
            </button>
          </div>
        </div>

        {/* Workplace & Clear Actions */}
        <div className="pt-2 border-t border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 block mb-2">
            Clear &amp; Reset
          </span>

          <div className="flex flex-col gap-1.5">
            {/* Clear Cabinet Interior */}
            {!confirmClearCab ? (
              <button
                id="tb-clear-cabinet"
                onClick={() => {
                  setConfirmClearCab(true);
                  setConfirmClearWork(false);
                }}
                disabled={!hasInteriorElements}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
                title="Remove all partitions, shelves, doors, and drawers from this cabinet"
              >
                <div className="flex items-center gap-2">
                  <Eraser className="w-4 h-4 text-orange-400" />
                  <span>Clear Cabinet</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Empty</span>
              </button>
            ) : (
              <div className="p-2.5 rounded-lg bg-orange-950/30 border border-orange-800/60 flex flex-col gap-2">
                <div className="text-[11px] text-orange-200 font-medium leading-tight flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
                  <span>Remove all shelves, doors, drawers &amp; partitions?</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    id="btn-confirm-clear-cab"
                    onClick={() => {
                      clearActiveCabinet();
                      setConfirmClearCab(false);
                    }}
                    className="flex-1 py-1 px-2 rounded bg-orange-600 hover:bg-orange-500 text-white font-medium text-[11px] transition text-center"
                  >
                    Yes, Clear
                  </button>
                  <button
                    onClick={() => setConfirmClearCab(false)}
                    className="py-1 px-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Clear Workplace / Reset to Blank */}
            {!confirmClearWork ? (
              <button
                id="tb-clear-workspace"
                onClick={() => {
                  setConfirmClearWork(true);
                  setConfirmClearCab(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
                title="Reset workplace to a clean blank cabinet"
              >
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-rose-400" />
                  <span>Reset Workplace</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Fresh</span>
              </button>
            ) : (
              <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-800/60 flex flex-col gap-2">
                <div className="text-[11px] text-rose-200 font-medium leading-tight flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  <span>Reset workplace to a single clean empty cabinet?</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    id="btn-confirm-reset-workplace"
                    onClick={() => {
                      clearWorkspace();
                      setConfirmClearWork(false);
                    }}
                    className="flex-1 py-1 px-2 rounded bg-rose-600 hover:bg-rose-500 text-white font-medium text-[11px] transition text-center"
                  >
                    Yes, Reset
                  </button>
                  <button
                    onClick={() => setConfirmClearWork(false)}
                    className="py-1 px-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preset Library for Fast Testing */}
        <div className="pt-2 border-t border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 block mb-2">
            Cabinet Presets
          </span>

          <div className="flex flex-col gap-1 max-h-40 overflow-y-auto pr-1">
            {CABINET_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => addCabinet(preset.create())}
                className="text-left px-2.5 py-1.5 rounded hover:bg-slate-800 transition text-[11px] text-slate-300 hover:text-slate-100 flex flex-col"
                title={preset.description}
              >
                <span className="font-medium">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>
        {/* Help & User Manual */}
        {onOpenManual && (
          <div className="pt-2 border-t border-slate-800">
            <button
              id="tb-user-manual-btn"
              onClick={onOpenManual}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-emerald-300 hover:text-emerald-200 bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-800/40 transition cursor-pointer"
              title="Open User Instructions Manual (View & Download PDF)"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>User Manual</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/20 rounded font-mono font-bold text-emerald-400">
                PDF
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="text-[10px] text-slate-500 text-center font-mono border-t border-slate-800 pt-3 mt-4">
        CabinetCut v1.0 &bull; Parametric CAD
      </div>
    </div>
  );
};
