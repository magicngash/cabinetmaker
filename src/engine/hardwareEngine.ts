import { Cabinet, CostSettings, HardwareItem } from '../types';

export function calculateProjectHardware(
  cabinets: Cabinet[],
  costSettings: CostSettings
): HardwareItem[] {
  const hardware: HardwareItem[] = [];

  let totalHinges = 0;
  let totalRunners = 0;
  let totalHandles = 0;
  let totalShelfPins = 0;
  let totalConfirmatScrews = 0;
  let totalBackScrews = 0;
  let totalDowels = 0;

  for (const cab of cabinets) {
    // 1. Doors -> Hinges & Handles
    for (const door of cab.doors) {
      // Calculate door height roughly from cabinet
      const isPair = door.doorType === 'double';
      const doorMultiplier = isPair ? 2 : 1;

      // Hinge rule:
      // Height < 900mm -> 2 hinges per door
      // 900 - 1500mm -> 3 hinges per door
      // 1500 - 2000mm -> 4 hinges per door
      // > 2000mm -> 5 hinges per door
      const h = cab.height;
      let hingesPerLeaf = 2;
      if (h >= 2000) hingesPerLeaf = 5;
      else if (h >= 1500) hingesPerLeaf = 4;
      else if (h >= 900) hingesPerLeaf = 3;

      totalHinges += hingesPerLeaf * doorMultiplier;
      totalHandles += doorMultiplier;
    }

    // 2. Drawers -> Runners & Handles & Screws
    for (const drawer of cab.drawers) {
      totalRunners += drawer.count;
      totalHandles += drawer.count;
      // Drawer assembly screws: 8 per box + 4 for runners
      totalConfirmatScrews += drawer.count * 12;
    }

    // 3. Shelves -> Shelf pins (4 per adjustable shelf)
    for (const shelf of cab.shelves) {
      if (shelf.shelfType === 'adjustable') {
        totalShelfPins += shelf.count * 4;
      } else {
        // Fixed shelf: 4 confirmat screws / cam dowels
        totalConfirmatScrews += shelf.count * 4;
        totalDowels += shelf.count * 4;
      }
    }

    // 4. Carcass & Partitions
    // Carcass assembly: 8 confirmat screws (4 top, 4 bottom) + 8 dowels
    totalConfirmatScrews += 8;
    totalDowels += 8;

    // Partitions: 4 screws each
    totalConfirmatScrews += cab.partitions.length * 4;

    // Back panel screws / staples (perimeter roughly every 150mm)
    const perimeter = (cab.width + cab.height) * 2;
    totalBackScrews += Math.round(perimeter / 150);
  }

  if (totalHinges > 0) {
    hardware.push({
      id: 'hw-hinges',
      name: 'Concealed Soft-Close Hinges (110° Cup)',
      category: 'Hinges',
      quantity: totalHinges,
      unit: 'pcs',
      unitCost: costSettings.hingeCostPerPiece,
      totalCost: Math.round(totalHinges * costSettings.hingeCostPerPiece * 100) / 100,
      notes: 'Includes mounting plates & screws',
    });
  }

  if (totalRunners > 0) {
    hardware.push({
      id: 'hw-runners',
      name: 'Full-Extension Soft-Close Drawer Runners',
      category: 'Runners',
      quantity: totalRunners,
      unit: 'pairs',
      unitCost: costSettings.runnerCostPerPair,
      totalCost: Math.round(totalRunners * costSettings.runnerCostPerPair * 100) / 100,
      notes: 'Rated 35kg dynamic capacity',
    });
  }

  if (totalHandles > 0) {
    hardware.push({
      id: 'hw-handles',
      name: 'Cabinet Handles / Pulls (160mm Hole Center)',
      category: 'Handles',
      quantity: totalHandles,
      unit: 'pcs',
      unitCost: costSettings.handleCostPerPiece,
      totalCost: Math.round(totalHandles * costSettings.handleCostPerPiece * 100) / 100,
      notes: 'Brushed metal or matte black finish with M4 screws',
    });
  }

  if (totalShelfPins > 0) {
    hardware.push({
      id: 'hw-shelf-pins',
      name: '5mm Steel Spoon Shelf Pins with Rubber Ring',
      category: 'Supports',
      quantity: totalShelfPins,
      unit: 'pcs',
      unitCost: 0.15,
      totalCost: Math.round(totalShelfPins * 0.15 * 100) / 100,
      notes: 'Standard 32mm system boring',
    });
  }

  if (totalConfirmatScrews > 0) {
    hardware.push({
      id: 'hw-confirmat',
      name: 'Confirmat Assembly Screws (7×50 mm)',
      category: 'Fasteners',
      quantity: totalConfirmatScrews,
      unit: 'pcs',
      unitCost: 0.12,
      totalCost: Math.round(totalConfirmatScrews * 0.12 * 100) / 100,
      notes: 'Zinc plated, hex drive',
    });
  }

  if (totalDowels > 0) {
    hardware.push({
      id: 'hw-dowels',
      name: 'Fluted Wooden Dowel Pins (8×35 mm)',
      category: 'Fasteners',
      quantity: totalDowels,
      unit: 'pcs',
      unitCost: 0.05,
      totalCost: Math.round(totalDowels * 0.05 * 100) / 100,
      notes: 'Kiln-dried beechwood',
    });
  }

  if (totalBackScrews > 0) {
    hardware.push({
      id: 'hw-back-screws',
      name: 'Back Panel Flange Screws (3.5×20 mm)',
      category: 'Fasteners',
      quantity: totalBackScrews,
      unit: 'pcs',
      unitCost: 0.04,
      totalCost: Math.round(totalBackScrews * 0.04 * 100) / 100,
      notes: 'Secures hardboard/MDF back panel',
    });
  }

  return hardware;
}
