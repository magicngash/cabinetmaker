import React, { useState, useEffect } from 'react';
import { ProjectProvider, useProject } from './context/ProjectContext';
import { TopNavbar, MainTabType } from './components/TopNavbar';
import { LeftToolbar } from './components/LeftToolbar';
import { FrontElevationView } from './components/FrontElevationView';
import { InsideView } from './components/InsideView';
import { SideView } from './components/SideView';
import { TopView } from './components/TopView';
import { ThreeDView } from './components/ThreeDView';
import { PropertiesPanel } from './components/PropertiesPanel';
import { CuttingListView } from './components/CuttingListView';
import { SheetOptimizerView } from './components/SheetOptimizerView';
import { CostCalculatorView } from './components/CostCalculatorView';
import { ProjectDashboardModal } from './components/ProjectDashboardModal';
import { UserManualModal } from './components/UserManualModal';

const CabinetCutContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MainTabType>('front');
  const [isDashboardOpen, setIsDashboardOpen] = useState<boolean>(false);
  const [isManualOpen, setIsManualOpen] = useState<boolean>(false);

  const { undo, redo, deleteSelectedElement, selectedElement } = useProject();

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input or textarea or select
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT'
      ) {
        return;
      }

      // Undo: Ctrl+Z or Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }

      // Redo: Ctrl+Y or Cmd+Shift+Z or Ctrl+Shift+Z
      if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')
      ) {
        e.preventDefault();
        redo();
      }

      // Delete: Delete or Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElement && selectedElement.type !== 'cabinet') {
          e.preventDefault();
          deleteSelectedElement();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, deleteSelectedElement, selectedElement]);

  const isCadView =
    activeTab === 'front' ||
    activeTab === 'inside' ||
    activeTab === 'side' ||
    activeTab === 'top' ||
    activeTab === '3d';

  return (
    <div className="w-screen h-screen flex flex-col bg-slate-950 overflow-hidden font-sans text-slate-100">
      {/* Top Navigation */}
      <TopNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenDashboard={() => setIsDashboardOpen(true)}
        onOpenManual={() => setIsManualOpen(true)}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {isCadView ? (
          <>
            {/* Left Toolbar / Palettes */}
            <LeftToolbar onOpenManual={() => setIsManualOpen(true)} />

            {/* Central Viewport */}
            <main className="flex-1 h-full relative overflow-hidden bg-slate-950">
              {activeTab === 'front' && <FrontElevationView />}
              {activeTab === 'inside' && <InsideView />}
              {activeTab === 'side' && <SideView />}
              {activeTab === 'top' && <TopView />}
              {activeTab === '3d' && <ThreeDView />}
            </main>

            {/* Right Properties Inspector */}
            <PropertiesPanel />
          </>
        ) : (
          <main className="w-full h-full overflow-hidden">
            {activeTab === 'cutlist' && <CuttingListView />}
            {activeTab === 'optimizer' && <SheetOptimizerView />}
            {activeTab === 'cost' && <CostCalculatorView />}
          </main>
        )}
      </div>

      {/* Project Dashboard Modal */}
      <ProjectDashboardModal
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
      />

      {/* User Instructions & PDF Manual Modal */}
      <UserManualModal
        isOpen={isManualOpen}
        onClose={() => setIsManualOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <ProjectProvider>
      <CabinetCutContent />
    </ProjectProvider>
  );
}

export default App;
