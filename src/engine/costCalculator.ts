import { Cabinet, CostSettings, CutPart, SheetResult } from '../types';
import { calculateEdgeBandingTotals } from './parametricEngine';
import { calculateProjectHardware } from './hardwareEngine';

export interface CostBreakdown {
  sheetCount: number;
  sheetMaterialCost: number;
  sheetCost: number;
  edgeBandingLinearMetres: number;
  edgeBandingLengthM: number;
  edgeBandingCost: number;
  hardwareCost: number;
  cuttingFee: number;
  laborHours: number;
  laborCost: number;
  totalManufacturingCost: number;
  subtotalDirectCost: number;
  profitAmount: number;
  markupAmount: number;
  taxAmount: number;
  sellingPrice: number;
  totalPrice: number;
  marginPercentage: number;
}

export function calculateProjectCosts(
  cabinets: Cabinet[],
  parts: CutPart[],
  sheets: SheetResult[],
  settings: CostSettings
): CostBreakdown {
  const safeSettings: CostSettings = settings || {
    sheetCost: 78.0,
    edgeBandingCostPerMetre: 1.15,
    cuttingCostPerSheet: 22.0,
    laborRatePerHour: 55.0,
    estimatedLaborHoursPerCabinet: 3.5,
    profitMarginPercentage: 35.0,
    hingeCostPerPiece: 4.8,
    runnerCostPerPair: 24.5,
    handleCostPerPiece: 6.5,
    screwDowelCostPerCabinet: 14.0,
  };
  const sheetPrice = safeSettings.sheetCost ?? 78.0;
  const edgePrice = safeSettings.edgeBandingCostPerMetre ?? 1.15;
  const cuttingPerSheet = safeSettings.cuttingCostPerSheet ?? 22.0;
  const hourlyRate = safeSettings.laborRatePerHour ?? (safeSettings as any).laborHourlyRate ?? 55.0;
  const hoursPerCab = safeSettings.estimatedLaborHoursPerCabinet ?? (safeSettings as any).laborHours ?? 3.5;
  const marginPct = safeSettings.profitMarginPercentage ?? (safeSettings as any).markupPercent ?? 35.0;
  const taxPct = (safeSettings as any).taxPercent ?? 10.0;

  const sheetCount = Math.max(1, (sheets || []).length);
  const sheetMaterialCost = Math.round(sheetCount * sheetPrice * 100) / 100;

  const edgeTotals = calculateEdgeBandingTotals(parts || []);
  const edgeBandingLinearMetres = edgeTotals?.totalLinearMetres ?? 0;
  const edgeBandingCost =
    Math.round(edgeBandingLinearMetres * edgePrice * 100) / 100;

  const hardware = calculateProjectHardware(cabinets || [], safeSettings);
  const hardwareCost =
    Math.round((hardware || []).reduce((sum, item) => sum + (item.totalCost ?? ((item.quantity || 0) * (item.unitCost || 0))), 0) * 100) / 100;

  const cuttingFee = Math.round(sheetCount * cuttingPerSheet * 100) / 100;

  const totalCabs = (cabinets || []).length || 1;
  const laborHours = Math.round(totalCabs * hoursPerCab * 10) / 10;
  const laborCost = Math.round(laborHours * hourlyRate * 100) / 100;

  const totalManufacturingCost =
    Math.round(
      (sheetMaterialCost +
        edgeBandingCost +
        hardwareCost +
        cuttingFee +
        laborCost) *
        100
    ) / 100;

  const margin = Math.min(90, Math.max(0, marginPct));
  const profitAmount =
    Math.round(((totalManufacturingCost * margin) / 100) * 100) / 100;
  const preTaxPrice = Math.round((totalManufacturingCost + profitAmount) * 100) / 100;
  const taxAmount = Math.round(((preTaxPrice * taxPct) / 100) * 100) / 100;
  const sellingPrice = Math.round((preTaxPrice + taxAmount) * 100) / 100;

  return {
    sheetCount,
    sheetMaterialCost,
    sheetCost: sheetMaterialCost,
    edgeBandingLinearMetres,
    edgeBandingLengthM: edgeBandingLinearMetres,
    edgeBandingCost,
    hardwareCost,
    cuttingFee,
    laborHours,
    laborCost,
    totalManufacturingCost,
    subtotalDirectCost: totalManufacturingCost,
    profitAmount,
    markupAmount: profitAmount,
    taxAmount,
    sellingPrice,
    totalPrice: sellingPrice,
    marginPercentage: margin,
  };
}
