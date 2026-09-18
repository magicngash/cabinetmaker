import { Cabinet, CostSettings, OptimizationSettings, Project } from '../types';

export const DEFAULT_OPTIMIZATION_SETTINGS: OptimizationSettings = {
  sheetWidth: 2440,
  sheetHeight: 1220,
  sawKerf: 3.2,
  edgeTrim: 10,
  allowRotation: true,
  respectGrain: true,
};

export const DEFAULT_COST_SETTINGS: CostSettings = {
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

/**
 * Requirement 22: Demonstration Cabinet
 * Width: 900mm, Height: 2100mm, Depth: 600mm, Board thickness: 18mm
 * 2 vertical sections, 2 doors, 3 drawers, 2 shelves
 */
export function createDefaultDemonstrationCabinet(): Cabinet {
  return {
    id: 'cab-demo-tall-01',
    name: 'Tall Storage Unit',
    width: 900,
    height: 2100,
    depth: 600,
    boardThickness: 18,
    backThickness: 6,
    backInset: 16,
    constructionType: 'frameless',
    material: 'White Melamine',
    backMaterial: 'White MDF (6mm)',
    edgeBandingThickness: 1,
    hasToeKick: true,
    toeKickHeight: 100,
    toeKickSetback: 50,

    // 1 Vertical Partition splitting into 2 vertical sections (equal 50% split)
    partitions: [
      {
        id: 'part-center-vert',
        type: 'vertical',
        positionType: 'equal',
        positionValue: 50,
        thickness: 18,
      },
    ],

    // Left section: 2 adjustable shelves + 1 full door (or single door)
    shelves: [
      {
        id: 'shelf-left-group',
        openingId: 'opening-root-L',
        shelfType: 'adjustable',
        count: 2,
        thickness: 18,
        setback: 12,
        edgeBanding: 'front',
      },
    ],

    // Right section: 3 drawers at bottom, and a horizontal divider with upper door
    drawers: [
      {
        id: 'drawer-stack-right',
        openingId: 'opening-root-R',
        count: 3,
        customHeights: [160, 240, 320],
        runnerType: 'undermount-soft-close',
        sideClearance: 21,
        runnerLength: 500,
        bottomThickness: 6,
        boxMaterial: 'Birch Plywood (16mm)',
        frontType: 'overlay',
        frontGap: 3,
        edgeBanding: 'all',
      },
    ],

    // Doors: 1 door covering left opening, 1 door covering upper right
    doors: [
      {
        id: 'door-left-full',
        openingId: 'opening-root-L',
        doorType: 'single-left',
        overlayType: 'full-overlay',
        doorGap: 2,
        centreGap: 3,
        overlayAmount: 15,
        material: 'White Melamine',
        edgeBanding: 'all',
        handleType: 'bar-pull',
      },
      {
        id: 'door-right-upper',
        openingId: 'opening-root-R',
        doorType: 'single-right',
        overlayType: 'full-overlay',
        doorGap: 2,
        centreGap: 3,
        overlayAmount: 15,
        material: 'White Melamine',
        edgeBanding: 'all',
        handleType: 'bar-pull',
      },
    ],
  };
}

/**
 * Standard Presets for user quick-start and testing
 */
export const CABINET_PRESETS: { name: string; description: string; create: () => Cabinet }[] = [
  {
    name: 'Tall Storage / Pantry (Demo)',
    description: '900 × 2100 × 600 mm, 2 vertical sections, 2 doors, 3 drawers, 2 shelves',
    create: createDefaultDemonstrationCabinet,
  },
  {
    name: 'Standard 1-Door Base Unit',
    description: '600 × 870 × 580 mm, single overlay door, 1 adjustable shelf',
    create: () => ({
      id: `cab-base-600-${Date.now()}`,
      name: 'Single Door Base',
      width: 600,
      height: 870,
      depth: 580,
      boardThickness: 18,
      backThickness: 6,
      backInset: 16,
      constructionType: 'frameless',
      material: 'White Melamine',
      backMaterial: 'White MDF (6mm)',
      edgeBandingThickness: 1,
      hasToeKick: true,
      toeKickHeight: 100,
      toeKickSetback: 50,
      partitions: [],
      shelves: [
        {
          id: `shelf-base-${Date.now()}`,
          openingId: 'opening-root',
          shelfType: 'adjustable',
          count: 1,
          thickness: 18,
          setback: 12,
          edgeBanding: 'front',
        },
      ],
      drawers: [],
      doors: [
        {
          id: `door-base-${Date.now()}`,
          openingId: 'opening-root',
          doorType: 'single-left',
          overlayType: 'full-overlay',
          doorGap: 2,
          centreGap: 3,
          overlayAmount: 15,
          material: 'White Melamine',
          edgeBanding: 'all',
          handleType: 'bar-pull',
        },
      ],
    }),
  },
  {
    name: 'Double-Door Base Unit',
    description: '900 × 870 × 580 mm, pair of doors with center gap, 1 shelf',
    create: () => ({
      id: `cab-base-900-${Date.now()}`,
      name: 'Double Door Base',
      width: 900,
      height: 870,
      depth: 580,
      boardThickness: 18,
      backThickness: 6,
      backInset: 16,
      constructionType: 'frameless',
      material: 'White Melamine',
      backMaterial: 'White MDF (6mm)',
      edgeBandingThickness: 1,
      hasToeKick: true,
      toeKickHeight: 100,
      toeKickSetback: 50,
      partitions: [],
      shelves: [
        {
          id: `shelf-dbl-${Date.now()}`,
          openingId: 'opening-root',
          shelfType: 'adjustable',
          count: 1,
          thickness: 18,
          setback: 12,
          edgeBanding: 'front',
        },
      ],
      drawers: [],
      doors: [
        {
          id: `door-dbl-${Date.now()}`,
          openingId: 'opening-root',
          doorType: 'double',
          overlayType: 'full-overlay',
          doorGap: 2,
          centreGap: 3,
          overlayAmount: 15,
          material: 'White Melamine',
          edgeBanding: 'all',
          handleType: 'bar-pull',
        },
      ],
    }),
  },
  {
    name: '3-Drawer Base Cabinet',
    description: '600 × 870 × 580 mm, 3 drawer stack (1 top utensil, 2 deep pan drawers)',
    create: () => ({
      id: `cab-drawer-600-${Date.now()}`,
      name: '3-Drawer Base',
      width: 600,
      height: 870,
      depth: 580,
      boardThickness: 18,
      backThickness: 6,
      backInset: 16,
      constructionType: 'frameless',
      material: 'White Melamine',
      backMaterial: 'White MDF (6mm)',
      edgeBandingThickness: 1,
      hasToeKick: true,
      toeKickHeight: 100,
      toeKickSetback: 50,
      partitions: [],
      shelves: [],
      drawers: [
        {
          id: `drawer-3stack-${Date.now()}`,
          openingId: 'opening-root',
          count: 3,
          customHeights: [150, 280, 280],
          runnerType: 'undermount-soft-close',
          sideClearance: 21,
          runnerLength: 500,
          bottomThickness: 6,
          boxMaterial: 'Birch Plywood (16mm)',
          frontType: 'overlay',
          frontGap: 3,
          edgeBanding: 'all',
        },
      ],
      doors: [],
    }),
  },
  {
    name: 'Upper Wall Cabinet',
    description: '800 × 720 × 320 mm, wall hung (no toe kick), 2 doors, 2 adjustable shelves',
    create: () => ({
      id: `cab-wall-800-${Date.now()}`,
      name: 'Upper Wall Cabinet',
      width: 800,
      height: 720,
      depth: 320,
      boardThickness: 18,
      backThickness: 6,
      backInset: 16,
      constructionType: 'frameless',
      material: 'White Melamine',
      backMaterial: 'White MDF (6mm)',
      edgeBandingThickness: 1,
      hasToeKick: false,
      toeKickHeight: 0,
      toeKickSetback: 0,
      partitions: [],
      shelves: [
        {
          id: `shelf-wall-${Date.now()}`,
          openingId: 'opening-root',
          shelfType: 'adjustable',
          count: 2,
          thickness: 18,
          setback: 10,
          edgeBanding: 'front',
        },
      ],
      drawers: [],
      doors: [
        {
          id: `door-wall-${Date.now()}`,
          openingId: 'opening-root',
          doorType: 'double',
          overlayType: 'full-overlay',
          doorGap: 2,
          centreGap: 3,
          overlayAmount: 15,
          material: 'White Melamine',
          edgeBanding: 'all',
          handleType: 'bar-pull',
        },
      ],
    }),
  },
  {
    name: 'Empty Carcass (Blank Slate)',
    description: '800 × 900 × 600 mm, clean empty carcass without any interior components',
    create: () => ({
      id: `cab-empty-${Date.now()}`,
      name: 'Empty Carcass',
      width: 800,
      height: 900,
      depth: 600,
      boardThickness: 18,
      backThickness: 6,
      backInset: 16,
      constructionType: 'frameless',
      material: 'White Melamine',
      backMaterial: 'White MDF (6mm)',
      edgeBandingThickness: 1,
      hasToeKick: true,
      toeKickHeight: 100,
      toeKickSetback: 50,
      partitions: [],
      shelves: [],
      drawers: [],
      doors: [],
    }),
  },
];

export function createInitialProject(): Project {
  return {
    id: 'proj-default-01',
    name: 'Oak & Melamine Workshop Project',
    customerName: 'Marcus Lindqvist Furniture Co.',
    description: 'Kitchen and tall pantry cabinetry with parametric cutting list and sheet layout.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    cabinets: [createDefaultDemonstrationCabinet()],
    costSettings: DEFAULT_COST_SETTINGS,
    optimizationSettings: DEFAULT_OPTIMIZATION_SETTINGS,
  };
}
