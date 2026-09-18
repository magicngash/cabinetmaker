import {
  Cabinet,
  CabinetOpening,
  CutPart,
  DoorConfig,
  DrawerStack,
  EdgeType,
  Partition,
  ShelfGroup,
} from '../types';

/**
 * Calculates the internal carcass openings recursively or iteratively
 * based on cabinet partitions.
 */
export function calculateCabinetOpenings(cabinet: Cabinet): CabinetOpening[] {
  const T = cabinet.boardThickness;
  const BT = cabinet.backThickness;
  const backInset = cabinet.backInset || 0;

  // Carcass internal space
  const internalWidth = Math.max(10, cabinet.width - 2 * T);
  const toeKickH = cabinet.hasToeKick ? cabinet.toeKickHeight : 0;
  const internalHeight = Math.max(10, cabinet.height - toeKickH - 2 * T);
  const internalDepth = Math.max(10, cabinet.depth - BT - backInset);

  // Root opening covering entire interior
  let openings: CabinetOpening[] = [
    {
      id: 'opening-root',
      x: 0,
      y: 0,
      width: internalWidth,
      height: internalHeight,
      depth: internalDepth,
    },
  ];

  // Process vertical partitions first, then horizontal partitions (or by parentId)
  // To handle flexible layouts, partitions can split either root or a specific opening
  const partitions = [...cabinet.partitions];

  for (const partition of partitions) {
    // Find the target opening to split
    let targetIndex = -1;
    if (partition.parentId) {
      targetIndex = openings.findIndex((o) => o.id === partition.parentId);
    }
    // If not specified or not found, pick the largest opening or first opening that encompasses the partition position
    if (targetIndex === -1) {
      targetIndex = 0;
    }

    const target = openings[targetIndex];
    if (!target) continue;

    const pT = partition.thickness || T;

    if (partition.type === 'vertical') {
      let splitX = 0;
      switch (partition.positionType) {
        case 'from-left':
          splitX = Math.min(Math.max(10, partition.positionValue), target.width - pT - 10);
          break;
        case 'from-right':
          splitX = Math.max(10, target.width - partition.positionValue - pT);
          break;
        case 'percentage':
          splitX = Math.round((target.width - pT) * (Math.min(95, Math.max(5, partition.positionValue)) / 100));
          break;
        case 'equal':
        default:
          splitX = Math.round((target.width - pT) / 2);
          break;
      }

      const leftWidth = splitX;
      const rightWidth = Math.max(10, target.width - splitX - pT);

      const leftOpening: CabinetOpening = {
        id: `${target.id}-L`,
        x: target.x,
        y: target.y,
        width: leftWidth,
        height: target.height,
        depth: target.depth,
        partitionId: partition.id,
      };

      const rightOpening: CabinetOpening = {
        id: `${target.id}-R`,
        x: target.x + splitX + pT,
        y: target.y,
        width: rightWidth,
        height: target.height,
        depth: target.depth,
        partitionId: partition.id,
      };

      // Replace target opening with the two new openings
      openings.splice(targetIndex, 1, leftOpening, rightOpening);
    } else {
      // Horizontal partition
      let splitY = 0;
      switch (partition.positionType) {
        case 'from-bottom':
          splitY = Math.min(Math.max(10, partition.positionValue), target.height - pT - 10);
          break;
        case 'from-top':
          splitY = Math.max(10, target.height - partition.positionValue - pT);
          break;
        case 'percentage':
          splitY = Math.round((target.height - pT) * (Math.min(95, Math.max(5, partition.positionValue)) / 100));
          break;
        case 'equal':
        default:
          splitY = Math.round((target.height - pT) / 2);
          break;
      }

      const bottomHeight = splitY;
      const topHeight = Math.max(10, target.height - splitY - pT);

      const bottomOpening: CabinetOpening = {
        id: `${target.id}-B`,
        x: target.x,
        y: target.y,
        width: target.width,
        height: bottomHeight,
        depth: target.depth,
        partitionId: partition.id,
      };

      const topOpening: CabinetOpening = {
        id: `${target.id}-T`,
        x: target.x,
        y: target.y + splitY + pT,
        width: target.width,
        height: topHeight,
        depth: target.depth,
        partitionId: partition.id,
      };

      openings.splice(targetIndex, 1, bottomOpening, topOpening);
    }
  }

  return openings;
}

/**
 * Finds the opening corresponding to an ID, falling back to the first available opening.
 */
export function getOpening(openings: CabinetOpening[], openingId?: string): CabinetOpening {
  if (!openings || openings.length === 0) {
    return { id: 'fallback', x: 0, y: 0, width: 864, height: 2064, depth: 560 };
  }
  const match = openings.find((o) => o.id === openingId);
  return match || openings[0];
}

/**
 * Generates the full, parametric Cutting List (CutPart[]) for a given cabinet.
 */
export function generateCabinetCutList(cabinet: Cabinet): CutPart[] {
  const parts: CutPart[] = [];
  const T = cabinet.boardThickness;
  const BT = cabinet.backThickness;
  const mat = cabinet.material;
  const backMat = cabinet.backMaterial || 'White MDF (3mm/6mm)';
  const toeKickH = cabinet.hasToeKick ? cabinet.toeKickHeight : 0;
  const carcassH = cabinet.height - toeKickH;
  const carcassInternalW = Math.max(10, cabinet.width - 2 * T);
  const carcassInternalH = Math.max(10, carcassH - 2 * T);
  const carcassInternalD = Math.max(10, cabinet.depth - BT - (cabinet.backInset || 0));

  const openings = calculateCabinetOpenings(cabinet);

  // 1. CARCASS PANELS
  // Left Gable (Side)
  parts.push({
    id: `${cabinet.id}-left-side`,
    cabinetId: cabinet.id,
    cabinetName: cabinet.name,
    name: 'Left Side (Gable)',
    length: carcassH,
    width: cabinet.depth,
    thickness: T,
    quantity: 1,
    material: mat,
    edgeBanding: {
      top: false,
      bottom: false,
      left: true, // front edge
      right: false,
      type: 'front',
    },
    grainDirection: 'length',
    notes: 'Pre-drill 32mm system line holes if adjustable shelves',
  });

  // Right Gable (Side)
  parts.push({
    id: `${cabinet.id}-right-side`,
    cabinetId: cabinet.id,
    cabinetName: cabinet.name,
    name: 'Right Side (Gable)',
    length: carcassH,
    width: cabinet.depth,
    thickness: T,
    quantity: 1,
    material: mat,
    edgeBanding: {
      top: false,
      bottom: false,
      left: true, // front edge
      right: false,
      type: 'front',
    },
    grainDirection: 'length',
    notes: 'Pre-drill 32mm system line holes if adjustable shelves',
  });

  // Top Panel
  parts.push({
    id: `${cabinet.id}-top`,
    cabinetId: cabinet.id,
    cabinetName: cabinet.name,
    name: 'Top Panel',
    length: carcassInternalW,
    width: cabinet.depth,
    thickness: T,
    quantity: 1,
    material: mat,
    edgeBanding: {
      top: false,
      bottom: false,
      left: true,
      right: false,
      type: 'front',
    },
    grainDirection: 'length',
    notes: 'Between gables',
  });

  // Bottom Panel
  parts.push({
    id: `${cabinet.id}-bottom`,
    cabinetId: cabinet.id,
    cabinetName: cabinet.name,
    name: 'Bottom Panel',
    length: carcassInternalW,
    width: cabinet.depth,
    thickness: T,
    quantity: 1,
    material: mat,
    edgeBanding: {
      top: false,
      bottom: false,
      left: true,
      right: false,
      type: 'front',
    },
    grainDirection: 'length',
    notes: 'Between gables',
  });

  // Back Panel (rebated or grooved)
  // Standard 8mm rebate per side into 18mm gable
  const backW = Math.min(cabinet.width, carcassInternalW + 16);
  const backH = Math.min(carcassH, carcassInternalH + 16);
  parts.push({
    id: `${cabinet.id}-back`,
    cabinetId: cabinet.id,
    cabinetName: cabinet.name,
    name: 'Back Panel',
    length: Math.max(10, backH),
    width: Math.max(10, backW),
    thickness: BT,
    quantity: 1,
    material: backMat,
    edgeBanding: {
      top: false,
      bottom: false,
      left: false,
      right: false,
      type: 'none',
    },
    grainDirection: 'length',
    notes: 'Fits 8mm rebate or 16mm groove on carcass rear',
  });

  // Toe Kick Plinth (if applicable)
  if (cabinet.hasToeKick && toeKickH > 20) {
    parts.push({
      id: `${cabinet.id}-plinth-front`,
      cabinetId: cabinet.id,
      cabinetName: cabinet.name,
      name: 'Toe Kick Plinth Front',
      length: Math.max(10, cabinet.width - cabinet.toeKickSetback * 2),
      width: toeKickH,
      thickness: T,
      quantity: 1,
      material: mat,
      edgeBanding: {
        top: true,
        bottom: false,
        left: false,
        right: false,
        type: 'front',
      },
      grainDirection: 'length',
      notes: 'Plinth facing',
    });
    parts.push({
      id: `${cabinet.id}-plinth-bearers`,
      cabinetId: cabinet.id,
      cabinetName: cabinet.name,
      name: 'Toe Kick Bearer Returns',
      length: Math.max(10, cabinet.depth - cabinet.toeKickSetback - 30),
      width: toeKickH,
      thickness: T,
      quantity: 2,
      material: mat,
      edgeBanding: {
        top: false,
        bottom: false,
        left: false,
        right: false,
        type: 'none',
      },
      grainDirection: 'length',
      notes: 'Support plinth feet/sub-base',
    });
  }

  // 2. PARTITIONS
  cabinet.partitions.forEach((partition, idx) => {
    const pT = partition.thickness || T;
    // Calculate length and width based on orientation
    if (partition.type === 'vertical') {
      // Find height of opening it subdivides or full internal height
      let partH = carcassInternalH;
      if (partition.parentId) {
        const parent = openings.find((o) => o.id === partition.parentId);
        if (parent) partH = parent.height;
      }

      parts.push({
        id: `${cabinet.id}-vert-partition-${partition.id || idx}`,
        cabinetId: cabinet.id,
        cabinetName: cabinet.name,
        name: `Vertical Partition ${idx + 1}`,
        length: Math.max(10, partH),
        width: carcassInternalD,
        thickness: pT,
        quantity: 1,
        material: mat,
        edgeBanding: {
          top: false,
          bottom: false,
          left: true, // front edge
          right: false,
          type: 'front',
        },
        grainDirection: 'length',
        notes: `Vertical divider at ${partition.positionValue} (${partition.positionType})`,
      });
    } else {
      // Horizontal partition
      let partW = carcassInternalW;
      if (partition.parentId) {
        const parent = openings.find((o) => o.id === partition.parentId);
        if (parent) partW = parent.width;
      }

      parts.push({
        id: `${cabinet.id}-horiz-partition-${partition.id || idx}`,
        cabinetId: cabinet.id,
        cabinetName: cabinet.name,
        name: `Horizontal Partition ${idx + 1}`,
        length: Math.max(10, partW),
        width: carcassInternalD,
        thickness: pT,
        quantity: 1,
        material: mat,
        edgeBanding: {
          top: false,
          bottom: false,
          left: true,
          right: false,
          type: 'front',
        },
        grainDirection: 'length',
        notes: `Fixed division shelf at ${partition.positionValue} (${partition.positionType})`,
      });
    }
  });

  // 3. SHELVES
  cabinet.shelves.forEach((shelfGroup, gIdx) => {
    const opening = getOpening(openings, shelfGroup.openingId);
    const count = shelfGroup.count || 1;
    const isAdj = shelfGroup.shelfType === 'adjustable';
    // Adjustable shelves are usually 2mm narrower for easy pin insertion
    const shelfWidth = isAdj ? Math.max(10, opening.width - 2) : opening.width;
    const shelfDepth = Math.max(10, opening.depth - (shelfGroup.setback || (isAdj ? 12 : 0)));
    const sT = shelfGroup.thickness || T;
    const sMat = shelfGroup.material || mat;

    parts.push({
      id: `${cabinet.id}-shelves-${shelfGroup.id || gIdx}`,
      cabinetId: cabinet.id,
      cabinetName: cabinet.name,
      name: `${isAdj ? 'Adjustable Shelf' : 'Fixed Shelf'} (${opening.id})`,
      length: Math.round(shelfWidth),
      width: Math.round(shelfDepth),
      thickness: sT,
      quantity: count,
      material: sMat,
      edgeBanding: {
        top: false,
        bottom: false,
        left: true, // front exposed edge
        right: false,
        type: shelfGroup.edgeBanding || 'front',
      },
      grainDirection: 'length',
      notes: `${count}x ${isAdj ? 'Adjustable on 5mm pins' : 'Fixed dowelled/screwed'}`,
    });
  });

  // 4. DRAWERS
  cabinet.drawers.forEach((drawerStack, sIdx) => {
    const opening = getOpening(openings, drawerStack.openingId);
    const N = Math.max(1, drawerStack.count);
    const gap = drawerStack.frontGap || 3;
    const totalGapH = (N - 1) * gap;
    const equalFrontH = Math.max(50, (opening.height - totalGapH) / N);

    // Front dimensions
    const isInset = drawerStack.frontType === 'inset';
    const frontWidth = isInset
      ? Math.max(50, opening.width - 2 * gap)
      : Math.max(50, opening.width + 2 * (T - 3)); // 15mm overlay typical

    // Runner length calculation based on internal depth:
    // Standard commercial runner sizes: 250, 300, 350, 400, 450, 500, 550 mm
    const availableDepth = opening.depth;
    let runnerL = drawerStack.runnerLength;
    if (!runnerL || runnerL > availableDepth - 10) {
      if (availableDepth >= 560) runnerL = 550;
      else if (availableDepth >= 510) runnerL = 500;
      else if (availableDepth >= 460) runnerL = 450;
      else if (availableDepth >= 410) runnerL = 400;
      else if (availableDepth >= 360) runnerL = 350;
      else runnerL = 300;
    }

    const sideClearance = drawerStack.sideClearance || 25.4; // 12.7mm per side
    const boxOutsideWidth = Math.max(50, opening.width - sideClearance);
    const boxSideT = 16; // 16mm drawer box side material standard
    const boxInsideWidth = Math.max(20, boxOutsideWidth - 2 * boxSideT);
    const bottomT = drawerStack.bottomThickness || 6;

    for (let i = 0; i < N; i++) {
      const frontH =
        drawerStack.customHeights && drawerStack.customHeights[i]
          ? drawerStack.customHeights[i]
          : equalFrontH;

      // 1. Drawer Front
      parts.push({
        id: `${cabinet.id}-drawer-front-${drawerStack.id || sIdx}-${i + 1}`,
        cabinetId: cabinet.id,
        cabinetName: cabinet.name,
        name: `Drawer Front ${i + 1} of ${N}`,
        length: Math.round(frontWidth),
        width: Math.round(frontH),
        thickness: T,
        quantity: 1,
        material: mat,
        edgeBanding: {
          top: true,
          bottom: true,
          left: true,
          right: true,
          type: 'all',
        },
        grainDirection: 'length',
        notes: `${drawerStack.frontType} front, 3mm reveals`,
      });

      // 2. Drawer Box Height (typically 40mm less than front for clearance)
      const boxH = Math.max(50, Math.min(220, Math.round(frontH - 45)));

      // Box Sides (2 per drawer)
      parts.push({
        id: `${cabinet.id}-drawer-box-sides-${drawerStack.id || sIdx}-${i + 1}`,
        cabinetId: cabinet.id,
        cabinetName: cabinet.name,
        name: `Drawer Box Sides (Drawer ${i + 1})`,
        length: Math.round(runnerL),
        width: boxH,
        thickness: boxSideT,
        quantity: 2,
        material: drawerStack.boxMaterial || 'White Melamine (16mm)',
        edgeBanding: {
          top: true,
          bottom: false,
          left: false,
          right: false,
          type: 'front',
        },
        grainDirection: 'length',
        notes: `Runner: ${runnerL}mm ${drawerStack.runnerType}`,
      });

      // Box Front & Back (2 per drawer)
      parts.push({
        id: `${cabinet.id}-drawer-box-subfront-back-${drawerStack.id || sIdx}-${i + 1}`,
        cabinetId: cabinet.id,
        cabinetName: cabinet.name,
        name: `Drawer Sub-Front & Back (Drawer ${i + 1})`,
        length: Math.round(boxInsideWidth),
        width: boxH,
        thickness: boxSideT,
        quantity: 2,
        material: drawerStack.boxMaterial || 'White Melamine (16mm)',
        edgeBanding: {
          top: true,
          bottom: false,
          left: false,
          right: false,
          type: 'front',
        },
        grainDirection: 'length',
        notes: 'Between box sides',
      });

      // Box Bottom (1 per drawer)
      // Bottom panel fits into 6mm groove or captive bottom
      const bottomW = Math.max(20, boxInsideWidth + 12); // 6mm grooved each side
      const bottomL = Math.max(20, runnerL - 10);
      parts.push({
        id: `${cabinet.id}-drawer-box-bottom-${drawerStack.id || sIdx}-${i + 1}`,
        cabinetId: cabinet.id,
        cabinetName: cabinet.name,
        name: `Drawer Box Bottom (Drawer ${i + 1})`,
        length: Math.round(bottomL),
        width: Math.round(bottomW),
        thickness: bottomT,
        quantity: 1,
        material: backMat,
        edgeBanding: {
          top: false,
          bottom: false,
          left: false,
          right: false,
          type: 'none',
        },
        grainDirection: 'length',
        notes: `${bottomT}mm hardboard/plywood slide-in bottom`,
      });
    }
  });

  // 5. DOORS
  cabinet.doors.forEach((doorConfig, dIdx) => {
    const opening = getOpening(openings, doorConfig.openingId);
    const gap = doorConfig.doorGap || 2;
    const cGap = doorConfig.centreGap || 3;
    const overlay = doorConfig.overlayAmount || 15;
    const isInset = doorConfig.overlayType === 'inset';

    let doorHeight = 0;
    if (isInset) {
      doorHeight = Math.max(50, opening.height - 2 * gap);
    } else {
      // Overlay onto top/bottom edges
      doorHeight = Math.max(50, opening.height + 2 * overlay - 2 * gap);
    }

    if (doorConfig.doorType === 'double') {
      let doorWidth = 0;
      if (isInset) {
        doorWidth = Math.max(50, (opening.width - 2 * gap - cGap) / 2);
      } else {
        doorWidth = Math.max(50, (opening.width + 2 * overlay - cGap - 2 * gap) / 2);
      }

      parts.push({
        id: `${cabinet.id}-door-left-${doorConfig.id || dIdx}`,
        cabinetId: cabinet.id,
        cabinetName: cabinet.name,
        name: `Door Left (Pair)`,
        length: Math.round(doorHeight),
        width: Math.round(doorWidth),
        thickness: T,
        quantity: 1,
        material: doorConfig.material || mat,
        edgeBanding: {
          top: true,
          bottom: true,
          left: true,
          right: true,
          type: doorConfig.edgeBanding || 'all',
        },
        grainDirection: 'length',
        notes: `Pair door, ${doorConfig.overlayType}, ${cGap}mm center reveal`,
      });

      parts.push({
        id: `${cabinet.id}-door-right-${doorConfig.id || dIdx}`,
        cabinetId: cabinet.id,
        cabinetName: cabinet.name,
        name: `Door Right (Pair)`,
        length: Math.round(doorHeight),
        width: Math.round(doorWidth),
        thickness: T,
        quantity: 1,
        material: doorConfig.material || mat,
        edgeBanding: {
          top: true,
          bottom: true,
          left: true,
          right: true,
          type: doorConfig.edgeBanding || 'all',
        },
        grainDirection: 'length',
        notes: `Pair door, ${doorConfig.overlayType}, ${cGap}mm center reveal`,
      });
    } else {
      // Single door (left or right hinge)
      let doorWidth = 0;
      if (isInset) {
        doorWidth = Math.max(50, opening.width - 2 * gap);
      } else {
        doorWidth = Math.max(50, opening.width + 2 * overlay - 2 * gap);
      }

      const hingeSide = doorConfig.doorType === 'single-right' ? 'Right' : 'Left';

      parts.push({
        id: `${cabinet.id}-door-single-${doorConfig.id || dIdx}`,
        cabinetId: cabinet.id,
        cabinetName: cabinet.name,
        name: `Door (${hingeSide} Hinge)`,
        length: Math.round(doorHeight),
        width: Math.round(doorWidth),
        thickness: T,
        quantity: 1,
        material: doorConfig.material || mat,
        edgeBanding: {
          top: true,
          bottom: true,
          left: true,
          right: true,
          type: doorConfig.edgeBanding || 'all',
        },
        grainDirection: 'length',
        notes: `Single door hinged ${hingeSide}, ${doorConfig.overlayType}`,
      });
    }
  });

  return parts;
}

/**
 * Aggregates parts from multiple cabinets or individual cabinet, grouping identical
 * parts (same dimensions, material, thickness, and edge-banding) and summing quantities.
 */
export function aggregateCuttingList(parts: CutPart[]): CutPart[] {
  const map = new Map<string, CutPart>();

  for (const part of parts) {
    const key = `${part.length}x${part.width}x${part.thickness}_${part.material}_${part.edgeBanding.type}_${part.name}`;
    if (map.has(key)) {
      const existing = map.get(key)!;
      existing.quantity += part.quantity;
      if (!existing.cabinetName.includes(part.cabinetName)) {
        existing.cabinetName += `, ${part.cabinetName}`;
      }
    } else {
      map.set(key, { ...part });
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    // Sort by length desc, then width desc
    if (b.length !== a.length) return b.length - a.length;
    return b.width - a.width;
  });
}

/**
 * Calculates total edge-banding linear metres required for a list of cut parts.
 */
export function calculateEdgeBandingTotals(parts: CutPart[]): {
  totalLinearMetres: number;
  byMaterial: Record<string, number>;
} {
  let totalMetres = 0;
  const byMaterial: Record<string, number> = {};

  for (const part of parts) {
    let linearMmPerPart = 0;
    const { top, bottom, left, right } = part.edgeBanding;

    // Length edges (left, right) and Width edges (top, bottom)
    if (left) linearMmPerPart += part.length;
    if (right) linearMmPerPart += part.length;
    if (top) linearMmPerPart += part.width;
    if (bottom) linearMmPerPart += part.width;

    const totalMm = linearMmPerPart * part.quantity;
    const metres = totalMm / 1000;

    totalMetres += metres;
    byMaterial[part.material] = (byMaterial[part.material] || 0) + metres;
  }

  return {
    totalLinearMetres: Math.round(totalMetres * 100) / 100,
    byMaterial,
  };
}
