import { Cabinet, CutPart, OptimizationSettings, ValidationIssue } from '../types';
import { calculateCabinetOpenings, getOpening } from './parametricEngine';

export function validateCabinet(
  cabinet: Cabinet,
  parts: CutPart[],
  optSettings: OptimizationSettings
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const T = cabinet.boardThickness;
  const toeKickH = cabinet.hasToeKick ? cabinet.toeKickHeight : 0;
  const internalH = cabinet.height - toeKickH - 2 * T;
  const internalW = cabinet.width - 2 * T;
  const internalD = cabinet.depth - cabinet.backThickness - (cabinet.backInset || 0);

  // 1. Check basic cabinet dimensions
  if (cabinet.width <= 100) {
    issues.push({
      id: 'err-w-min',
      type: 'error',
      message: `Cabinet width (${cabinet.width} mm) is too narrow for standard construction (minimum 150 mm).`,
      cabinetId: cabinet.id,
    });
  }
  if (cabinet.height <= 150) {
    issues.push({
      id: 'err-h-min',
      type: 'error',
      message: `Cabinet height (${cabinet.height} mm) is too small (minimum 200 mm).`,
      cabinetId: cabinet.id,
    });
  }
  if (cabinet.depth <= 100) {
    issues.push({
      id: 'err-d-min',
      type: 'error',
      message: `Cabinet depth (${cabinet.depth} mm) is too shallow for standard carcass panels.`,
      cabinetId: cabinet.id,
    });
  }
  if (internalW <= 0 || internalH <= 0 || internalD <= 0) {
    issues.push({
      id: 'err-internal-neg',
      type: 'error',
      message: `Board thickness (${T} mm) leaves no internal carcass space.`,
      cabinetId: cabinet.id,
    });
  }

  const openings = calculateCabinetOpenings(cabinet);

  // 2. Check Partitions
  for (const partition of cabinet.partitions) {
    if (partition.type === 'vertical') {
      if (partition.positionType === 'from-left' && partition.positionValue >= internalW - 10) {
        issues.push({
          id: `warn-part-vl-${partition.id}`,
          type: 'warning',
          message: `Vertical partition position (${partition.positionValue} mm) exceeds available carcass width (${internalW} mm).`,
          cabinetId: cabinet.id,
          elementId: partition.id,
        });
      }
      if (partition.positionType === 'from-right' && partition.positionValue >= internalW - 10) {
        issues.push({
          id: `warn-part-vr-${partition.id}`,
          type: 'warning',
          message: `Vertical partition position from right (${partition.positionValue} mm) exceeds available width.`,
          cabinetId: cabinet.id,
          elementId: partition.id,
        });
      }
    } else {
      if (partition.positionType === 'from-bottom' && partition.positionValue >= internalH - 10) {
        issues.push({
          id: `warn-part-hb-${partition.id}`,
          type: 'warning',
          message: `Horizontal partition position (${partition.positionValue} mm) exceeds available carcass height (${internalH} mm).`,
          cabinetId: cabinet.id,
          elementId: partition.id,
        });
      }
    }
  }

  // 3. Check Drawers
  for (const drawer of cabinet.drawers) {
    const opening = getOpening(openings, drawer.openingId);
    if (!opening) continue;

    if (drawer.count <= 0) {
      issues.push({
        id: `err-dr-count-${drawer.id}`,
        type: 'error',
        message: 'Drawer stack must have at least 1 drawer.',
        cabinetId: cabinet.id,
        elementId: drawer.id,
      });
    }

    // Runner length vs opening depth
    const runnerL = drawer.runnerLength || 500;
    if (runnerL > opening.depth - 5) {
      issues.push({
        id: `warn-dr-depth-${drawer.id}`,
        type: 'warning',
        message: `Drawer runner length (${runnerL} mm) exceeds internal cabinet depth (${opening.depth} mm) by ${Math.round(runnerL - opening.depth + 5)} mm.`,
        cabinetId: cabinet.id,
        elementId: drawer.id,
      });
    }

    // Vertical space check for custom heights
    if (drawer.customHeights && drawer.customHeights.length > 0) {
      const sumFronts = drawer.customHeights.reduce((a, b) => a + b, 0);
      const gapSum = (drawer.count - 1) * (drawer.frontGap || 3);
      const totalRequested = sumFronts + gapSum;
      if (totalRequested > opening.height + 5) {
        issues.push({
          id: `warn-dr-height-sum-${drawer.id}`,
          type: 'warning',
          message: `Drawer fronts total (${totalRequested} mm) exceeds opening height (${Math.round(opening.height)} mm) by ${Math.round(totalRequested - opening.height)} mm.`,
          cabinetId: cabinet.id,
          elementId: drawer.id,
        });
      }
    }

    // Side clearance check
    if (drawer.sideClearance < 20) {
      issues.push({
        id: `info-dr-clearance-${drawer.id}`,
        type: 'info',
        message: `Drawer side clearance (${drawer.sideClearance} mm) is tighter than standard 25.4 mm (12.7mm per side).`,
        cabinetId: cabinet.id,
        elementId: drawer.id,
      });
    }
  }

  // 4. Check Doors
  for (const door of cabinet.doors) {
    const opening = getOpening(openings, door.openingId);
    if (!opening) continue;

    if (opening.width < 120) {
      issues.push({
        id: `warn-door-w-${door.id}`,
        type: 'warning',
        message: `Opening width (${Math.round(opening.width)} mm) is too narrow for standard cabinet door hinges.`,
        cabinetId: cabinet.id,
        elementId: door.id,
      });
    }
    if (opening.height < 150) {
      issues.push({
        id: `warn-door-h-${door.id}`,
        type: 'warning',
        message: `Opening height (${Math.round(opening.height)} mm) is too short for a standard cabinet door.`,
        cabinetId: cabinet.id,
        elementId: door.id,
      });
    }
  }

  // 5. Check Shelves
  for (const shelf of cabinet.shelves) {
    const opening = getOpening(openings, shelf.openingId);
    if (!opening) continue;

    if (shelf.count > 10) {
      issues.push({
        id: `warn-shelf-count-${shelf.id}`,
        type: 'warning',
        message: `Shelf count (${shelf.count}) in opening (${Math.round(opening.height)} mm height) will leave very small gaps between shelves.`,
        cabinetId: cabinet.id,
        elementId: shelf.id,
      });
    }

    // Shelf span deflection check (long shelf warning if > 900mm wide without support)
    if (opening.width > 950) {
      issues.push({
        id: `info-shelf-span-${shelf.id}`,
        type: 'info',
        message: `Shelf span (${Math.round(opening.width)} mm) exceeds 900 mm. Consider an 18mm+ thickness or a center vertical divider to prevent shelf sagging under heavy load.`,
        cabinetId: cabinet.id,
        elementId: shelf.id,
      });
    }
  }

  // 6. Check Parts vs Sheet Dimensions
  const maxSheetDim = Math.max(optSettings.sheetWidth, optSettings.sheetHeight) - optSettings.edgeTrim * 2;
  for (const part of parts) {
    if (part.length > maxSheetDim) {
      issues.push({
        id: `err-part-sheet-${part.id}`,
        type: 'error',
        message: `Part "${part.name}" length (${Math.round(part.length)} mm) exceeds raw sheet size (${optSettings.sheetWidth}×${optSettings.sheetHeight} mm).`,
        cabinetId: cabinet.id,
      });
    }
  }

  return issues;
}
