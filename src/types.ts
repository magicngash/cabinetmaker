export type ConstructionType = 'frameless' | 'face-frame';

export type MaterialType =
  | 'MDF'
  | 'White Melamine'
  | 'Birch Plywood'
  | 'Oak Veneer'
  | 'Chipboard'
  | 'Custom';

export type EdgeType = 'none' | 'front' | 'back' | 'left' | 'right' | 'front-left' | 'front-right' | 'all';

export type PartitionType = 'vertical' | 'horizontal';

export type PositionType = 'from-left' | 'from-right' | 'from-top' | 'from-bottom' | 'percentage' | 'equal';

export type DoorType = 'single-left' | 'single-right' | 'double';
export type DoorOverlay = 'full-overlay' | 'half-overlay' | 'inset';

export type DrawerRunnerType = 'side-mount-ball-bearing' | 'undermount-soft-close' | 'roller';
export type DrawerFrontType = 'overlay' | 'inset';

export type ShelfType = 'adjustable' | 'fixed';

export interface Partition {
  id: string;
  type: PartitionType;
  parentId?: string; // opening/zone ID that this partition subdivides (or undefined if root carcass)
  positionType: PositionType;
  positionValue: number; // mm from edge, or percentage (e.g. 50)
  thickness: number; // mm, default cabinet boardThickness
}

export interface ShelfGroup {
  id: string;
  openingId: string;
  shelfType: ShelfType;
  count: number;
  customPositions?: number[]; // positions in mm from bottom of opening
  thickness: number;
  setback: number; // mm from front edge (typically 10-15mm for adjustable)
  material?: string;
  edgeBanding?: EdgeType;
}

export interface DrawerStack {
  id: string;
  openingId: string;
  count: number;
  customHeights?: number[]; // custom drawer front heights in mm
  runnerType: DrawerRunnerType;
  sideClearance: number; // total side clearance, e.g. 25.4 mm (12.7mm per side)
  runnerLength: number; // mm (e.g. 500)
  bottomThickness: number; // mm (e.g. 6 or 16)
  boxMaterial: string;
  frontType: DrawerFrontType;
  frontGap: number; // mm (e.g. 3mm between drawers and edges)
  edgeBanding?: EdgeType;
}

export interface DoorConfig {
  id: string;
  openingId: string;
  doorType: DoorType;
  overlayType: DoorOverlay;
  doorGap: number; // side/top/bottom perimeter gap in mm (e.g. 2 or 3)
  centreGap: number; // gap between double doors in mm (e.g. 3)
  overlayAmount: number; // mm overlay onto carcass (e.g. 15mm for 18mm carcass)
  material: string;
  edgeBanding: EdgeType;
  handleType?: 'bar-pull' | 'knob' | 'edge-pull' | 'tip-on';
}

export interface CabinetOpening {
  id: string;
  x: number; // mm from internal carcass left
  y: number; // mm from internal carcass bottom
  width: number; // mm
  height: number; // mm
  depth: number; // mm
  partitionId?: string; // parent partition that created this opening
}

export interface Cabinet {
  id: string;
  name: string;
  width: number; // mm overall
  height: number; // mm overall
  depth: number; // mm overall
  boardThickness: number; // mm (e.g. 18, 16, 25)
  backThickness: number; // mm (e.g. 6, 3, 16, 18)
  backInset: number; // mm rebate or groove distance from back edge (e.g. 16mm or 0)
  constructionType: ConstructionType;
  faceFrameWidth?: number; // mm (if face-frame)
  material: string;
  backMaterial: string;
  edgeBandingThickness: number; // mm (e.g. 1mm or 0.5mm)
  hasToeKick: boolean;
  toeKickHeight: number; // mm (e.g. 100mm)
  toeKickSetback: number; // mm (e.g. 50mm)
  
  // Internal & Front layout objects
  partitions: Partition[];
  shelves: ShelfGroup[];
  drawers: DrawerStack[];
  doors: DoorConfig[];
}

export interface CutPart {
  id: string;
  cabinetId: string;
  cabinetName: string;
  name: string;
  length: number; // mm (along grain)
  width: number; // mm (across grain)
  thickness: number; // mm
  quantity: number;
  material: string;
  edgeBanding: {
    top: boolean;
    bottom: boolean;
    left: boolean;
    right: boolean;
    type: EdgeType;
  };
  grainDirection: 'length' | 'width' | 'none';
  notes?: string;
  isOverridden?: boolean;
}

export interface PlacedPart {
  partId: string;
  partName: string;
  cabinetName: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotated: boolean;
  material: string;
}

export interface SheetResult {
  sheetIndex: number;
  sheetWidth: number;
  sheetHeight: number;
  material: string;
  placedParts: PlacedPart[];
  usedArea: number; // mm²
  totalArea: number; // mm²
  wastePercentage: number;
}

export interface OptimizationSettings {
  sheetWidth: number; // mm (default 2440)
  sheetHeight: number; // mm (default 1220)
  sawKerf: number; // mm (default 3.2)
  edgeTrim: number; // mm (default 10)
  allowRotation: boolean;
  respectGrain: boolean;
}

export interface CostSettings {
  sheetCost: number; // price per sheet (e.g. 85.00)
  edgeBandingCostPerMetre: number; // price per linear metre (e.g. 1.20)
  cuttingCostPerSheet: number; // price per sheet cut (e.g. 25.00)
  laborRatePerHour: number; // hourly rate (e.g. 55.00)
  estimatedLaborHoursPerCabinet: number; // hours (e.g. 3.5)
  profitMarginPercentage: number; // e.g. 35%
  hingeCostPerPiece: number; // e.g. 4.50
  runnerCostPerPair: number; // e.g. 22.00
  handleCostPerPiece: number; // e.g. 6.00
  screwDowelCostPerCabinet: number; // e.g. 15.00
}

export interface HardwareItem {
  id: string;
  name: string;
  category: 'Hinges' | 'Runners' | 'Handles' | 'Fasteners' | 'Supports' | 'Other';
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  notes?: string;
}

export interface Project {
  id: string;
  name: string;
  customerName: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  cabinets: Cabinet[];
  costSettings: CostSettings;
  optimizationSettings: OptimizationSettings;
}

export interface ValidationIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  cabinetId: string;
  elementId?: string;
}

export type ActiveView = 'front' | 'inside' | 'side' | 'top' | '3d' | 'cutting-list' | 'sheet-opt' | 'costing' | 'hardware';
