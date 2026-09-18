import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useProject } from '../context/ProjectContext';
import { calculateCabinetOpenings } from '../engine/parametricEngine';
import { Box, Eye, RotateCw } from 'lucide-react';

export const ThreeDView: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { activeCabinet } = useProject();

  const [doorOpenPercent, setDoorOpenPercent] = useState<number>(30); // 0 to 100
  const [wireframe, setWireframe] = useState<boolean>(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);

    const camera = new THREE.PerspectiveCamera(45, width / height, 10, 10000);
    // Position camera dynamically based on cabinet size
    const maxDim = Math.max(activeCabinet.width, activeCabinet.height, activeCabinet.depth);
    camera.position.set(maxDim * 1.2, maxDim * 0.9, maxDim * 2.2);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.85);
    dirLight1.position.set(maxDim * 1.5, maxDim * 2, maxDim * 1.5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x94a3b8, 0.4);
    dirLight2.position.set(-maxDim * 1.5, maxDim, -maxDim);
    scene.add(dirLight2);

    // Grid helper on ground plane
    const grid = new THREE.GridHelper(maxDim * 3, 20, 0x334155, 0x1e293b);
    grid.position.y = -activeCabinet.height / 2;
    scene.add(grid);

    // 4. Cabinet Model Group
    const cabinetGroup = new THREE.Group();
    scene.add(cabinetGroup);

    // Materials
    const carcassMaterial = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.4,
      metalness: 0.05,
      wireframe,
    });
    const woodInteriorMaterial = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.5,
      wireframe,
    });
    const doorMaterial = new THREE.MeshStandardMaterial({
      color: 0x059669,
      roughness: 0.3,
      metalness: 0.1,
      wireframe,
    });
    const drawerMaterial = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.35,
      wireframe,
    });
    const handleMaterial = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.8,
      roughness: 0.2,
    });

    const W = activeCabinet.width;
    const H = activeCabinet.height;
    const D = activeCabinet.depth;
    const T = activeCabinet.boardThickness;
    const toeKickH = activeCabinet.hasToeKick ? activeCabinet.toeKickHeight : 0;
    const carcassH = H - toeKickH;

    // Center offset
    const offX = -W / 2;
    const offY = -H / 2 + toeKickH;
    const offZ = -D / 2;

    const createBox = (w: number, h: number, d: number, mat: THREE.Material, x: number, y: number, z: number) => {
      const geo = new THREE.BoxGeometry(w, h, d);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x + w / 2, y + h / 2, z + d / 2);
      return mesh;
    };

    // A. Left Gable
    cabinetGroup.add(createBox(T, carcassH, D, carcassMaterial, offX, offY, offZ));
    // B. Right Gable
    cabinetGroup.add(createBox(T, carcassH, D, carcassMaterial, offX + W - T, offY, offZ));
    // C. Top Panel
    cabinetGroup.add(createBox(W - 2 * T, T, D, carcassMaterial, offX + T, offY + carcassH - T, offZ));
    // D. Bottom Panel
    cabinetGroup.add(createBox(W - 2 * T, T, D, carcassMaterial, offX + T, offY, offZ));
    // E. Back Panel
    cabinetGroup.add(createBox(W - 2 * T, carcassH - 2 * T, 6, carcassMaterial, offX + T, offY + T, offZ + 16));

    // Toe Kick
    if (activeCabinet.hasToeKick && toeKickH > 0) {
      cabinetGroup.add(
        createBox(
          W - activeCabinet.toeKickSetback * 2,
          toeKickH,
          T,
          carcassMaterial,
          offX + activeCabinet.toeKickSetback,
          offY - toeKickH,
          offZ + D - activeCabinet.toeKickSetback - T
        )
      );
    }

    const openings = calculateCabinetOpenings(activeCabinet);

    // Partitions
    for (const p of activeCabinet.partitions) {
      const pT = p.thickness || T;
      if (p.type === 'vertical') {
        let posX = (W - 2 * T - pT) / 2;
        if (p.positionType === 'percentage') posX = (W - 2 * T - pT) * (p.positionValue / 100);
        else if (p.positionType === 'from-left') posX = p.positionValue;
        cabinetGroup.add(createBox(pT, carcassH - 2 * T, D - 20, woodInteriorMaterial, offX + T + posX, offY + T, offZ + 20));
      } else {
        let posY = (carcassH - 2 * T - pT) / 2;
        if (p.positionType === 'percentage') posY = (carcassH - 2 * T - pT) * (p.positionValue / 100);
        else if (p.positionType === 'from-bottom') posY = p.positionValue;
        cabinetGroup.add(createBox(W - 2 * T, pT, D - 20, woodInteriorMaterial, offX + T, offY + T + posY, offZ + 20));
      }
    }

    // Shelves
    for (const sh of activeCabinet.shelves) {
      const op = openings.find((o) => o.id === sh.openingId) || openings[0];
      if (!op) continue;
      const spacing = op.height / (sh.count + 1);
      for (let i = 0; i < sh.count; i++) {
        const yPos = offY + T + op.y + spacing * (i + 1);
        cabinetGroup.add(
          createBox(op.width - 2, sh.thickness || T, op.depth - (sh.setback || 12), woodInteriorMaterial, offX + T + op.x + 1, yPos, offZ + 20)
        );
      }
    }

    // Drawers with slide-out effect
    for (const dr of activeCabinet.drawers) {
      const op = openings.find((o) => o.id === dr.openingId) || openings[0];
      if (!op) continue;
      const N = dr.count || 3;
      const gap = dr.frontGap || 3;
      const frontH = (op.height - (N - 1) * gap) / N;
      const slideOutDist = (doorOpenPercent / 100) * 180; // slides forward up to 180mm

      for (let i = 0; i < N; i++) {
        const yPos = offY + T + op.y + (N - 1 - i) * (frontH + gap);
        // Front panel
        cabinetGroup.add(
          createBox(op.width - gap * 2, frontH, T, drawerMaterial, offX + T + op.x + gap, yPos, offZ + D + slideOutDist)
        );
        // Handle
        cabinetGroup.add(
          createBox(80, 10, 12, handleMaterial, offX + T + op.x + op.width / 2 - 40, yPos + frontH / 2 - 5, offZ + D + T + slideOutDist)
        );
      }
    }

    // Doors with hinge rotation
    for (const door of activeCabinet.doors) {
      const op = openings.find((o) => o.id === door.openingId) || openings[0];
      if (!op) continue;
      const gap = door.doorGap || 2;
      const doorH = op.height - gap * 2;
      const doorY = offY + T + op.y + gap;
      const openAngle = (doorOpenPercent / 100) * (Math.PI / 2.2);

      if (door.doorType === 'double') {
        const leafW = (op.width - gap * 2 - (door.centreGap || 3)) / 2;

        // Left leaf hinge pivot
        const leftPivot = new THREE.Group();
        leftPivot.position.set(offX + T + op.x + gap, doorY, offZ + D);
        const leftMesh = createBox(leafW, doorH, T, doorMaterial, 0, 0, 0);
        leftPivot.add(leftMesh);
        leftPivot.rotation.y = -openAngle;
        cabinetGroup.add(leftPivot);

        // Right leaf hinge pivot
        const rightPivot = new THREE.Group();
        rightPivot.position.set(offX + T + op.x + gap + leafW * 2, doorY, offZ + D);
        const rightMesh = createBox(leafW, doorH, T, doorMaterial, -leafW, 0, 0);
        rightPivot.add(rightMesh);
        rightPivot.rotation.y = openAngle;
        cabinetGroup.add(rightPivot);
      } else {
        const doorW = op.width - gap * 2;
        const isRight = door.doorType === 'single-right';
        const pivot = new THREE.Group();
        if (isRight) {
          pivot.position.set(offX + T + op.x + gap + doorW, doorY, offZ + D);
          const mesh = createBox(doorW, doorH, T, doorMaterial, -doorW, 0, 0);
          pivot.add(mesh);
          pivot.rotation.y = openAngle;
        } else {
          pivot.position.set(offX + T + op.x + gap, doorY, offZ + D);
          const mesh = createBox(doorW, doorH, T, doorMaterial, 0, 0, 0);
          pivot.add(mesh);
          pivot.rotation.y = -openAngle;
        }
        cabinetGroup.add(pivot);
      }
    }

    camera.lookAt(0, 0, 0);

    // Simple Orbit Controller with Mouse Drag
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let rotation = { x: 0.2, y: -0.4 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouse.x;
      const deltaY = e.clientY - prevMouse.y;
      prevMouse = { x: e.clientX, y: e.clientY };

      rotation.y += deltaX * 0.008;
      rotation.x = Math.max(-1.2, Math.min(1.2, rotation.x + deltaY * 0.008));
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.multiplyScalar(1 + e.deltaY * 0.001);
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Rotate group based on mouse
      cabinetGroup.rotation.y = rotation.y;
      cabinetGroup.rotation.x = rotation.x;

      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [activeCabinet, doorOpenPercent, wireframe]);

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden select-none">
      {/* 3D Controls Bar */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-3 bg-slate-900/90 border border-slate-700/80 px-4 py-2 rounded-xl backdrop-blur shadow-xl">
        <div className="flex items-center gap-2">
          <label htmlFor="door-open-slider" className="text-xs font-medium text-slate-300">
            Open Doors / Drawers:
          </label>
          <input
            id="door-open-slider"
            type="range"
            min="0"
            max="100"
            value={doorOpenPercent}
            onChange={(e) => setDoorOpenPercent(Number(e.target.value))}
            className="w-28 accent-emerald-500 cursor-pointer"
          />
          <span className="text-xs font-mono text-emerald-400 w-8 text-right">
            {doorOpenPercent}%
          </span>
        </div>

        <div className="h-4 w-px bg-slate-700" />

        <button
          id="btn-toggle-wireframe"
          onClick={() => setWireframe((v) => !v)}
          className={`px-2.5 py-1 text-xs rounded-md border transition flex items-center gap-1.5 ${
            wireframe
              ? 'bg-sky-500/20 text-sky-300 border-sky-500/50'
              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
          }`}
        >
          <Box className="w-3.5 h-3.5" />
          {wireframe ? 'Wireframe ON' : 'Shaded'}
        </button>
      </div>

      <div className="absolute top-4 right-4 z-10 bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400 backdrop-blur shadow flex items-center gap-2">
        <RotateCw className="w-3.5 h-3.5 text-slate-400 animate-spin" />
        Click & Drag to Orbit &bull; Scroll to Zoom
      </div>

      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
};
