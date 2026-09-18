import React from 'react';
import { useProject } from '../context/ProjectContext';
import { triggerPrint } from '../engine/exportUtils';
import {
  DollarSign,
  Calculator,
  Printer,
  FileSpreadsheet,
  Layers,
  Wrench,
  Percent,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export const CostCalculatorView: React.FC = () => {
  const {
    project,
    costBreakdown,
    updateCostSettings,
    projectHardwareBOM,
    sheetOptimizationResults,
  } = useProject();

  const settings = project?.costSettings || ({} as any);
  const currency = (settings as any)?.currency || '$';
  const totalSheetsNeeded = (sheetOptimizationResults || []).length;
  const hardwareList = projectHardwareBOM || [];

  const laborRate = settings.laborRatePerHour ?? (settings as any)?.laborHourlyRate ?? 55;
  const laborHours = settings.estimatedLaborHoursPerCabinet ?? (settings as any)?.laborHours ?? 3.5;
  const markupPct = settings.profitMarginPercentage ?? (settings as any)?.markupPercent ?? 35;
  const taxPct = (settings as any)?.taxPercent ?? 10;

  return (
    <div className="w-full h-full bg-slate-950 text-slate-100 flex flex-col overflow-hidden p-6 gap-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            Cost Estimator & Commercial Quotation
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Automated workshop material bills, hardware takeoff, assembly labor, and profit margins.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={triggerPrint}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium shadow transition"
          >
            <Printer className="w-4 h-4" />
            Print Formal Quotation
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto">
        {/* Left 2 Cols: Rate Settings & Detailed Hardware BOM */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Workshop Unit Rates Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Calculator className="w-4 h-4 text-sky-400" />
              Workshop Unit Pricing & Labor Parameters
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <label htmlFor="sheet-cost-input" className="text-slate-400 block mb-1">
                  Sheet Cost ({currency})
                </label>
                <div className="relative">
                  <input
                    id="sheet-cost-input"
                    type="number"
                    step="5"
                    min="10"
                    value={settings.sheetCost ?? 78}
                    onChange={(e) =>
                      updateCostSettings({ sheetCost: Number(e.target.value) })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 font-mono text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="edge-cost-input" className="text-slate-400 block mb-1">
                  Edge Banding ({currency}/m)
                </label>
                <input
                  id="edge-cost-input"
                  type="number"
                  step="0.1"
                  min="0"
                  value={settings.edgeBandingCostPerMetre ?? 1.15}
                  onChange={(e) =>
                    updateCostSettings({
                      edgeBandingCostPerMetre: Number(e.target.value),
                    })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 font-mono text-slate-100"
                />
              </div>

              <div>
                <label htmlFor="labor-rate-input" className="text-slate-400 block mb-1">
                  Labor Rate ({currency}/hr)
                </label>
                <input
                  id="labor-rate-input"
                  type="number"
                  step="5"
                  min="15"
                  value={laborRate}
                  onChange={(e) =>
                    updateCostSettings({
                      laborRatePerHour: Number(e.target.value),
                      ...({ laborHourlyRate: Number(e.target.value) } as any),
                    })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 font-mono text-slate-100"
                />
              </div>

              <div>
                <label htmlFor="labor-hours-input" className="text-slate-400 block mb-1">
                  Estimated Labor (Hours/Cab)
                </label>
                <input
                  id="labor-hours-input"
                  type="number"
                  step="0.5"
                  min="0"
                  value={laborHours}
                  onChange={(e) =>
                    updateCostSettings({
                      estimatedLaborHoursPerCabinet: Number(e.target.value),
                      ...({ laborHours: Number(e.target.value) } as any),
                    })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 font-mono text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-3 border-t border-slate-800">
              <div>
                <label htmlFor="markup-percent-input" className="text-slate-400 block mb-1">
                  Margin / Markup (%)
                </label>
                <input
                  id="markup-percent-input"
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  value={markupPct}
                  onChange={(e) =>
                    updateCostSettings({
                      profitMarginPercentage: Number(e.target.value),
                      ...({ markupPercent: Number(e.target.value) } as any),
                    })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 font-mono text-emerald-400 font-bold"
                />
              </div>

              <div>
                <label htmlFor="tax-percent-input" className="text-slate-400 block mb-1">
                  Sales Tax / VAT (%)
                </label>
                <input
                  id="tax-percent-input"
                  type="number"
                  step="0.5"
                  min="0"
                  max="40"
                  value={taxPct}
                  onChange={(e) =>
                    updateCostSettings({
                      ...({ taxPercent: Number(e.target.value) } as any),
                    })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 font-mono text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* Hardware BOM Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-400" />
              Automated Hardware Bill of Materials (BOM)
            </span>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="text-slate-400 border-b border-slate-800 font-medium">
                  <tr>
                    <th className="py-2.5 px-3">Item Specification</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-center">Required Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Cost</th>
                    <th className="py-2.5 px-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-slate-200">
                  {hardwareList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-500 font-sans">
                        No hardware required for current configuration.
                      </td>
                    </tr>
                  ) : (
                    hardwareList.map((item) => {
                      const unitVal = Number(item.unitCost ?? (item as any).unitPrice ?? 0);
                      const totalVal = Number(item.totalCost ?? ((item.quantity || 0) * unitVal));
                      return (
                        <tr key={item.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-2.5 px-3 font-sans font-medium text-slate-100">
                            {item.name}
                          </td>
                          <td className="py-2.5 px-3 text-slate-400 font-sans uppercase text-[10px]">
                            {item.category}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-slate-100">
                            {item.quantity} {item.unit}
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-400">
                            {currency}{unitVal.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-100">
                            {currency}{totalVal.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Grand Commercial Summary Quote Card */}
        <div className="flex flex-col gap-4">
          <div className="bg-gradient-to-b from-slate-900 to-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Cost Breakdown
              </span>
              <span className="text-xs font-mono text-slate-400">
                {project?.name || 'Project'}
              </span>
            </div>

            <div className="flex flex-col gap-2.5 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span>Panel Board Material ({costBreakdown?.sheetCount ?? totalSheetsNeeded} sheets):</span>
                <span className="font-mono text-slate-100 font-semibold">
                  {currency}{Number(costBreakdown?.sheetCost ?? costBreakdown?.sheetMaterialCost ?? 0).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span>Edge Banding ({Number(costBreakdown?.edgeBandingLengthM ?? costBreakdown?.edgeBandingLinearMetres ?? 0).toFixed(1)} m):</span>
                <span className="font-mono text-slate-100 font-semibold">
                  {currency}{Number(costBreakdown?.edgeBandingCost ?? 0).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span>Hardware Components:</span>
                <span className="font-mono text-slate-100 font-semibold">
                  {currency}{Number(costBreakdown?.hardwareCost ?? 0).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span>Workshop Labor ({Number(costBreakdown?.laborHours ?? 0).toFixed(1)} hrs):</span>
                <span className="font-mono text-slate-100 font-semibold">
                  {currency}{Number(costBreakdown?.laborCost ?? 0).toFixed(2)}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between items-center font-bold text-slate-200">
                <span>Direct Production Cost:</span>
                <span className="font-mono">
                  {currency}{Number(costBreakdown?.subtotalDirectCost ?? costBreakdown?.totalManufacturingCost ?? 0).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center text-emerald-400 font-medium">
                <span>Workshop Markup ({markupPct}%):</span>
                <span className="font-mono">
                  +{currency}{Number(costBreakdown?.markupAmount ?? costBreakdown?.profitAmount ?? 0).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-400">
                <span>Tax / VAT ({taxPct}%):</span>
                <span className="font-mono">
                  +{currency}{Number(costBreakdown?.taxAmount ?? 0).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Total Highlight */}
            <div className="bg-slate-800/90 rounded-xl p-4 border border-slate-700 flex flex-col gap-1 mt-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Total Quotation Price
              </span>
              <div className="text-3xl font-mono font-extrabold text-emerald-400">
                {currency}{Number(costBreakdown?.totalPrice ?? costBreakdown?.sellingPrice ?? 0).toFixed(2)}
              </div>
              <span className="text-[10px] text-slate-400 mt-1">
                Includes all materials, machining, assembly, and sales tax.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
