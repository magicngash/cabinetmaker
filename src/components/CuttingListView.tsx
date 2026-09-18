import React, { useState, useMemo } from 'react';
import { useProject } from '../context/ProjectContext';
import { CutPart, EdgeType } from '../types';
import { exportCuttingListToCSV, triggerPrint } from '../engine/exportUtils';
import { calculateEdgeBandingTotals } from '../engine/parametricEngine';
import {
  Download,
  Printer,
  Search,
  ArrowUpDown,
  Layers,
  Filter,
  CheckCircle2,
  Edit3,
} from 'lucide-react';

export const CuttingListView: React.FC = () => {
  const {
    project,
    activeCabinet,
    activeCabinetCutList,
    projectCombinedCutList,
  } = useProject();

  const [scope, setScope] = useState<'cabinet' | 'project'>('cabinet');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof CutPart>('length');
  const [sortAsc, setSortAsc] = useState(false);

  // Editable overrides state
  const [overrides, setOverrides] = useState<Record<string, Partial<CutPart>>>({});

  const rawParts = scope === 'cabinet' ? activeCabinetCutList : projectCombinedCutList;

  // Apply overrides
  const partsWithOverrides = useMemo(() => {
    return rawParts.map((p) => {
      const o = overrides[p.id];
      return o ? { ...p, ...o, isOverridden: true } : p;
    });
  }, [rawParts, overrides]);

  // Filter and sort
  const filteredParts = useMemo(() => {
    return partsWithOverrides
      .filter((p) => {
        const query = searchTerm.toLowerCase();
        return (
          p.name.toLowerCase().includes(query) ||
          p.material.toLowerCase().includes(query) ||
          p.cabinetName.toLowerCase().includes(query) ||
          (p.notes || '').toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortAsc ? valA - valB : valB - valA;
        }
        return sortAsc
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
  }, [partsWithOverrides, searchTerm, sortField, sortAsc]);

  // Edge Banding Summary
  const edgeSummary = useMemo(() => {
    return calculateEdgeBandingTotals(filteredParts);
  }, [filteredParts]);

  const handleSort = (field: keyof CutPart) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const handleOverride = (id: string, updates: Partial<CutPart>) => {
    setOverrides((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...updates },
    }));
  };

  const totalPartsCount = filteredParts.reduce((acc, p) => acc + p.quantity, 0);

  return (
    <div className="w-full h-full bg-slate-950 text-slate-100 flex flex-col overflow-hidden p-6 gap-5">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-emerald-400" />
            Cutting List & Panel Schedules
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Parametric panel dimensions, edge-banding allocation, and CNC cutting schedules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Scope Toggle: Cabinet vs Project */}
          <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-lg p-1 text-xs">
            <button
              id="scope-cabinet-btn"
              onClick={() => setScope('cabinet')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                scope === 'cabinet'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {activeCabinet.name} (Active)
            </button>
            <button
              id="scope-project-btn"
              onClick={() => setScope('project')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                scope === 'project'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Combined Project ({project.cabinets.length} Cabs)
            </button>
          </div>

          <button
            id="btn-export-csv"
            onClick={() => exportCuttingListToCSV(filteredParts, project.name)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            Export CSV
          </button>

          <button
            id="btn-print-cutlist"
            onClick={triggerPrint}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium shadow transition"
          >
            <Printer className="w-4 h-4" />
            Print / PDF
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3.5 flex flex-col">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Total Unique Parts
          </span>
          <span className="text-xl font-mono font-bold text-white mt-1">
            {filteredParts.length} lines
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3.5 flex flex-col">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Total Panels to Cut
          </span>
          <span className="text-xl font-mono font-bold text-emerald-400 mt-1">
            {totalPartsCount} pcs
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3.5 flex flex-col">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Total Edge Banding
          </span>
          <span className="text-xl font-mono font-bold text-purple-400 mt-1">
            {edgeSummary.totalLinearMetres} m
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3.5 flex flex-col">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Active Material
          </span>
          <span className="text-sm font-medium text-slate-200 mt-1 truncate">
            {activeCabinet.material} ({activeCabinet.boardThickness}mm)
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            id="cutlist-search-input"
            type="text"
            placeholder="Search part, material, note..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Showing {filteredParts.length} items &bull; Click column header to sort
        </div>
      </div>

      {/* Cutting List Data Table */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-800/80 text-slate-300 font-medium sticky top-0 z-10 border-b border-slate-700">
              <tr>
                <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1.5">
                    Part Name
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort('cabinetName')}>
                  <div className="flex items-center gap-1.5">
                    Cabinet
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right cursor-pointer" onClick={() => handleSort('length')}>
                  <div className="flex items-center justify-end gap-1.5">
                    Length (mm)
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right cursor-pointer" onClick={() => handleSort('width')}>
                  <div className="flex items-center justify-end gap-1.5">
                    Width (mm)
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center cursor-pointer" onClick={() => handleSort('thickness')}>
                  <div className="flex items-center justify-center gap-1.5">
                    Thick
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center cursor-pointer" onClick={() => handleSort('quantity')}>
                  <div className="flex items-center justify-center gap-1.5">
                    Qty
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort('material')}>
                  <div className="flex items-center gap-1.5">
                    Material
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Edge Banding</th>
                <th className="py-3 px-4">Notes & Joinery</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-200">
              {filteredParts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 font-sans">
                    No parts match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredParts.map((part) => (
                  <tr
                    key={part.id}
                    className={`hover:bg-slate-800/40 transition group ${
                      part.isOverridden ? 'bg-amber-950/20' : ''
                    }`}
                  >
                    <td className="py-2.5 px-4 font-sans font-medium text-slate-100">
                      {part.name}
                    </td>
                    <td className="py-2.5 px-4 text-slate-400 font-sans text-[11px] truncate max-w-[140px]">
                      {part.cabinetName}
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold text-emerald-400">
                      <input
                        type="number"
                        value={part.length}
                        onChange={(e) => handleOverride(part.id, { length: Number(e.target.value) })}
                        className="w-20 bg-transparent text-right font-mono focus:bg-slate-800 focus:outline-none rounded px-1"
                      />
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold text-emerald-400">
                      <input
                        type="number"
                        value={part.width}
                        onChange={(e) => handleOverride(part.id, { width: Number(e.target.value) })}
                        className="w-20 bg-transparent text-right font-mono focus:bg-slate-800 focus:outline-none rounded px-1"
                      />
                    </td>
                    <td className="py-2.5 px-4 text-center text-slate-400">
                      {part.thickness}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 font-bold text-white text-xs border border-slate-700">
                        {part.quantity}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-sans text-slate-300 text-[11px]">
                      {part.material}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <select
                        value={part.edgeBanding.type}
                        onChange={(e) => {
                          const type = e.target.value as EdgeType;
                          const hasAll = type === 'all';
                          const hasFront = type === 'front' || type === 'front-left' || type === 'front-right' || hasAll;
                          handleOverride(part.id, {
                            edgeBanding: {
                              type,
                              left: hasFront || type === 'left',
                              right: hasAll || type === 'right',
                              top: hasAll || type === 'front-left',
                              bottom: hasAll || type === 'front-right',
                            },
                          });
                        }}
                        className="bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-[11px] text-purple-300 focus:outline-none font-sans"
                      >
                        <option value="none">None</option>
                        <option value="front">Front Only</option>
                        <option value="back">Back Only</option>
                        <option value="left">Left Only</option>
                        <option value="right">Right Only</option>
                        <option value="front-left">Front + Left</option>
                        <option value="front-right">Front + Right</option>
                        <option value="all">All 4 Edges</option>
                      </select>
                    </td>
                    <td className="py-2.5 px-4 font-sans text-slate-400 text-[11px] truncate max-w-xs">
                      {part.notes || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
