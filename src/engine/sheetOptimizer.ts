import { CutPart, OptimizationSettings, PlacedPart, SheetResult } from '../types';

interface SheetFreeRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Practical 2D Guillotine / Bin-Packing Algorithm for Sheet Materials
 */
export function optimizeSheetCuts(
  parts: CutPart[],
  settings: OptimizationSettings
): SheetResult[] {
  const {
    sheetWidth,
    sheetHeight,
    sawKerf,
    edgeTrim,
    allowRotation,
    respectGrain,
  } = settings;

  const usableWidth = sheetWidth - edgeTrim * 2;
  const usableHeight = sheetHeight - edgeTrim * 2;

  // Flatten parts by quantity
  interface Piece {
    partId: string;
    partName: string;
    cabinetName: string;
    length: number;
    width: number;
    material: string;
    grainDirection: 'length' | 'width' | 'none';
  }

  const pieces: Piece[] = [];
  for (const part of parts) {
    for (let q = 0; q < part.quantity; q++) {
      pieces.push({
        partId: `${part.id}-q${q + 1}`,
        partName: part.name,
        cabinetName: part.cabinetName,
        length: Math.round(part.length),
        width: Math.round(part.width),
        material: part.material,
        grainDirection: part.grainDirection,
      });
    }
  }

  // Sort pieces by largest area descending, then max dimension descending
  pieces.sort((a, b) => {
    const areaA = a.length * a.width;
    const areaB = b.length * b.width;
    if (areaB !== areaA) return areaB - areaA;
    return Math.max(b.length, b.width) - Math.max(a.length, a.width);
  });

  // Group pieces by material (carcass melamine, backboard mdf, doors, etc.)
  const piecesByMaterial = new Map<string, Piece[]>();
  for (const piece of pieces) {
    if (!piecesByMaterial.has(piece.material)) {
      piecesByMaterial.set(piece.material, []);
    }
    piecesByMaterial.get(piece.material)!.push(piece);
  }

  const allSheetResults: SheetResult[] = [];
  let globalSheetIndex = 1;

  for (const [material, matPieces] of piecesByMaterial.entries()) {
    interface SheetState {
      index: number;
      material: string;
      freeRects: SheetFreeRect[];
      placed: PlacedPart[];
    }

    const sheets: SheetState[] = [];

    const createNewSheet = (): SheetState => {
      const newSheet: SheetState = {
        index: globalSheetIndex++,
        material,
        freeRects: [
          {
            x: edgeTrim,
            y: edgeTrim,
            width: usableWidth,
            height: usableHeight,
          },
        ],
        placed: [],
      };
      sheets.push(newSheet);
      return newSheet;
    };

    createNewSheet();

    for (const piece of matPieces) {
      let placed = false;

      // Determine allowed orientations
      // If grain matters and grainDirection !== 'none' and respectGrain is true, no rotation
      const canRotate =
        allowRotation && (!respectGrain || piece.grainDirection === 'none');

      // Try placing on existing sheets
      for (const sheet of sheets) {
        // Find best-fit free rectangle (Shortest Axis Fit / Best Area Fit)
        let bestRectIndex = -1;
        let bestFitScore = Infinity;
        let shouldRotate = false;

        for (let r = 0; r < sheet.freeRects.length; r++) {
          const rect = sheet.freeRects[r];

          // Option 1: Normal orientation (length along sheet width or height)
          // Typically Sheet Width is 2440 (along grain), Sheet Height is 1220
          const fitsNormal =
            piece.length <= rect.width && piece.width <= rect.height;
          if (fitsNormal) {
            const leftoverX = rect.width - piece.length;
            const leftoverY = rect.height - piece.width;
            const score = leftoverX * leftoverY;
            if (score < bestFitScore) {
              bestFitScore = score;
              bestRectIndex = r;
              shouldRotate = false;
            }
          }

          // Option 2: Rotated orientation (width x length)
          if (canRotate) {
            const fitsRotated =
              piece.width <= rect.width && piece.length <= rect.height;
            if (fitsRotated) {
              const leftoverX = rect.width - piece.width;
              const leftoverY = rect.height - piece.length;
              const score = leftoverX * leftoverY;
              if (score < bestFitScore) {
                bestFitScore = score;
                bestRectIndex = r;
                shouldRotate = true;
              }
            }
          }
        }

        if (bestRectIndex !== -1) {
          const targetRect = sheet.freeRects.splice(bestRectIndex, 1)[0];
          const partW = shouldRotate ? piece.width : piece.length;
          const partH = shouldRotate ? piece.length : piece.width;

          sheet.placed.push({
            partId: piece.partId,
            partName: piece.partName,
            cabinetName: piece.cabinetName,
            x: targetRect.x,
            y: targetRect.y,
            width: partW,
            height: partH,
            rotated: shouldRotate,
            material: piece.material,
          });

          // Split remaining space into two sub-rectangles (Guillotine Cut)
          // Kerf is subtracted from remaining space
          const rightWidth = targetRect.width - partW - sawKerf;
          const bottomHeight = targetRect.height - partH - sawKerf;

          if (rightWidth > 5) {
            sheet.freeRects.push({
              x: targetRect.x + partW + sawKerf,
              y: targetRect.y,
              width: rightWidth,
              height: targetRect.height,
            });
          }

          if (bottomHeight > 5) {
            sheet.freeRects.push({
              x: targetRect.x,
              y: targetRect.y + partH + sawKerf,
              width: partW,
              height: bottomHeight,
            });
          }

          placed = true;
          break;
        }
      }

      // If not placed on existing sheets, create a new sheet
      if (!placed) {
        const newSheet = createNewSheet();
        const targetRect = newSheet.freeRects.pop()!;
        let shouldRotate = false;

        if (
          canRotate &&
          piece.width <= targetRect.width &&
          piece.length <= targetRect.height &&
          piece.length > targetRect.width
        ) {
          shouldRotate = true;
        }

        const partW = shouldRotate ? piece.width : piece.length;
        const partH = shouldRotate ? piece.length : piece.width;

        newSheet.placed.push({
          partId: piece.partId,
          partName: piece.partName,
          cabinetName: piece.cabinetName,
          x: targetRect.x,
          y: targetRect.y,
          width: partW,
          height: partH,
          rotated: shouldRotate,
          material: piece.material,
        });

        const rightWidth = targetRect.width - partW - sawKerf;
        const bottomHeight = targetRect.height - partH - sawKerf;

        if (rightWidth > 5) {
          newSheet.freeRects.push({
            x: targetRect.x + partW + sawKerf,
            y: targetRect.y,
            width: rightWidth,
            height: targetRect.height,
          });
        }

        if (bottomHeight > 5) {
          newSheet.freeRects.push({
            x: targetRect.x,
            y: targetRect.y + partH + sawKerf,
            width: partW,
            height: bottomHeight,
          });
        }
      }
    }

    // Convert sheet states to SheetResult
    for (const sheet of sheets) {
      if (sheet.placed.length === 0) continue;

      let usedArea = 0;
      for (const p of sheet.placed) {
        usedArea += p.width * p.height;
      }
      const totalArea = sheetWidth * sheetHeight;
      const wastePercentage = Math.max(
        0,
        Math.round(((totalArea - usedArea) / totalArea) * 1000) / 10
      );

      allSheetResults.push({
        sheetIndex: sheet.index,
        sheetWidth,
        sheetHeight,
        material: sheet.material,
        placedParts: sheet.placed,
        usedArea,
        totalArea,
        wastePercentage,
      });
    }
  }

  return allSheetResults;
}
