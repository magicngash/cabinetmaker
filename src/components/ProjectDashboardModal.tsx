import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import {
  FolderKanban,
  X,
  Plus,
  Trash2,
  Check,
  FolderOpen,
  Save,
  Building,
  User,
  Settings2,
  Layers,
  Box,
} from 'lucide-react';
import { Project } from '../types';

interface ProjectDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectDashboardModal: React.FC<ProjectDashboardModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    project,
    updateProjectDetails,
    savedProjects,
    saveProject,
    loadProject,
    deleteProjectFromStorage,
    createNewProject,
    activeCabinetId,
    setActiveCabinetId,
    deleteCabinet,
  } = useProject();

  const [activeTab, setActiveTab] = useState<'details' | 'cabinets' | 'saved'>('details');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FolderKanban className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Project Dashboard</h2>
              <p className="text-xs text-slate-400">
                Manage project metadata, global material standards, and cabinets.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center px-6 border-b border-slate-800 bg-slate-900/50 text-xs">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 px-4 font-medium border-b-2 transition ${
              activeTab === 'details'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Project Details & Defaults
          </button>
          <button
            onClick={() => setActiveTab('cabinets')}
            className={`py-3 px-4 font-medium border-b-2 transition ${
              activeTab === 'cabinets'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Cabinets List ({project.cabinets.length})
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`py-3 px-4 font-medium border-b-2 transition ${
              activeTab === 'saved'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Saved Projects ({savedProjects.length})
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'details' && (
            <div className="flex flex-col gap-5 text-xs text-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Project Name</label>
                  <input
                    type="text"
                    value={project.name}
                    onChange={(e) => updateProjectDetails({ name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Client / Customer</label>
                  <input
                    type="text"
                    value={project.clientName}
                    onChange={(e) => updateProjectDetails({ clientName: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Room / Jobsite</label>
                  <input
                    type="text"
                    value={project.roomLocation}
                    onChange={(e) => updateProjectDetails({ roomLocation: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
                  Default Workshop Standards
                </span>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-slate-400 block mb-1 font-medium">Unit System</label>
                    <select
                      value={project.units}
                      onChange={(e) => updateProjectDetails({ units: e.target.value as any })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                    >
                      <option value="mm">Metric (Millimetres - mm)</option>
                      <option value="inches">Imperial (Inches - in)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 font-medium">Default Board Thickness</label>
                    <select
                      value={project.defaultBoardThickness}
                      onChange={(e) => updateProjectDetails({ defaultBoardThickness: Number(e.target.value) })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                    >
                      <option value={16}>16 mm</option>
                      <option value={18}>18 mm</option>
                      <option value={19}>19 mm (3/4")</option>
                      <option value={25}>25 mm (1")</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 font-medium">Default Back Thickness</label>
                    <select
                      value={project.defaultBackThickness}
                      onChange={(e) => updateProjectDetails({ defaultBackThickness: Number(e.target.value) })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                    >
                      <option value={3}>3 mm Hardboard</option>
                      <option value={6}>6 mm MDF</option>
                      <option value={16}>16 mm Solid Carcass</option>
                      <option value={18}>18 mm Solid Carcass</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  onClick={() => {
                    saveProject();
                    onClose();
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow transition"
                >
                  <Save className="w-4 h-4" />
                  Save Project Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'cabinets' && (
            <div className="flex flex-col gap-3">
              {project.cabinets.map((cab) => (
                <div
                  key={cab.id}
                  className={`p-3 rounded-xl border flex items-center justify-between transition ${
                    cab.id === activeCabinetId
                      ? 'bg-emerald-950/20 border-emerald-500/50'
                      : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800'
                  }`}
                >
                  <div
                    className="flex items-center gap-3 cursor-pointer flex-1"
                    onClick={() => {
                      setActiveCabinetId(cab.id);
                      onClose();
                    }}
                  >
                    <Box className="w-5 h-5 text-emerald-400" />
                    <div>
                      <div className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                        {cab.name}
                        {cab.id === activeCabinetId && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-mono text-slate-400 mt-0.5">
                        {cab.width}w × {cab.height}h × {cab.depth}d mm &bull; {cab.material} ({cab.boardThickness}mm)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setActiveCabinetId(cab.id);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700"
                    >
                      Open in CAD
                    </button>
                    {project.cabinets.length > 1 && (
                      <button
                        onClick={() => deleteCabinet(cab.id)}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-950/40 hover:text-red-300 transition"
                        title="Delete Cabinet"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'saved' && (
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-slate-400">
                  Projects stored in your local workshop database.
                </span>
                <button
                  onClick={() => {
                    createNewProject();
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition"
                >
                  <Plus className="w-4 h-4" />
                  New Blank Project
                </button>
              </div>

              {savedProjects.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No other saved projects found.
                </div>
              ) : (
                savedProjects.map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-xl border border-slate-800 bg-slate-800/40 hover:bg-slate-800 flex items-center justify-between transition"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                        {p.name}
                        {p.id === project.id && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        Client: {p.clientName} &bull; Room: {p.roomLocation} &bull; {p.cabinets.length} cabinets
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          loadProject(p.id);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition"
                      >
                        Load Project
                      </button>
                      {p.id !== project.id && (
                        <button
                          onClick={() => deleteProjectFromStorage(p.id)}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-950/40 hover:text-red-300 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
