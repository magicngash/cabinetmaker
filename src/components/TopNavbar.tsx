import React from 'react';
import { useProject } from '../context/ProjectContext';
import {
  Layers,
  Scissors,
  DollarSign,
  Box,
  Eye,
  Undo2,
  Redo2,
  FolderKanban,
  AlertTriangle,
  CheckCircle,
  Plus,
  ChevronDown,
  FileText,
} from 'lucide-react';

export type MainTabType =
  | 'front'
  | 'inside'
  | 'side'
  | 'top'
  | '3d'
  | 'cutlist'
  | 'optimizer'
  | 'cost';

interface TopNavbarProps {
  activeTab: MainTabType;
  setActiveTab: (tab: MainTabType) => void;
  onOpenDashboard: () => void;
  onOpenManual: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenDashboard,
  onOpenManual,
}) => {
  const {
    project,
    activeCabinet,
    activeCabinetId,
    setActiveCabinetId,
    addCabinet,
    undo,
    redo,
    canUndo,
    canRedo,
    designValidation,
  } = useProject();

  const handleAddNewCabinet = () => {
    const newId = `cab-${Date.now()}`;
    addCabinet({
      id: newId,
      name: `Cabinet ${project.cabinets.length + 1}`,
      width: 800,
      height: 900,
      depth: 600,
      boardThickness: project.defaultBoardThickness,
      backThickness: project.defaultBackThickness,
      backInset: 16,
      constructionType: 'frameless',
      material: 'White Melamine',
      hasToeKick: true,
      toeKickHeight: 100,
      toeKickSetback: 50,
      partitions: [],
      shelves: [{ id: `sh-${Date.now()}`, shelfType: 'adjustable', count: 1, setback: 12 }],
      drawers: [],
      doors: [{ id: `dr-${Date.now()}`, doorType: 'double', overlayType: 'full-overlay', doorGap: 2, centreGap: 3 }],
    });
  };

  const issues = designValidation || [];
  const hasErrors = issues.some((v) => v.level === 'error');
  const hasWarnings = issues.some((v) => v.level === 'warning');

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between select-none z-30 shrink-0">
      {/* Brand & Project Metadata */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black">
            <Scissors className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5">
              Cabinet<span className="text-emerald-400">Cut</span>
            </div>
          </div>
        </div>

        <div className="h-5 w-px bg-slate-800" />

        {/* Project Selector / Dashboard Trigger */}
        <button
          id="btn-project-dashboard"
          onClick={onOpenDashboard}
          className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-xs text-slate-200 transition text-left"
          title="Open Project Dashboard"
        >
          <FolderKanban className="w-3.5 h-3.5 text-emerald-400" />
          <div className="flex flex-col">
            <span className="font-semibold text-[11px] leading-tight text-slate-100 truncate max-w-[130px]">
              {project.name}
            </span>
            <span className="text-[9px] text-slate-400 leading-tight">
              {project.roomLocation || 'Kitchen'}
            </span>
          </div>
          <ChevronDown className="w-3 h-3 text-slate-400 ml-1" />
        </button>

        {/* Cabinet Selector Pill Dropdown */}
        <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700/80 rounded-lg p-0.5">
          <select
            id="cabinet-select-dropdown"
            value={activeCabinetId}
            onChange={(e) => setActiveCabinetId(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-200 px-2 py-1 focus:outline-none cursor-pointer"
          >
            {project.cabinets.map((cab) => (
              <option key={cab.id} value={cab.id} className="bg-slate-900 text-slate-200">
                {cab.name} ({cab.width}×{cab.height})
              </option>
            ))}
          </select>
          <button
            id="btn-add-cabinet"
            onClick={handleAddNewCabinet}
            className="p-1 hover:bg-slate-700 text-slate-300 rounded transition"
            title="Add New Cabinet to Project"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
          </button>
        </div>
      </div>

      {/* Center Main View Navigation Tabs */}
      <nav className="flex items-center gap-1 bg-slate-950/80 border border-slate-800 rounded-xl p-1 text-xs font-medium">
        <button
          id="nav-tab-front"
          onClick={() => setActiveTab('front')}
          className={`px-3 py-1.5 rounded-lg transition ${
            activeTab === 'front'
              ? 'bg-emerald-600 text-white shadow-sm font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Front Elevation
        </button>

        <button
          id="nav-tab-inside"
          onClick={() => setActiveTab('inside')}
          className={`px-2.5 py-1.5 rounded-lg transition ${
            activeTab === 'inside'
              ? 'bg-emerald-600 text-white shadow-sm font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Inside View
        </button>

        <button
          id="nav-tab-side"
          onClick={() => setActiveTab('side')}
          className={`px-2.5 py-1.5 rounded-lg transition ${
            activeTab === 'side'
              ? 'bg-emerald-600 text-white shadow-sm font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Side View
        </button>

        <button
          id="nav-tab-top"
          onClick={() => setActiveTab('top')}
          className={`px-2.5 py-1.5 rounded-lg transition ${
            activeTab === 'top'
              ? 'bg-emerald-600 text-white shadow-sm font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Top View
        </button>

        <button
          id="nav-tab-3d"
          onClick={() => setActiveTab('3d')}
          className={`px-2.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
            activeTab === '3d'
              ? 'bg-emerald-600 text-white shadow-sm font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Box className="w-3.5 h-3.5" />
          3D View
        </button>

        <div className="h-4 w-px bg-slate-800 mx-1" />

        <button
          id="nav-tab-cutlist"
          onClick={() => setActiveTab('cutlist')}
          className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
            activeTab === 'cutlist'
              ? 'bg-emerald-600 text-white shadow-sm font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Cutting List
        </button>

        <button
          id="nav-tab-optimizer"
          onClick={() => setActiveTab('optimizer')}
          className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
            activeTab === 'optimizer'
              ? 'bg-emerald-600 text-white shadow-sm font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Scissors className="w-3.5 h-3.5" />
          Sheet Nesting
        </button>

        <button
          id="nav-tab-cost"
          onClick={() => setActiveTab('cost')}
          className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
            activeTab === 'cost'
              ? 'bg-emerald-600 text-white shadow-sm font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          Cost Quote
        </button>
      </nav>

      {/* Right Controls: Undo/Redo & Validation Warnings */}
      <div className="flex items-center gap-3">
        {/* Undo / Redo */}
        <div className="flex items-center gap-1 bg-slate-800/90 border border-slate-700 rounded-lg p-0.5 shadow-sm">
          <button
            id="btn-undo"
            onClick={undo}
            disabled={!canUndo}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-200 hover:text-white disabled:text-slate-500 disabled:opacity-40 rounded hover:bg-slate-700/80 transition font-medium cursor-pointer disabled:cursor-not-allowed"
            title="Undo (Ctrl+Z or Cmd+Z)"
          >
            <Undo2 className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-[11px]">Undo</span>
          </button>
          <div className="h-3.5 w-px bg-slate-700" />
          <button
            id="btn-redo"
            onClick={redo}
            disabled={!canRedo}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-200 hover:text-white disabled:text-slate-500 disabled:opacity-40 rounded hover:bg-slate-700/80 transition font-medium cursor-pointer disabled:cursor-not-allowed"
            title="Redo (Ctrl+Y or Cmd+Shift+Z)"
          >
            <Redo2 className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-[11px]">Redo</span>
          </button>
        </div>

        {/* User Manual & PDF Guide Button */}
        <button
          id="btn-open-user-manual"
          onClick={onOpenManual}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700/90 border border-slate-700 rounded-lg shadow-sm font-medium transition cursor-pointer"
          title="Open User Instructions Manual (View & Download PDF)"
        >
          <FileText className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">User Manual</span>
          <span className="text-[10px] px-1 py-0.2 bg-emerald-500/20 text-emerald-300 rounded font-mono font-semibold">
            PDF
          </span>
        </button>

        {/* Validation Status Indicator */}
        {issues.length > 0 ? (
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
              hasErrors
                ? 'bg-rose-950/40 text-rose-300 border-rose-800/80'
                : 'bg-amber-950/40 text-amber-300 border-amber-800/80'
            }`}
            title={issues.map((v) => v.message).join('\n')}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {issues[0].message}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-emerald-400 bg-emerald-950/30 border border-emerald-800/50">
            <CheckCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Valid CAD Geometry</span>
          </div>
        )}
      </div>
    </header>
  );
};
