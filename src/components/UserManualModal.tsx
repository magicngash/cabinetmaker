import React, { useState } from 'react';
import { generateUserInstructionsPDF } from '../engine/pdfManualGenerator';
import {
  FileText,
  Download,
  Printer,
  X,
  Search,
  BookOpen,
  Layers,
  SplitSquareVertical,
  Sliders,
  Archive,
  DoorClosed,
  Scissors,
  DollarSign,
  Maximize2,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

interface UserManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserManualModal: React.FC<UserManualModalProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleDownloadPDF = () => {
    setIsGenerating(true);
    setTimeout(() => {
      try {
        generateUserInstructionsPDF();
      } catch (err) {
        console.error('Failed to generate PDF:', err);
      } finally {
        setIsGenerating(false);
      }
    }, 150);
  };

  const sections = [
    { id: 'all', title: 'Full Manual', icon: BookOpen },
    { id: 'getting-started', title: '1. Getting Started', icon: BookOpen },
    { id: 'views', title: '2. Viewports & 3D', icon: Layers },
    { id: 'dimensions', title: '3. Cabinet Dimensions', icon: Sliders },
    { id: 'partitions', title: '4. Partitions & Bays', icon: SplitSquareVertical },
    { id: 'shelves-drawers-doors', title: '5. Shelves, Drawers & Doors', icon: DoorClosed },
    { id: 'selection', title: '6. Selection & X-Ray', icon: Maximize2 },
    { id: 'clear-history', title: '7. Clear, Reset & Undo', icon: RotateCcw },
    { id: 'cutlist-nesting', title: '8. Cut List & Nesting', icon: Scissors },
    { id: 'costing', title: '9. Costing & Hardware BOM', icon: DollarSign },
  ];

  const shouldShow = (id: string) => {
    if (activeSection === 'all') return true;
    return activeSection === id;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl h-[88vh] rounded-xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="h-16 px-6 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-base text-slate-100 flex items-center gap-2">
                <span>CabinetCut CAD User Instructions Manual</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                  v1.0 PDF
                </span>
              </div>
              <div className="text-xs text-slate-400">
                Parametric cabinetry design, millimeter cut lists, sheet nesting &amp; manufacturing guide
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Download PDF Button */}
            <button
              id="btn-download-pdf-manual"
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer disabled:opacity-50"
              title="Generate and download printable PDF document"
            >
              <Download className="w-4 h-4" />
              <span>{isGenerating ? 'Generating PDF...' : 'Download PDF Manual'}</span>
            </button>

            {/* Print Button */}
            <button
              id="btn-print-manual"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
              title="Print instructions"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">Print</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition ml-2"
              title="Close Manual"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Navigation Sub-bar */}
        <div className="px-6 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
          {/* Section Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 text-xs">
            {sections.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`px-2.5 py-1 rounded-md transition whitespace-nowrap flex items-center gap-1.5 font-medium ${
                    activeSection === s.id
                      ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{s.title}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Search */}
          <div className="relative w-56 shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search instructions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-md pl-8 pr-3 py-1 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-8 overflow-y-auto space-y-10 text-slate-300 text-sm leading-relaxed max-w-4xl mx-auto w-full">
          {/* Quick Download Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-800/40 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                PDF
              </div>
              <div>
                <div className="font-semibold text-slate-100 text-xs">
                  Looking for an offline printable PDF document?
                </div>
                <div className="text-[11px] text-slate-400">
                  Click the button to download the formatted, high-resolution A4 user guide with diagrams and shortcut tables.
                </div>
              </div>
            </div>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow transition shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
          </div>

          {/* Section 1: Getting Started */}
          {shouldShow('getting-started') && (
            <section id="doc-getting-started" className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-base pb-2 border-b border-slate-800">
                <BookOpen className="w-5 h-5" />
                <h2>1. Getting Started &amp; Core Concept</h2>
              </div>
              <p>
                CabinetCut CAD is an engineering-grade parametric cabinetry CAD and production engine. It combines real-time 2D drafting, 3D WebGL orbit visualization, automated millimeter cutting lists, sheet nesting optimization, and cost quoting into a single synchronized workflow.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                  <div className="font-semibold text-slate-100 text-xs mb-1 text-emerald-400">
                    Parametric Synchronicity
                  </div>
                  <div className="text-xs text-slate-400">
                    Modifying overall cabinet height, width, or board thickness automatically recalculates every internal bay opening, shelf dowel spacing, drawer clearance, and cut list part size in real time.
                  </div>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                  <div className="font-semibold text-slate-100 text-xs mb-1 text-emerald-400">
                    Manufacturing Accuracy
                  </div>
                  <div className="text-xs text-slate-400">
                    Calculations follow strict European 32mm system standards and face-frame joinery rules, subtracting carcass joinery overlaps, door reveal gaps (typically 2-3mm), and slide setbacks.
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Section 2: Viewports */}
          {shouldShow('views') && (
            <section id="doc-views" className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-base pb-2 border-b border-slate-800">
                <Layers className="w-5 h-5" />
                <h2>2. Viewports &amp; 3D Orbit Visualizer</h2>
              </div>
              <p>
                Switch between CAD viewports using the primary top navigation bar tabs:
              </p>
              <ul className="space-y-2 text-xs">
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-slate-100 min-w-36 text-sky-400">&bull; Front Elevation:</span>
                  <span>Interactive 2D drafting canvas with real-time dimensions, zoom controls, and click-to-select components.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-slate-100 min-w-36 text-sky-400">&bull; Inside View:</span>
                  <span>Cross-sectional interior elevation displaying vertical/horizontal partitions, shelf dowels, drawer slides, and back grooving.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-slate-100 min-w-36 text-sky-400">&bull; Side View:</span>
                  <span>Side elevation cross-section detailing carcass depth, toe kick height and setback, door thickness, and back panel grooving.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-slate-100 min-w-36 text-sky-400">&bull; Top Plan View:</span>
                  <span>Overhead plan showing carcass depth, corner joints, and top structural rails.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-slate-100 min-w-36 text-sky-400">&bull; 3D Visualizer:</span>
                  <span>Interactive WebGL 3D model. Left-click and drag to orbit 360°, right-click and drag to pan, mouse scroll to zoom.</span>
                </li>
              </ul>
            </section>
          )}

          {/* Section 3: Dimensions */}
          {shouldShow('dimensions') && (
            <section id="doc-dimensions" className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-base pb-2 border-b border-slate-800">
                <Sliders className="w-5 h-5" />
                <h2>3. Cabinet Dimensions &amp; Construction Setup</h2>
              </div>
              <p>
                In the right-hand **Properties Panel** (when no individual internal component is selected), you configure overall parameters:
              </p>
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/60 space-y-2 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="font-semibold text-slate-200 block mb-0.5">Width, Height, Depth</span>
                    <span className="text-slate-400">Millimeter inputs with automatic clamp validation (100mm to 3000mm).</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-200 block mb-0.5">Carcass Thickness</span>
                    <span className="text-slate-400">16mm (standard), 18mm (heavy duty), or 25mm (premium).</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-200 block mb-0.5">Plinth / Toe Kick</span>
                    <span className="text-slate-400">Toggle plinth on/off, customize height (e.g. 100mm) and setback (e.g. 50mm).</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Section 4: Partitions */}
          {shouldShow('partitions') && (
            <section id="doc-partitions" className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-base pb-2 border-b border-slate-800">
                <SplitSquareVertical className="w-5 h-5" />
                <h2>4. Partitions &amp; Internal Bay Subdivisions</h2>
              </div>
              <p>
                Subdivide cabinets into separate compartments using Vertical and Horizontal Partitions:
              </p>
              <div className="space-y-2 text-xs">
                <p>
                  <strong>Vertical Partitions:</strong> Click <em>&ldquo;Add Vertical Partition&rdquo;</em> in the Left Toolbar. Choose positioning:
                </p>
                <ul className="list-disc list-inside text-slate-400 space-y-1 pl-2">
                  <li><strong>Equal (50%):</strong> Centers the partition perfectly in the available opening.</li>
                  <li><strong>Percentage (%):</strong> Custom proportional split (e.g. 33% / 67%).</li>
                  <li><strong>Fixed from Left / Right:</strong> Exact millimeter distance from left or right carcass side.</li>
                </ul>
                <p className="pt-2">
                  <strong>Horizontal Partitions:</strong> Split any bay vertically to create upper and lower functional zones.
                </p>
              </div>
            </section>
          )}

          {/* Section 5: Shelves, Drawers & Doors */}
          {shouldShow('shelves-drawers-doors') && (
            <section id="doc-shelves-drawers-doors" className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-base pb-2 border-b border-slate-800">
                <DoorClosed className="w-5 h-5" />
                <h2>5. Shelves, Drawer Stacks &amp; Doors</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 rounded-lg bg-slate-800/60 border border-slate-700/60 space-y-1.5">
                  <div className="font-semibold text-purple-400">Shelving</div>
                  <p className="text-slate-400">
                    Add 1 to 12 shelves per opening. Choose <strong>Adjustable</strong> (with 32mm system pin holes) or <strong>Fixed</strong> structural dowelled shelves.
                  </p>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-800/60 border border-slate-700/60 space-y-1.5">
                  <div className="font-semibold text-amber-400">Drawer Stacks</div>
                  <p className="text-slate-400">
                    Configure 2, 3, or 4 drawer stacks. Supports <strong>Undermount Soft-Close</strong> (Blum Tandem/Movento) and <strong>Side-Mount Ball Bearing</strong> runners.
                  </p>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-800/60 border border-slate-700/60 space-y-1.5">
                  <div className="font-semibold text-emerald-400">Doors</div>
                  <p className="text-slate-400">
                    Choose Single (Left/Right hinge) or Double pair doors. Supports <strong>Full Overlay</strong>, <strong>Half Overlay</strong>, and <strong>Inset</strong> styles with customizable perimeter reveals.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Section 6: Selection & X-Ray */}
          {shouldShow('selection') && (
            <section id="doc-selection" className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-base pb-2 border-b border-slate-800">
                <Maximize2 className="w-5 h-5" />
                <h2>6. Precision Element Selection &amp; X-Ray Mode</h2>
              </div>
              <p>
                When components overlap (e.g. doors covering interior shelves), select the exact element using any of these methods:
              </p>
              <div className="p-4 rounded-lg bg-slate-800/60 border border-slate-700/60 space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-slate-100 min-w-36 text-emerald-400">1. Select Element Dropdown:</span>
                  <span>At the top of the Properties Panel, select any partition, shelf, drawer, door, or opening by name.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-slate-100 min-w-36 text-emerald-400">2. Cabinet Outliner:</span>
                  <span>Browse the outliner tree in the Properties Panel and click any component to open its properties.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-slate-100 min-w-36 text-emerald-400">3. X-Ray (Click-Through):</span>
                  <span>In the Front Elevation toolbar, click &ldquo;X-Ray&rdquo;. Doors become semi-transparent and click-through so you can click internal shelves directly.</span>
                </div>
              </div>
            </section>
          )}

          {/* Section 7: Clear & History */}
          {shouldShow('clear-history') && (
            <section id="doc-clear-history" className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-base pb-2 border-b border-slate-800">
                <RotateCcw className="w-5 h-5" />
                <h2>7. Clearing Workplace, Reset &amp; Undo History</h2>
              </div>
              <div className="space-y-2 text-xs">
                <p>
                  <strong>How to Clear Your Workplace:</strong>
                </p>
                <ul className="list-disc list-inside text-slate-400 space-y-1 pl-2">
                  <li><strong>Clear Cabinet:</strong> In the Left Toolbar under <em>Clear &amp; Reset</em> (or <em>Clear All</em> in the Cabinet Outliner). Empties internal shelves, doors, and drawers while retaining outer carcass dimensions.</li>
                  <li><strong>Reset Workplace:</strong> In the Left Toolbar under <em>Clear &amp; Reset</em>. Resets to a fresh, single blank cabinet.</li>
                  <li><strong>Empty Carcass Preset:</strong> Click <em>&ldquo;Empty Carcass (Blank Slate)&rdquo;</em> in the preset library.</li>
                </ul>
                <p className="pt-2">
                  <strong>Undo &amp; Redo Actions:</strong>
                </p>
                <p className="text-slate-400">
                  Every change is tracked in project history. Use the <strong>Undo / Redo</strong> buttons in the top navbar or left toolbar, or press <code>Ctrl + Z</code> / <code>Ctrl + Y</code>.
                </p>
              </div>
            </section>
          )}

          {/* Section 8: Cutlist & Nesting */}
          {shouldShow('cutlist-nesting') && (
            <section id="doc-cutlist-nesting" className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-base pb-2 border-b border-slate-800">
                <Scissors className="w-5 h-5" />
                <h2>8. Cutting List &amp; Sheet Nesting Optimizer</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-lg bg-slate-800/60 border border-slate-700/60 space-y-1.5">
                  <div className="font-semibold text-slate-100 text-emerald-400">Automated Cutting List</div>
                  <p className="text-slate-400">
                    Generates exact dimensions for side panels, top/bottom, back, shelves, partitions, drawer boxes, and doors. Includes edge banding assignments and grain direction. Exportable to CSV.
                  </p>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-800/60 border border-slate-700/60 space-y-1.5">
                  <div className="font-semibold text-slate-100 text-emerald-400">Sheet Nesting Optimizer</div>
                  <p className="text-slate-400">
                    Arranges rectangular parts onto standard 2440 x 1220 mm sheets using a 2D guillotine cut packing algorithm. Visualizes cut patterns, saw blade kerf allowance, and scrap waste percentage.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Section 9: Costing */}
          {shouldShow('costing') && (
            <section id="doc-costing" className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-base pb-2 border-b border-slate-800">
                <DollarSign className="w-5 h-5" />
                <h2>9. Cost Calculation &amp; Hardware BOM</h2>
              </div>
              <p className="text-xs">
                The Cost Quote view calculates real-time project estimates:
              </p>
              <ul className="space-y-1.5 text-xs text-slate-400 list-disc list-inside pl-2">
                <li><strong>Sheet Materials:</strong> Cost of carcass, back, and door boards based on sheets nested.</li>
                <li><strong>Edge Banding:</strong> Total linear meters of edging applied multiplied by tape cost.</li>
                <li><strong>Hardware BOM:</strong> Automatically tallies hinges, mounting plates, drawer slides, handles, shelf pins, and screws.</li>
                <li><strong>Labor &amp; Margin:</strong> Configurable workshop hourly rate, assembly hours, and profit markup percentage.</li>
              </ul>
            </section>
          )}

          {/* Keyboard Shortcuts Summary Table */}
          <section className="pt-4 border-t border-slate-800">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Keyboard Shortcuts Quick Reference
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-slate-800/60 border border-slate-700/60">
                <span className="text-slate-300">Undo last action</span>
                <kbd className="px-2 py-0.5 bg-slate-900 rounded font-mono text-[11px] text-emerald-400 border border-slate-700">Ctrl + Z</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-800/60 border border-slate-700/60">
                <span className="text-slate-300">Redo action</span>
                <kbd className="px-2 py-0.5 bg-slate-900 rounded font-mono text-[11px] text-emerald-400 border border-slate-700">Ctrl + Y / Ctrl+Shift+Z</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-800/60 border border-slate-700/60">
                <span className="text-slate-300">Delete selected element</span>
                <kbd className="px-2 py-0.5 bg-slate-900 rounded font-mono text-[11px] text-red-400 border border-slate-700">Delete / Backspace</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-800/60 border border-slate-700/60">
                <span className="text-slate-300">Deselect / Return to Cabinet</span>
                <kbd className="px-2 py-0.5 bg-slate-900 rounded font-mono text-[11px] text-slate-300 border border-slate-700">Escape</kbd>
              </div>
            </div>
          </section>
        </div>

        {/* Modal Footer */}
        <div className="h-14 px-6 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 font-mono">
            CabinetCut CAD &bull; Parametric Joinery Engineering
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF File</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
