import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import {
  ActiveView,
  Cabinet,
  CostSettings,
  CutPart,
  DoorConfig,
  DrawerStack,
  HardwareItem,
  OptimizationSettings,
  Partition,
  Project,
  ShelfGroup,
  SheetResult,
  ValidationIssue,
} from '../types';
import {
  aggregateCuttingList,
  calculateCabinetOpenings,
  generateCabinetCutList,
} from '../engine/parametricEngine';
import { optimizeSheetCuts } from '../engine/sheetOptimizer';
import { calculateProjectCosts, CostBreakdown } from '../engine/costCalculator';
import { calculateProjectHardware } from '../engine/hardwareEngine';
import { validateCabinet } from '../engine/validator';
import {
  createDefaultDemonstrationCabinet,
  createInitialProject,
  DEFAULT_COST_SETTINGS,
  DEFAULT_OPTIMIZATION_SETTINGS,
} from '../engine/sampleData';

const STORAGE_KEY_CURRENT = 'cabinetcut_current_project';
const STORAGE_KEY_PROJECTS = 'cabinetcut_all_projects';

export interface SelectedElement {
  type: 'cabinet' | 'opening' | 'partition' | 'shelf' | 'drawer' | 'door';
  id: string;
  data?: any;
}

interface ProjectContextType {
  project: Project;
  setProject: (project: Project) => void;
  activeCabinetId: string;
  setActiveCabinetId: (id: string) => void;
  activeCabinet: Cabinet;
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;

  selectedElement: SelectedElement | null;
  setSelectedElement: (el: SelectedElement | null) => void;

  // Project Actions
  saveProject: () => void;
  createNewProject: (name?: string, customerName?: string) => void;
  openProject: (id: string) => void;
  loadProject: (id: string) => void;
  duplicateProject: (id: string) => void;
  deleteProject: (id: string) => void;
  deleteProjectFromStorage: (id: string) => void;
  allSavedProjects: Project[];
  savedProjects: Project[];
  updateProjectMeta: (updates: Partial<Pick<Project, 'name' | 'customerName' | 'description'>>) => void;
  updateProjectDetails: (updates: Partial<Project>) => void;

  // Cabinet Actions
  updateActiveCabinet: (updates: Partial<Cabinet>) => void;
  addCabinet: (presetCabinet?: Cabinet) => void;
  duplicateCabinet: (id: string) => void;
  deleteCabinet: (id: string) => void;
  clearActiveCabinet: () => void;
  clearWorkspace: () => void;

  // Component Actions on Active Cabinet
  addPartition: (type: 'vertical' | 'horizontal', targetOpeningId?: string) => void;
  updatePartition: (id: string, updates: Partial<Partition>) => void;
  deletePartition: (id: string) => void;

  addShelfGroup: (targetOpeningId?: string) => void;
  updateShelfGroup: (id: string, updates: Partial<ShelfGroup>) => void;
  deleteShelfGroup: (id: string) => void;

  addDrawerStack: (targetOpeningId?: string) => void;
  updateDrawerStack: (id: string, updates: Partial<DrawerStack>) => void;
  deleteDrawerStack: (id: string) => void;

  addDoorConfig: (targetOpeningId?: string) => void;
  updateDoorConfig: (id: string, updates: Partial<DoorConfig>) => void;
  deleteDoorConfig: (id: string) => void;

  deleteSelectedElement: () => void;

  // Settings
  updateCostSettings: (updates: Partial<CostSettings>) => void;
  updateOptimizationSettings: (updates: Partial<OptimizationSettings>) => void;

  // Derived Parametric Data
  activeCabinetCutList: CutPart[];
  projectCombinedCutList: CutPart[];
  projectHardware: HardwareItem[];
  projectHardwareBOM: HardwareItem[];
  sheetOptimizationResults: SheetResult[];
  costBreakdown: CostBreakdown;
  validationIssues: ValidationIssue[];
  designValidation: ValidationIssue[];

  // Undo / Redo
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from local storage
  const [project, setProjectInternal] = useState<Project>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CURRENT);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load project from localStorage', e);
    }
    return createInitialProject();
  });

  const [activeCabinetId, setActiveCabinetId] = useState<string>(() => {
    return project.cabinets[0]?.id || 'cab-demo-tall-01';
  });

  const [activeView, setActiveView] = useState<ActiveView>('front');
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>({
    type: 'cabinet',
    id: activeCabinetId,
  });

  // History stack for Undo / Redo
  const [history, setHistory] = useState<Project[]>([project]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const [allSavedProjects, setAllSavedProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROJECTS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load saved projects', e);
    }
    return [project];
  });

  // Persist current project changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(project));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [project]);

  // Push to history
  const setProjectWithHistory = useCallback(
    (newProject: Project | ((prev: Project) => Project)) => {
      setProjectInternal((prev) => {
        const next = typeof newProject === 'function' ? newProject(prev) : newProject;
        // Trim redo states
        setHistory((currHist) => {
          const newHist = currHist.slice(0, historyIndex + 1);
          newHist.push(next);
          // Limit history to 30 steps
          if (newHist.length > 30) newHist.shift();
          return newHist;
        });
        setHistoryIndex((prevIdx) => Math.min(prevIdx + 1, 29));
        return next;
      });
    },
    [historyIndex]
  );

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const undo = useCallback(() => {
    if (canUndo) {
      const prevIdx = historyIndex - 1;
      const targetProject = history[prevIdx];
      setHistoryIndex(prevIdx);
      setProjectInternal(targetProject);
    }
  }, [canUndo, historyIndex, history]);

  const redo = useCallback(() => {
    if (canRedo) {
      const nextIdx = historyIndex + 1;
      const targetProject = history[nextIdx];
      setHistoryIndex(nextIdx);
      setProjectInternal(targetProject);
    }
  }, [canRedo, historyIndex, history]);

  // Active cabinet
  const activeCabinet = useMemo(() => {
    const found = project.cabinets.find((c) => c.id === activeCabinetId);
    return found || project.cabinets[0] || createDefaultDemonstrationCabinet();
  }, [project.cabinets, activeCabinetId]);

  // Ensure valid active cabinet
  useEffect(() => {
    if (!project.cabinets.some((c) => c.id === activeCabinetId)) {
      if (project.cabinets.length > 0) {
        setActiveCabinetId(project.cabinets[0].id);
      }
    }
  }, [project.cabinets, activeCabinetId]);

  // Project CRUD
  const saveProject = useCallback(() => {
    const updated = {
      ...project,
      updatedAt: new Date().toISOString(),
    };
    setProjectInternal(updated);
    setAllSavedProjects((prev) => {
      const filtered = prev.filter((p) => p.id !== updated.id);
      const list = [updated, ...filtered];
      localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(list));
      return list;
    });
  }, [project]);

  const createNewProject = useCallback((name = 'New Cabinet Project', customerName = 'Walk-in Client') => {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name,
      customerName,
      description: 'Parametric cabinet manufacturing cutting list and cost estimation.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      cabinets: [createDefaultDemonstrationCabinet()],
      costSettings: DEFAULT_COST_SETTINGS,
      optimizationSettings: DEFAULT_OPTIMIZATION_SETTINGS,
    };
    setProjectWithHistory(newProj);
    setActiveCabinetId(newProj.cabinets[0].id);
    setSelectedElement({ type: 'cabinet', id: newProj.cabinets[0].id });
  }, [setProjectWithHistory]);

  const openProject = useCallback((id: string) => {
    const found = allSavedProjects.find((p) => p.id === id);
    if (found) {
      setProjectWithHistory(found);
      setActiveCabinetId(found.cabinets[0]?.id || '');
      setSelectedElement(null);
    }
  }, [allSavedProjects, setProjectWithHistory]);

  const duplicateProject = useCallback((id: string) => {
    const found = allSavedProjects.find((p) => p.id === id) || project;
    const duplicated: Project = {
      ...found,
      id: `proj-${Date.now()}`,
      name: `${found.name} (Copy)`,
      updatedAt: new Date().toISOString(),
    };
    setAllSavedProjects((prev) => {
      const list = [duplicated, ...prev];
      localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(list));
      return list;
    });
    setProjectWithHistory(duplicated);
  }, [allSavedProjects, project, setProjectWithHistory]);

  const deleteProject = useCallback((id: string) => {
    setAllSavedProjects((prev) => {
      const list = prev.filter((p) => p.id !== id);
      localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(list));
      return list;
    });
    if (project.id === id) {
      createNewProject('New Cabinet Project');
    }
  }, [project.id, createNewProject]);

  const updateProjectMeta = useCallback(
    (updates: Partial<Pick<Project, 'name' | 'customerName' | 'description'>>) => {
      setProjectWithHistory((prev) => ({
        ...prev,
        ...updates,
        updatedAt: new Date().toISOString(),
      }));
    },
    [setProjectWithHistory]
  );

  const updateProjectDetails = useCallback(
    (updates: Partial<Project>) => {
      setProjectWithHistory((prev) => ({
        ...prev,
        ...updates,
        updatedAt: new Date().toISOString(),
      }));
    },
    [setProjectWithHistory]
  );

  // Cabinet Actions
  const updateActiveCabinet = useCallback(
    (updates: Partial<Cabinet>) => {
      setProjectWithHistory((prev) => ({
        ...prev,
        cabinets: prev.cabinets.map((cab) =>
          cab.id === activeCabinetId ? { ...cab, ...updates } : cab
        ),
      }));
    },
    [activeCabinetId, setProjectWithHistory]
  );

  const addCabinet = useCallback(
    (preset?: Cabinet) => {
      const newCab = preset || {
        ...createDefaultDemonstrationCabinet(),
        id: `cab-${Date.now()}`,
        name: `Cabinet ${project.cabinets.length + 1}`,
      };
      setProjectWithHistory((prev) => ({
        ...prev,
        cabinets: [...prev.cabinets, newCab],
      }));
      setActiveCabinetId(newCab.id);
      setSelectedElement({ type: 'cabinet', id: newCab.id });
    },
    [project.cabinets.length, setProjectWithHistory]
  );

  const duplicateCabinet = useCallback(
    (id: string) => {
      const target = project.cabinets.find((c) => c.id === id);
      if (!target) return;
      const copy: Cabinet = {
        ...target,
        id: `cab-${Date.now()}`,
        name: `${target.name} (Copy)`,
      };
      setProjectWithHistory((prev) => ({
        ...prev,
        cabinets: [...prev.cabinets, copy],
      }));
      setActiveCabinetId(copy.id);
    },
    [project.cabinets, setProjectWithHistory]
  );

  const deleteCabinet = useCallback(
    (id: string) => {
      if (project.cabinets.length <= 1) return; // Keep at least one
      setProjectWithHistory((prev) => {
        const nextCabs = prev.cabinets.filter((c) => c.id !== id);
        return {
          ...prev,
          cabinets: nextCabs,
        };
      });
    },
    [project.cabinets.length, setProjectWithHistory]
  );

  const clearActiveCabinet = useCallback(() => {
    updateActiveCabinet({
      partitions: [],
      shelves: [],
      drawers: [],
      doors: [],
    });
    setSelectedElement({ type: 'cabinet', id: activeCabinetId });
  }, [activeCabinetId, updateActiveCabinet]);

  const clearWorkspace = useCallback(() => {
    const blankCab: Cabinet = {
      id: `cab-${Date.now()}`,
      name: 'Cabinet 1',
      width: 800,
      height: 900,
      depth: 600,
      boardThickness: project.defaultBoardThickness || 18,
      backThickness: project.defaultBackThickness || 6,
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
    };

    setProjectWithHistory((prev) => ({
      ...prev,
      cabinets: [blankCab],
      updatedAt: new Date().toISOString(),
    }));
    setActiveCabinetId(blankCab.id);
    setSelectedElement({ type: 'cabinet', id: blankCab.id });
  }, [project.defaultBoardThickness, project.defaultBackThickness, setProjectWithHistory]);

  // Component Actions on Active Cabinet
  const addPartition = useCallback(
    (type: 'vertical' | 'horizontal', targetOpeningId?: string) => {
      const newPartition: Partition = {
        id: `part-${Date.now()}`,
        type,
        parentId: targetOpeningId,
        positionType: 'equal',
        positionValue: 50,
        thickness: activeCabinet.boardThickness || 18,
      };

      updateActiveCabinet({
        partitions: [...activeCabinet.partitions, newPartition],
      });
      setSelectedElement({ type: 'partition', id: newPartition.id, data: newPartition });
    },
    [activeCabinet, updateActiveCabinet]
  );

  const updatePartition = useCallback(
    (id: string, updates: Partial<Partition>) => {
      updateActiveCabinet({
        partitions: activeCabinet.partitions.map((p) =>
          p.id === id ? { ...p, ...updates } : p
        ),
      });
    },
    [activeCabinet.partitions, updateActiveCabinet]
  );

  const deletePartition = useCallback(
    (id: string) => {
      updateActiveCabinet({
        partitions: activeCabinet.partitions.filter((p) => p.id !== id),
      });
      setSelectedElement(null);
    },
    [activeCabinet.partitions, updateActiveCabinet]
  );

  const addShelfGroup = useCallback(
    (targetOpeningId?: string) => {
      const openings = calculateCabinetOpenings(activeCabinet);
      const targetId = targetOpeningId || openings[0]?.id || 'opening-root';

      const newShelfGroup: ShelfGroup = {
        id: `shelf-${Date.now()}`,
        openingId: targetId,
        shelfType: 'adjustable',
        count: 2,
        thickness: activeCabinet.boardThickness || 18,
        setback: 12,
        edgeBanding: 'front',
      };

      updateActiveCabinet({
        shelves: [...activeCabinet.shelves, newShelfGroup],
      });
      setSelectedElement({ type: 'shelf', id: newShelfGroup.id, data: newShelfGroup });
    },
    [activeCabinet, updateActiveCabinet]
  );

  const updateShelfGroup = useCallback(
    (id: string, updates: Partial<ShelfGroup>) => {
      updateActiveCabinet({
        shelves: activeCabinet.shelves.map((s) =>
          s.id === id ? { ...s, ...updates } : s
        ),
      });
    },
    [activeCabinet.shelves, updateActiveCabinet]
  );

  const deleteShelfGroup = useCallback(
    (id: string) => {
      updateActiveCabinet({
        shelves: activeCabinet.shelves.filter((s) => s.id !== id),
      });
      setSelectedElement(null);
    },
    [activeCabinet.shelves, updateActiveCabinet]
  );

  const addDrawerStack = useCallback(
    (targetOpeningId?: string) => {
      const openings = calculateCabinetOpenings(activeCabinet);
      const targetId = targetOpeningId || openings[0]?.id || 'opening-root';

      const newDrawer: DrawerStack = {
        id: `drawer-${Date.now()}`,
        openingId: targetId,
        count: 3,
        runnerType: 'undermount-soft-close',
        sideClearance: 21,
        runnerLength: 500,
        bottomThickness: 6,
        boxMaterial: 'Birch Plywood (16mm)',
        frontType: 'overlay',
        frontGap: 3,
        edgeBanding: 'all',
      };

      updateActiveCabinet({
        drawers: [...activeCabinet.drawers, newDrawer],
      });
      setSelectedElement({ type: 'drawer', id: newDrawer.id, data: newDrawer });
    },
    [activeCabinet, updateActiveCabinet]
  );

  const updateDrawerStack = useCallback(
    (id: string, updates: Partial<DrawerStack>) => {
      updateActiveCabinet({
        drawers: activeCabinet.drawers.map((d) =>
          d.id === id ? { ...d, ...updates } : d
        ),
      });
    },
    [activeCabinet.drawers, updateActiveCabinet]
  );

  const deleteDrawerStack = useCallback(
    (id: string) => {
      updateActiveCabinet({
        drawers: activeCabinet.drawers.filter((d) => d.id !== id),
      });
      setSelectedElement(null);
    },
    [activeCabinet.drawers, updateActiveCabinet]
  );

  const addDoorConfig = useCallback(
    (targetOpeningId?: string) => {
      const openings = calculateCabinetOpenings(activeCabinet);
      const targetId = targetOpeningId || openings[0]?.id || 'opening-root';

      const newDoor: DoorConfig = {
        id: `door-${Date.now()}`,
        openingId: targetId,
        doorType: 'single-left',
        overlayType: 'full-overlay',
        doorGap: 2,
        centreGap: 3,
        overlayAmount: 15,
        material: activeCabinet.material,
        edgeBanding: 'all',
        handleType: 'bar-pull',
      };

      updateActiveCabinet({
        doors: [...activeCabinet.doors, newDoor],
      });
      setSelectedElement({ type: 'door', id: newDoor.id, data: newDoor });
    },
    [activeCabinet, updateActiveCabinet]
  );

  const updateDoorConfig = useCallback(
    (id: string, updates: Partial<DoorConfig>) => {
      updateActiveCabinet({
        doors: activeCabinet.doors.map((d) =>
          d.id === id ? { ...d, ...updates } : d
        ),
      });
    },
    [activeCabinet.doors, updateActiveCabinet]
  );

  const deleteDoorConfig = useCallback(
    (id: string) => {
      updateActiveCabinet({
        doors: activeCabinet.doors.filter((d) => d.id !== id),
      });
      setSelectedElement(null);
    },
    [activeCabinet.doors, updateActiveCabinet]
  );

  const deleteSelectedElement = useCallback(() => {
    if (!selectedElement) return;
    if (selectedElement.type === 'partition') {
      deletePartition(selectedElement.id);
    } else if (selectedElement.type === 'shelf') {
      deleteShelfGroup(selectedElement.id);
    } else if (selectedElement.type === 'drawer') {
      deleteDrawerStack(selectedElement.id);
    } else if (selectedElement.type === 'door') {
      deleteDoorConfig(selectedElement.id);
    }
  }, [selectedElement, deletePartition, deleteShelfGroup, deleteDrawerStack, deleteDoorConfig]);

  const updateCostSettings = useCallback(
    (updates: Partial<CostSettings>) => {
      setProjectWithHistory((prev) => ({
        ...prev,
        costSettings: { ...prev.costSettings, ...updates },
      }));
    },
    [setProjectWithHistory]
  );

  const updateOptimizationSettings = useCallback(
    (updates: Partial<OptimizationSettings>) => {
      setProjectWithHistory((prev) => ({
        ...prev,
        optimizationSettings: { ...prev.optimizationSettings, ...updates },
      }));
    },
    [setProjectWithHistory]
  );

  // DERIVED DATA: Single source of truth recalculations
  const activeCabinetCutList = useMemo(() => {
    return generateCabinetCutList(activeCabinet);
  }, [activeCabinet]);

  const projectAllParts = useMemo(() => {
    const all: CutPart[] = [];
    for (const cab of project.cabinets) {
      all.push(...generateCabinetCutList(cab));
    }
    return all;
  }, [project.cabinets]);

  const projectCombinedCutList = useMemo(() => {
    return aggregateCuttingList(projectAllParts);
  }, [projectAllParts]);

  const projectHardware = useMemo(() => {
    return calculateProjectHardware(project.cabinets, project.costSettings);
  }, [project.cabinets, project.costSettings]);

  const sheetOptimizationResults = useMemo(() => {
    return optimizeSheetCuts(projectAllParts, project.optimizationSettings);
  }, [projectAllParts, project.optimizationSettings]);

  const costBreakdown = useMemo(() => {
    return calculateProjectCosts(
      project.cabinets,
      projectAllParts,
      sheetOptimizationResults,
      project.costSettings
    );
  }, [project.cabinets, projectAllParts, sheetOptimizationResults, project.costSettings]);

  const validationIssues = useMemo(() => {
    return validateCabinet(
      activeCabinet,
      activeCabinetCutList,
      project.optimizationSettings
    );
  }, [activeCabinet, activeCabinetCutList, project.optimizationSettings]);

  return (
    <ProjectContext.Provider
      value={{
        project,
        setProject: setProjectWithHistory,
        activeCabinetId,
        setActiveCabinetId,
        activeCabinet,
        activeView,
        setActiveView,
        selectedElement,
        setSelectedElement,
        saveProject,
        createNewProject,
        openProject,
        loadProject: openProject,
        duplicateProject,
        deleteProject,
        deleteProjectFromStorage: deleteProject,
        allSavedProjects,
        savedProjects: allSavedProjects,
        updateProjectMeta,
        updateProjectDetails,
        updateActiveCabinet,
        addCabinet,
        duplicateCabinet,
        deleteCabinet,
        clearActiveCabinet,
        clearWorkspace,
        addPartition,
        updatePartition,
        deletePartition,
        addShelfGroup,
        updateShelfGroup,
        deleteShelfGroup,
        addDrawerStack,
        updateDrawerStack,
        deleteDrawerStack,
        addDoorConfig,
        updateDoorConfig,
        deleteDoorConfig,
        deleteSelectedElement,
        updateCostSettings,
        updateOptimizationSettings,
        activeCabinetCutList,
        projectCombinedCutList,
        projectHardware,
        projectHardwareBOM: projectHardware,
        sheetOptimizationResults,
        costBreakdown,
        validationIssues,
        designValidation: validationIssues,
        canUndo,
        canRedo,
        undo,
        redo,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
