import { jsPDF } from 'jspdf';

export function generateUserInstructionsPDF(): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 16;
  const contentWidth = pageWidth - marginX * 2; // 178mm
  let currentY = 20;

  const checkPageBreak = (neededHeight: number): void => {
    if (currentY + neededHeight > pageHeight - 20) {
      doc.addPage();
      currentY = 22;
      drawRunningHeader();
    }
  };

  const drawRunningHeader = (): void => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text('CabinetCut CAD  |  Parametric Cabinetry & Production Engine', marginX, 12);
    doc.text('Official User Instructions', pageWidth - marginX, 12, { align: 'right' });
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.3);
    doc.line(marginX, 14, pageWidth - marginX, 14);
  };

  const addHeading1 = (title: string): void => {
    checkPageBreak(16);
    currentY += 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(title, marginX, currentY);

    // Accent underline
    doc.setDrawColor(16, 185, 129); // emerald-500
    doc.setLineWidth(0.8);
    doc.line(marginX, currentY + 1.5, marginX + 35, currentY + 1.5);
    currentY += 7;
  };

  const addHeading2 = (title: string): void => {
    checkPageBreak(12);
    currentY += 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59); // slate-800
    doc.text(title, marginX, currentY);
    currentY += 5;
  };

  const addParagraph = (text: string, spaceBelow = 4): void => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85); // slate-700
    const lines = doc.splitTextToSize(text, contentWidth);
    checkPageBreak(lines.length * 4.5 + spaceBelow);
    doc.text(lines, marginX, currentY);
    currentY += lines.length * 4.5 + spaceBelow;
  };

  const addBullet = (boldPrefix: string, text: string): void => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    const fullText = boldPrefix ? `${boldPrefix}: ${text}` : text;
    const lines = doc.splitTextToSize(fullText, contentWidth - 6);
    checkPageBreak(lines.length * 4.5 + 2);

    // Bullet dot
    doc.setFillColor(16, 185, 129);
    doc.circle(marginX + 2, currentY - 1.2, 0.9, 'F');

    // Text
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(boldPrefix ? `${boldPrefix}: ` : '', marginX + 6, currentY);

    const prefixWidth = boldPrefix ? doc.getTextWidth(`${boldPrefix}: `) : 0;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);

    // If multi-line, render split text cleanly
    if (lines.length === 1) {
      doc.text(text, marginX + 6 + prefixWidth, currentY);
      currentY += 5;
    } else {
      const restLines = doc.splitTextToSize(`${boldPrefix ? boldPrefix + ': ' : ''}${text}`, contentWidth - 6);
      doc.text(restLines, marginX + 6, currentY);
      currentY += restLines.length * 4.5 + 2;
    }
  };

  const addCalloutBox = (title: string, bodyText: string): void => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const lines = doc.splitTextToSize(bodyText, contentWidth - 12);
    const boxHeight = lines.length * 4.2 + 12;

    checkPageBreak(boxHeight + 4);

    // Background
    doc.setFillColor(241, 245, 249); // slate-100
    doc.roundedRect(marginX, currentY, contentWidth, boxHeight, 2, 2, 'F');

    // Left accent bar
    doc.setFillColor(16, 185, 129); // emerald-500
    doc.rect(marginX, currentY, 2.5, boxHeight, 'F');

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(title, marginX + 6, currentY + 5.5);

    // Body
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.8);
    doc.setTextColor(51, 65, 85);
    doc.text(lines, marginX + 6, currentY + 10.5);

    currentY += boxHeight + 4;
  };

  const addShortcutRow = (key: string, action: string): void => {
    checkPageBreak(7);
    doc.setFillColor(248, 250, 252);
    doc.rect(marginX, currentY - 3.5, contentWidth, 6, 'F');

    // Key badge
    doc.setFillColor(226, 232, 240);
    doc.roundedRect(marginX + 2, currentY - 3, 34, 5, 1, 1, 'F');
    doc.setFont('courier', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(key, marginX + 4, currentY + 0.5);

    // Description
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.text(action, marginX + 42, currentY + 0.5);

    currentY += 6.5;
  };

  // ----------------------------------------------------
  // COVER / TITLE BLOCK (Page 1)
  // ----------------------------------------------------
  // Hero background header block
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Accent bar
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.rect(0, 42, pageWidth, 2.5, 'F');

  // Brand title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text('CabinetCut CAD', marginX, 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text('Parametric Cabinetry Design, Cut List & Sheet Optimization System', marginX, 30);

  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(`User Instructions Manual  |  Generated ${new Date().toLocaleDateString()}  |  Version 1.0`, marginX, 37);

  currentY = 52;

  // Introduction
  addHeading1('1. Introduction & Core Concept');
  addParagraph(
    'CabinetCut CAD is an engineering-grade parametric cabinetry CAD and manufacturing workflow tool. Every cabinet is computed parametrically in real-time down to 1mm tolerances. Whenever overall dimensions, material board thicknesses, or partitions change, all interior bay dimensions, shelf clearances, drawer box heights, and cut lists update synchronously.'
  );

  addCalloutBox(
    'Key Manufacturing Principles Enforced',
    '• Frameless European 32mm system & Traditional Face Frame standards.\n• Automatic board thickness subtractions (Sides, Top, Bottom, Back).\n• Drawer slide clearances (25.4mm for side-mount, 21mm for undermount soft-close).\n• Hinge overlay calculations (Full overlay, Half overlay, and Flush Inset).'
  );

  // Chapter 2
  addHeading1('2. Workspace & Viewport Navigation');
  addParagraph(
    'The top navigation bar provides instant switching between 2D CAD engineering views, a real-time 3D visualizer, and manufacturing production tables:'
  );
  addBullet('Front Elevation View', 'Primary 2D drafting canvas with real-time dimensions, interactive selection, and zoom/pan controls.');
  addBullet('Inside / Section View', 'Cross-sectional cutaway displaying interior structural partitions, shelf dowels, drawer slides, and back panel grooving.');
  addBullet('Side Elevation View', 'Side cross-section revealing carcass depth, plinth / toe kick setback, door thickness, and back inset.');
  addBullet('Top Plan View', 'Overhead plan showing cabinet depth, corner squareness, and carcass joinery.');
  addBullet('3D Orbit Visualizer', 'Interactive WebGL 3D model. Left-click to orbit, right-click to pan, scroll to zoom in/out.');
  addBullet('Cutting List', 'Automated millimeter-accurate bill of materials with grain direction, edge banding codes, and manual overrides.');
  addBullet('Sheet Nesting', '2D guillotine cut optimization placing parts onto standard 2440 x 1220 mm sheets to minimize scrap.');
  addBullet('Cost Quoting', 'Real-time project pricing combining sheet goods, edge banding linear meters, hardware, labor, and profit margins.');

  // Chapter 3
  addHeading1('3. Designing Cabinets & Editing Parameters');
  addParagraph(
    'To configure cabinet dimensions and materials, ensure the entire cabinet is selected (click on the canvas background or pick Entire Cabinet in the top-right dropdown):'
  );
  addBullet('Overall Dimensions', 'Adjust Width, Height, and Depth in millimeters (e.g., 800 W x 900 H x 600 D).');
  addBullet('Carcass Thickness', 'Select standard carcass board gauge: 16mm (Standard), 18mm (Heavy Duty), or 25mm (Premium).');
  addBullet('Back Panel Inset', 'Configure grooved back panel thickness: 3mm Hardboard, 6mm MDF, or 16/18mm solid panel.');
  addBullet('Toe Kick / Plinth', 'Toggle the base plinth on or off and set custom Plinth Height (e.g. 100mm) and Setback (e.g. 50mm).');
  addBullet('Materials', 'Assign White Melamine, MDF, Birch Plywood, Oak Veneer, or custom workshop stock.');

  // Chapter 4
  addHeading1('4. Adding Partitions, Shelves, Drawers & Doors');
  addParagraph(
    'Cabinet interiors can be subdivided into multiple functional bays using the Left Toolbar or by selecting an opening:'
  );
  addBullet('Vertical Partitions', 'Splits the cabinet into left and right bays. Position can be Equal (50%), Percentage, or fixed distance from left/right.');
  addBullet('Horizontal Partitions', 'Splits an opening into upper and lower bays at exact heights.');
  addBullet('Shelving Groups', 'Insert 1 to 12 shelves. Choose between Adjustable (32mm pin system) or Fixed structural shelves.');
  addBullet('Drawer Stacks', 'Insert 2, 3, or 4 drawer stacks. Automatically calculates drawer front heights, drawer box depths, and runner clearances.');
  addBullet('Doors', 'Add Single Left, Single Right, or Pair (Double) doors. Choose Full Overlay, Half Overlay, or Inset styles.');

  // Chapter 5
  addHeading1('5. Precision Element Selection & X-Ray Mode');
  addParagraph(
    'When components overlap (such as doors covering internal shelves), CabinetCut provides three foolproof ways to select elements:'
  );
  addBullet('Top Element Dropdown', 'At the very top of the right-hand Properties Panel, select any specific partition, shelf, drawer, or bay opening directly.');
  addBullet('Cabinet Outliner', 'Scroll to the Cabinet Outliner in the right panel to see an organized list of all components. Click any item to edit it.');
  addBullet('X-Ray (Click-Through) Mode', 'In the Front Elevation view, toggle to X-Ray mode in the top-left canvas toolbar. Doors become semi-transparent and click-through, letting you select internal shelves directly.');

  // Chapter 6
  addHeading1('6. Clearing & Resetting the Workplace');
  addParagraph(
    'When you want to start fresh or remove components from your workspace:'
  );
  addBullet('Clear Cabinet', 'Found in the Left Toolbar under Clear & Reset (or click Clear All in the Cabinet Outliner). Strips all interior shelves, drawers, doors, and partitions while preserving the outer carcass dimensions and materials.');
  addBullet('Reset Workplace', 'Found in the Left Toolbar under Clear & Reset. Resets the entire workplace back to a single clean, empty carcass.');
  addBullet('Empty Carcass Preset', 'In the Left Toolbar under Cabinet Presets, click Empty Carcass (Blank Slate) to insert an empty unit without interior components.');

  // Chapter 7
  addHeading1('7. History, Undo / Redo & Shortcuts');
  addParagraph(
    'Every single modification—including dimension changes, additions, deletions, and clear actions—is recorded in the project history stack:'
  );
  addShortcutRow('Ctrl + Z / Cmd + Z', 'Undo last action (also accessible via Undo button in top navbar & left toolbar)');
  addShortcutRow('Ctrl + Y / Cmd+Shift+Z', 'Redo previously undone action');
  addShortcutRow('Delete / Backspace', 'Delete the currently selected partition, shelf, drawer stack, or door');
  addShortcutRow('Escape (Esc)', 'Deselect current element and return to overall Cabinet Parameters');
  addShortcutRow('Mouse Scroll', 'Zoom in and zoom out on the 2D CAD elevation canvas');
  addShortcutRow('Spacebar + Drag', 'Pan around the 2D CAD canvas smoothly');

  // Chapter 8
  addHeading1('8. Production Cutting List & Overrides');
  addParagraph(
    'Switch to the Cutting List tab to inspect every manufactured component (sides, top, bottom, shelves, partitions, drawer boxes, doors):'
  );
  addBullet('Millimeter Accuracy', 'Length, width, and thickness calculated according to joint construction rules.');
  addBullet('Edge Banding Indicators', 'Specifies edging requirement (None, 0.4mm PVC, 1mm PVC, 2mm ABS, or Solid Wood Lip).');
  addBullet('Grain Orientation', 'Grain direction is tagged along Length or Width for veneer and woodgrain melamine.');
  addBullet('CSV Export & Printing', 'Click Export to CSV to import into panel saws or CNC software, or click Print for workshop sheets.');

  // Chapter 9
  addHeading1('9. Sheet Nesting Optimizer');
  addParagraph(
    'The Sheet Nesting tab packs rectangular cut parts onto standard industrial sheets (2440 x 1220 mm) using a guillotine cut algorithm:'
  );
  addBullet('Kerf Allowance', 'Configurable saw blade kerf (default 3.2mm) subtracted between consecutive cuts.');
  addBullet('Grain Direction Lock', 'Prevents woodgrain panels from rotating 90 degrees if grain matching is strictly required.');
  addBullet('Scrap & Yield Metrics', 'Displays total sheets required, utilized surface area (m2), and scrap waste percentage.');

  // Chapter 10
  addHeading1('10. Cost Calculator & Hardware BOM');
  addParagraph(
    'The Cost Quote tab provides an instantaneous quotation breakdown for material and workshop management:'
  );
  addBullet('Board Stock Cost', 'Computed per sheet based on sheet nesting requirements.');
  addBullet('Edge Banding Cost', 'Total perimeter linear meters multiplied by edge tape unit price.');
  addBullet('Hardware Bill of Materials', 'Automatically tallies hinges, mounting plates, drawer runner pairs, handles, shelf pins, and assembly screws.');
  addBullet('Labor & Profit Margin', 'Configurable shop hourly rate, assembly hours, and markup percentage.');

  // Final Page Footers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(
      `CabinetCut CAD  •  User Instructions Manual  •  Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  // Trigger browser download
  doc.save('CabinetCut_User_Instructions_Manual.pdf');
}
