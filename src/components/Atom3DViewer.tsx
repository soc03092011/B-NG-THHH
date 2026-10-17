import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { ElementData, Isotope, CommonIon } from '../types/chemistry';
import { 
  Play, Pause, RotateCcw, Eye, Layers, Atom, Sparkles, 
  Plus, Minus, Info, ChevronDown, ChevronUp, ZoomIn, ZoomOut
} from 'lucide-react';

interface Atom3DViewerProps {
  element: ElementData;
  selectedIsotope: Isotope;
  selectedIon: CommonIon | null;
  onSelectIsotope: (iso: Isotope) => void;
  onSelectIon: (ion: CommonIon | null) => void;
}

export const Atom3DViewer: React.FC<Atom3DViewerProps> = ({
  element,
  selectedIsotope,
  selectedIon,
  onSelectIsotope,
  onSelectIon,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  
  // Viewer state
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1.0);
  const [viewMode, setViewMode] = useState<'bohr' | 'quantum'>('bohr');
  const [showProtons, setShowProtons] = useState<boolean>(true);
  const [showNeutrons, setShowNeutrons] = useState<boolean>(true);
  const [showElectrons, setShowElectrons] = useState<boolean>(true);
  const [showOrbits, setShowOrbits] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [isDockCollapsed, setIsDockCollapsed] = useState<boolean>(false);

  // Particle counts
  const protonsCount = element.number;
  const neutronsCount = selectedIsotope.neutrons;
  const electronsCount = selectedIon 
    ? selectedIon.electrons 
    : element.number;
  const netCharge = protonsCount - electronsCount;

  // Refs for Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animFrameIdRef = useRef<number>(0);
  const nucleusGroupRef = useRef<THREE.Group | null>(null);
  const shellsGroupRef = useRef<THREE.Group | null>(null);
  const quantumCloudRef = useRef<THREE.Points | null>(null);
  const electronObjectsRef = useRef<{ mesh: THREE.Mesh; orbitRadius: number; speed: number; angle: number; tiltX: number; tiltZ: number }[]>([]);
  const isInteractingRef = useRef<boolean>(false);
  const previousMousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Web Audio procedural click synthesizer
  const playHapticTone = (freq = 440) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {
      // AudioContext not allowed or muted
    }
  };

  // Setup Three.js scene once
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x050814); // Deep space / lab dark
    scene.fog = new THREE.FogExp2(0x050814, 0.015);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 8, 26);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;

    container.replaceChildren(renderer.domElement);

    // 4. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0x223344, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(15, 20, 20);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x00f0ff, 2.0);
    rimLight.position.set(-15, -10, -15);
    scene.add(rimLight);

    const warmLight = new THREE.PointLight(0xff6622, 1.8, 30);
    warmLight.position.set(0, 0, 0); // Nucleus internal glow
    scene.add(warmLight);

    // Groups
    const nucleusGroup = new THREE.Group();
    scene.add(nucleusGroup);
    nucleusGroupRef.current = nucleusGroup;

    const shellsGroup = new THREE.Group();
    scene.add(shellsGroup);
    shellsGroupRef.current = shellsGroup;

    // Subtle space grid platform for depth perception
    const gridHelper = new THREE.GridHelper(30, 30, 0x1e293b, 0x0f172a);
    gridHelper.position.y = -8;
    scene.add(gridHelper);

    // Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (isPlaying) {
        // Slow rotation of nucleus
        if (nucleusGroupRef.current) {
          nucleusGroupRef.current.rotation.y += 0.4 * delta * speed;
          nucleusGroupRef.current.rotation.x += 0.2 * delta * speed;
        }

        // Orbit electrons
        electronObjectsRef.current.forEach((item) => {
          item.angle += item.speed * delta * speed;
          const x = Math.cos(item.angle) * item.orbitRadius;
          const z = Math.sin(item.angle) * item.orbitRadius;
          
          // Apply tilt
          const tiltedX = x * Math.cos(item.tiltZ);
          const tiltedY = x * Math.sin(item.tiltZ) + z * Math.sin(item.tiltX);
          const tiltedZ = z * Math.cos(item.tiltX);

          item.mesh.position.set(tiltedX, tiltedY, tiltedZ);
        });

        // Rotate quantum cloud
        if (quantumCloudRef.current) {
          quantumCloudRef.current.rotation.y += 0.25 * delta * speed;
          quantumCloudRef.current.rotation.z += 0.15 * delta * speed;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Interactive Drag to Rotate & Wheel to Zoom
    const dom = renderer.domElement;
    const onMouseDown = (e: MouseEvent) => {
      isInteractingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isInteractingRef.current || !cameraRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };

      const cam = cameraRef.current;
      // Orbit around center
      const rotY = deltaX * 0.006;
      const rotX = deltaY * 0.006;

      const currentDistance = cam.position.length();
      const currentPos = cam.position.clone();

      // Horizontal orbit
      currentPos.applyAxisAngle(new THREE.Vector3(0, 1, 0), -rotY);
      // Vertical orbit
      const right = new THREE.Vector3().crossVectors(cam.up, currentPos).normalize();
      currentPos.applyAxisAngle(right, rotX);

      // Clamp vertical angle to avoid flip
      if (Math.abs(currentPos.y) < currentDistance * 0.98) {
        cam.position.copy(currentPos);
      }
      cam.lookAt(0, 0, 0);
    };

    const onMouseUp = () => {
      isInteractingRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!cameraRef.current) return;
      const cam = cameraRef.current;
      const zoomFactor = 1 + e.deltaY * 0.0012;
      const newPos = cam.position.clone().multiplyScalar(zoomFactor);
      if (newPos.length() >= 6 && newPos.length() <= 80) {
        cam.position.copy(newPos);
      }
    };

    // Touch support for mobile
    let touchStartDist = 0;
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isInteractingRef.current = true;
        previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        touchStartDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && isInteractingRef.current && cameraRef.current) {
        const deltaX = e.touches[0].clientX - previousMousePositionRef.current.x;
        const deltaY = e.touches[0].clientY - previousMousePositionRef.current.y;
        previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };

        const cam = cameraRef.current;
        cam.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), -deltaX * 0.008);
        cam.lookAt(0, 0, 0);
      } else if (e.touches.length === 2 && cameraRef.current) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const factor = touchStartDist / (dist || 1);
        touchStartDist = dist;
        const newPos = cameraRef.current.position.clone().multiplyScalar(factor);
        if (newPos.length() >= 6 && newPos.length() <= 80) {
          cameraRef.current.position.copy(newPos);
        }
      }
    };

    const onTouchEnd = () => {
      isInteractingRef.current = false;
    };

    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });
    dom.addEventListener('touchstart', onTouchStart);
    dom.addEventListener('touchmove', onTouchMove);
    dom.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('wheel', onWheel);
      dom.removeEventListener('touchstart', onTouchStart);
      dom.removeEventListener('touchmove', onTouchMove);
      dom.removeEventListener('touchend', onTouchEnd);
      cancelAnimationFrame(animFrameIdRef.current);
      renderer.dispose();
    };
  }, []);

  // Rebuild Nucleus and Electron Shells whenever Element, Isotope, or Ion changes
  useEffect(() => {
    if (!nucleusGroupRef.current || !shellsGroupRef.current || !sceneRef.current) return;

    const nucleusGroup = nucleusGroupRef.current;
    const shellsGroup = shellsGroupRef.current;

    // Clean up old children
    while (nucleusGroup.children.length > 0) {
      const obj = nucleusGroup.children[0];
      nucleusGroup.remove(obj);
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
        else obj.material.dispose();
      }
    }

    while (shellsGroup.children.length > 0) {
      const obj = shellsGroup.children[0];
      shellsGroup.remove(obj);
      if (obj instanceof THREE.Mesh || obj instanceof THREE.Line) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
        else obj.material.dispose();
      }
    }

    if (quantumCloudRef.current) {
      sceneRef.current.remove(quantumCloudRef.current);
      quantumCloudRef.current.geometry.dispose();
      if (Array.isArray(quantumCloudRef.current.material)) {
        quantumCloudRef.current.material.forEach((m) => m.dispose());
      } else {
        quantumCloudRef.current.material.dispose();
      }
      quantumCloudRef.current = null;
    }

    electronObjectsRef.current = [];

    // --- 1. BUILD NUCLEUS (Protons + Neutrons packed into sphere) ---
    const protonGeo = new THREE.SphereGeometry(0.28, 16, 16);
    const neutronGeo = new THREE.SphereGeometry(0.28, 16, 16);

    // Proton: glowing warm ruby red
    const protonMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.25,
      metalness: 0.2,
      emissive: 0x991b1b,
      emissiveIntensity: 0.35,
    });

    // Neutron: slate/neutral steel gray with subtle cyan edge
    const neutronMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.35,
      metalness: 0.5,
      emissive: 0x1e293b,
      emissiveIntensity: 0.2,
    });

    // Cap visual nucleons rendered to prevent WebGL frame drop for heavy elements (Uranium = 238 particles!)
    // For large elements, we render an outer shell + inner dense lattice up to max 90 representative spheres
    const maxNucleons = 80;
    const totalActualNucleons = protonsCount + neutronsCount;
    const scaleFactor = totalActualNucleons > maxNucleons ? maxNucleons / totalActualNucleons : 1.0;
    const renderProtons = Math.max(1, Math.round(protonsCount * scaleFactor));
    const renderNeutrons = Math.round(neutronsCount * scaleFactor);

    // Fibonacci sphere distribution for uniform packing
    const totalToRender = renderProtons + renderNeutrons;
    const goldenRatio = (1 + Math.sqrt(5)) / 2;

    const particlePositions: { isProton: boolean; pos: THREE.Vector3 }[] = [];
    let pLeft = renderProtons;
    let nLeft = renderNeutrons;

    // Pack in concentric layers
    for (let i = 0; i < totalToRender; i++) {
      const isProton = (i % 2 === 0 && pLeft > 0) || nLeft === 0;
      if (isProton && pLeft > 0) pLeft--;
      else if (!isProton && nLeft > 0) nLeft--;

      // Layered radius based on index
      const layer = Math.cbrt(i / totalToRender);
      const r = (0.4 + layer * 1.5) * Math.min(1.8, Math.pow(totalActualNucleons, 0.28));
      
      const theta = 2 * Math.PI * i / goldenRatio;
      const phi = Math.acos(1 - 2 * (i + 0.5) / totalToRender);

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      particlePositions.push({
        isProton,
        pos: new THREE.Vector3(x, y, z),
      });
    }

    particlePositions.forEach(({ isProton, pos }) => {
      if ((isProton && showProtons) || (!isProton && showNeutrons)) {
        const mesh = new THREE.Mesh(isProton ? protonGeo : neutronGeo, isProton ? protonMat : neutronMat);
        mesh.position.copy(pos);
        nucleusGroup.add(mesh);
      }
    });

    // --- 2. BUILD ELECTRON SHELLS & ORBITING ELECTRONS ---
    // Calculate electrons per shell based on actual element data
    // If ion has lost/gained electrons, adjust outer shell electrons
    let remainingElectronsToPlace = electronsCount;
    const shellElectrons: number[] = [];

    for (let s = 0; s < element.electronsPerShell.length; s++) {
      const normalCap = element.electronsPerShell[s];
      if (remainingElectronsToPlace <= 0) {
        shellElectrons.push(0);
      } else if (s === element.electronsPerShell.length - 1) {
        // Outer valence shell absorbs net ion charge
        shellElectrons.push(Math.max(0, remainingElectronsToPlace));
        remainingElectronsToPlace = 0;
      } else {
        const take = Math.min(normalCap, remainingElectronsToPlace);
        shellElectrons.push(take);
        remainingElectronsToPlace -= take;
      }
    }

    // Material for Electron
    const electronGeo = new THREE.SphereGeometry(0.2, 16, 16);
    const electronMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.9,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
    });

    const shellNames = ['K (n=1)', 'L (n=2)', 'M (n=3)', 'N (n=4)', 'O (n=5)', 'P (n=6)', 'Q (n=7)'];

    // Shell orbit radii
    shellElectrons.forEach((count, shellIdx) => {
      const orbitRadius = 3.6 + shellIdx * 2.2;

      // 2A. Orbit Ring (line)
      if (showOrbits && count > 0) {
        const circleGeo = new THREE.BufferGeometry();
        const segments = 64;
        const points: THREE.Vector3[] = [];
        for (let j = 0; j <= segments; j++) {
          const theta = (j / segments) * Math.PI * 2;
          points.push(new THREE.Vector3(Math.cos(theta) * orbitRadius, 0, Math.sin(theta) * orbitRadius));
        }
        circleGeo.setFromPoints(points);
        const circleMat = new THREE.LineBasicMaterial({
          color: 0x0284c7,
          transparent: true,
          opacity: 0.35,
        });
        const orbitLine = new THREE.Line(circleGeo, circleMat);

        // Slightly tilt each shell for astronomical 3D feel
        const tiltX = (shellIdx * 0.28) - 0.4;
        const tiltZ = (shellIdx * 0.35) - 0.5;
        orbitLine.rotation.x = tiltX;
        orbitLine.rotation.z = tiltZ;
        shellsGroup.add(orbitLine);
      }

      // 2B. Orbiting Electrons
      if (showElectrons) {
        for (let eIdx = 0; eIdx < count; eIdx++) {
          const electronMesh = new THREE.Mesh(electronGeo, electronMat);
          const baseAngle = (eIdx / count) * Math.PI * 2;
          const tiltX = (shellIdx * 0.28) - 0.4;
          const tiltZ = (shellIdx * 0.35) - 0.5;
          const orbitSpeed = 1.6 / Math.sqrt(shellIdx + 1); // Inner shells orbit faster (Keplerian)

          shellsGroup.add(electronMesh);

          electronObjectsRef.current.push({
            mesh: electronMesh,
            orbitRadius,
            speed: orbitSpeed,
            angle: baseAngle,
            tiltX,
            tiltZ,
          });
        }
      }
    });

    // --- 3. QUANTUM CLOUD / ORBITAL MODE (Mode 2) ---
    if (viewMode === 'quantum') {
      shellsGroup.visible = false;

      // Generate Quantum probability orbital cloud
      const particleCount = Math.min(3000, 400 + element.number * 45);
      const cloudGeo = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);

      for (let p = 0; p < particleCount; p++) {
        // Probability distribution for s and p orbitals
        // s: spherical Gaussian distribution; p: dumbbell shaped with node at center
        const isDumbbell = p % 2 === 0;
        let x = 0, y = 0, z = 0;
        const maxR = 1.8 + Math.min(7, element.period) * 1.6;

        if (isDumbbell) {
          // Dumbbell / p orbital: along one axis (x or y or z)
          const axis = p % 3;
          const length = (Math.random() + Math.random()) * maxR * 0.5;
          const sign = Math.random() > 0.5 ? 1 : -1;
          const spread = Math.pow(Math.random(), 2) * 1.5;

          if (axis === 0) {
            x = sign * length;
            y = (Math.random() - 0.5) * spread;
            z = (Math.random() - 0.5) * spread;
          } else if (axis === 1) {
            y = sign * length;
            x = (Math.random() - 0.5) * spread;
            z = (Math.random() - 0.5) * spread;
          } else {
            z = sign * length;
            x = (Math.random() - 0.5) * spread;
            y = (Math.random() - 0.5) * spread;
          }
        } else {
          // Spherical s orbital: Gaussian r
          const u = Math.random();
          const r = Math.sqrt(-2.0 * Math.log(u || 0.0001)) * (maxR * 0.35);
          const theta = Math.random() * 2 * Math.PI;
          const phi = Math.acos(2 * Math.random() - 1);
          x = r * Math.sin(phi) * Math.cos(theta);
          y = r * Math.sin(phi) * Math.sin(theta);
          z = r * Math.cos(phi);
        }

        positions[p * 3] = x;
        positions[p * 3 + 1] = y;
        positions[p * 3 + 2] = z;

        // Density colors: bright cyan inside fading to deep violet on outer rim
        const dist = Math.hypot(x, y, z);
        const norm = Math.min(1.0, dist / maxR);
        colors[p * 3] = THREE.MathUtils.lerp(0.2, 0.6, norm); // R
        colors[p * 3 + 1] = THREE.MathUtils.lerp(0.9, 0.2, norm); // G
        colors[p * 3 + 2] = THREE.MathUtils.lerp(1.0, 0.9, norm); // B
      }

      cloudGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      cloudGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const cloudMat = new THREE.PointsMaterial({
        size: 0.18,
        vertexColors: true,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending,
      });

      const points = new THREE.Points(cloudGeo, cloudMat);
      sceneRef.current.add(points);
      quantumCloudRef.current = points;
    } else {
      shellsGroup.visible = true;
    }
  }, [
    element, 
    selectedIsotope, 
    selectedIon, 
    viewMode, 
    showProtons, 
    showNeutrons, 
    showElectrons, 
    showOrbits
  ]);

  const handleResetCamera = () => {
    if (!cameraRef.current) return;
    cameraRef.current.position.set(0, 8, 26);
    cameraRef.current.lookAt(0, 0, 0);
    playHapticTone(520);
  };

  const handleZoom = (inwards: boolean) => {
    if (!cameraRef.current) return;
    const factor = inwards ? 0.85 : 1.18;
    const newPos = cameraRef.current.position.clone().multiplyScalar(factor);
    if (newPos.length() >= 6 && newPos.length() <= 80) {
      cameraRef.current.position.copy(newPos);
    }
    playHapticTone(600);
  };

  return (
    <div className="relative w-full h-[540px] md:h-[620px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col select-none">
      {/* 3D WebGL Canvas Container */}
      <div 
        ref={mountRef} 
        className="w-full h-full cursor-grab active:cursor-grabbing" 
      />

      {/* Top Left Spec HUD Badge */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
        <div className="flex items-center gap-2.5 bg-slate-900/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700/60 shadow-lg text-slate-100">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center font-bold text-cyan-300">
            {element.symbol}
          </div>
          <div>
            <div className="text-sm font-semibold flex items-center gap-1.5">
              <span>{element.nameVi}</span>
              <span className="text-xs text-slate-400 font-mono">({element.nameEn})</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
              <span>Z = {element.number}</span>
              <span>•</span>
              <span>A = {selectedIsotope.massNumber}</span>
              {selectedIon && (
                <span className="text-amber-400 font-medium font-sans">[{selectedIon.symbol}]</span>
              )}
            </div>
          </div>
        </div>

        {/* Live Subatomic Particle Counter */}
        <div className="bg-slate-900/80 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-800 text-xs font-mono flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
            <span className="text-slate-300">p⁺: <b className="text-rose-400 font-bold">{protonsCount}</b></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block"></span>
            <span className="text-slate-300">n⁰: <b className="text-slate-300 font-bold">{neutronsCount}</b></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block"></span>
            <span className="text-slate-300">e⁻: <b className="text-sky-300 font-bold">{electronsCount}</b></span>
          </div>
          <div className="pl-1 border-l border-slate-700 text-slate-400">
            Điện tích: <b className={netCharge > 0 ? 'text-amber-400' : netCharge < 0 ? 'text-emerald-400' : 'text-slate-300'}>
              {netCharge > 0 ? `+${netCharge}` : netCharge < 0 ? `${netCharge}` : '0'}
            </b>
          </div>
        </div>
      </div>

      {/* Top Right Quick View Tools */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-xl border border-slate-800">
        <button
          onClick={() => handleZoom(true)}
          title="Phóng to"
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleZoom(false)}
          title="Thu nhỏ"
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetCamera}
          title="Đặt lại góc nhìn mặc định"
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Scientific Model Disclaimer Banner */}
      <div className="absolute bottom-24 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-auto md:max-w-xl z-10 pointer-events-none text-center">
        <div className="inline-flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-800/80 text-[11px] text-slate-400 shadow-md">
          <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>
            {viewMode === 'bohr' 
              ? 'Mô hình Bohr: Minh họa giáo dục các lớp electron & hạt nhân. Electron thực tế là đám mây xác suất.'
              : 'Mô hình Lượng tử: Trực quan hóa mật độ xác suất của các orbital s, p theo cơ học lượng tử.'}
          </span>
        </div>
      </div>

      {/* Unified Ergonomic Collapsible Bottom Control Dock */}
      <div className={`absolute bottom-3 left-1/2 -translate-x-1/2 w-[95%] max-w-4xl z-20 transition-all duration-300 ${isDockCollapsed ? 'translate-y-[calc(100%-32px)]' : 'translate-y-0'}`}>
        {/* Collapse / Expand Toggle Tab */}
        <div className="flex justify-center mb-1">
          <button
            onClick={() => setIsDockCollapsed(!isDockCollapsed)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-t-lg bg-slate-900 border-t border-x border-slate-700/80 text-[11px] font-medium text-slate-300 hover:text-white transition shadow-lg"
          >
            {isDockCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
                <span>Mở thanh điều khiển 3D</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                <span>Thu gọn thanh điều khiển</span>
              </>
            )}
          </button>
        </div>

        {/* Main Dock Container */}
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          {/* Section 1: Mode Switch & Play/Pause */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center bg-slate-800/90 rounded-xl p-0.5 border border-slate-700">
              <button
                onClick={() => {
                  setViewMode('bohr');
                  playHapticTone(400);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition ${
                  viewMode === 'bohr' 
                    ? 'bg-cyan-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Atom className="w-3.5 h-3.5" />
                <span>Mô hình Bohr</span>
              </button>
              <button
                onClick={() => {
                  setViewMode('quantum');
                  playHapticTone(560);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition ${
                  viewMode === 'quantum' 
                    ? 'bg-purple-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Đám mây Lượng tử</span>
              </button>
            </div>

            <div className="flex items-center gap-1 bg-slate-800/80 rounded-xl px-2 py-1 border border-slate-700">
              <button
                onClick={() => {
                  setIsPlaying(!isPlaying);
                  playHapticTone(360);
                }}
                className="p-1 rounded text-slate-300 hover:text-white transition"
                title={isPlaying ? 'Tạm dừng chuyển động' : 'Tiếp tục quay'}
              >
                {isPlaying ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
              </button>
              <input
                type="range"
                min="0.2"
                max="2.5"
                step="0.1"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-16 h-1 accent-cyan-500 cursor-pointer bg-slate-700 rounded-lg"
                title={`Tốc độ quay: ${speed.toFixed(1)}x`}
              />
              <span className="text-[10px] text-slate-400 font-mono w-7 text-right">{speed.toFixed(1)}x</span>
            </div>
          </div>

          {/* Section 2: Isotope and Ion Selector */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-center overflow-x-auto pb-1 md:pb-0">
            {/* Isotope Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-[11px] whitespace-nowrap">Đồng vị:</span>
              <select
                value={selectedIsotope.massNumber}
                onChange={(e) => {
                  const num = parseInt(e.target.value, 10);
                  const found = element.isotopes.find((iso) => iso.massNumber === num);
                  if (found) {
                    onSelectIsotope(found);
                    playHapticTone(480);
                  }
                }}
                className="bg-slate-800 text-slate-200 border border-slate-700 text-xs rounded-lg px-2 py-1 outline-none focus:border-cyan-500 cursor-pointer"
              >
                {element.isotopes.map((iso) => (
                  <option key={iso.massNumber} value={iso.massNumber}>
                    {iso.symbol} (A={iso.massNumber}, N={iso.neutrons})
                  </option>
                ))}
              </select>
            </div>

            {/* Ion Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-[11px] whitespace-nowrap">Trạng thái:</span>
              <select
                value={selectedIon ? selectedIon.symbol : 'neutral'}
                onChange={(e) => {
                  if (e.target.value === 'neutral') {
                    onSelectIon(null);
                  } else {
                    const found = element.commonIons.find((ion) => ion.symbol === e.target.value);
                    if (found) onSelectIon(found);
                  }
                  playHapticTone(520);
                }}
                className="bg-slate-800 text-slate-200 border border-slate-700 text-xs rounded-lg px-2 py-1 outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="neutral">Nguyên tử trung hòa (e⁻={element.number})</option>
                {element.commonIons.map((ion) => (
                  <option key={ion.symbol} value={ion.symbol}>
                    {ion.symbol} ({ion.name}, e⁻={ion.electrons})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 3: Particle Visibility Toggles */}
          <div className="flex items-center gap-1.5 w-full md:w-auto justify-end">
            <button
              onClick={() => {
                setShowProtons(!showProtons);
                playHapticTone(300);
              }}
              title="Bật/Tắt Proton"
              className={`px-2 py-1 rounded-md text-[11px] font-mono border transition ${
                showProtons 
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/50' 
                  : 'bg-slate-800/60 text-slate-500 border-slate-700 line-through'
              }`}
            >
              p⁺
            </button>
            <button
              onClick={() => {
                setShowNeutrons(!showNeutrons);
                playHapticTone(300);
              }}
              title="Bật/Tắt Neutron"
              className={`px-2 py-1 rounded-md text-[11px] font-mono border transition ${
                showNeutrons 
                  ? 'bg-slate-600/30 text-slate-300 border-slate-500/50' 
                  : 'bg-slate-800/60 text-slate-500 border-slate-700 line-through'
              }`}
            >
              n⁰
            </button>
            <button
              onClick={() => {
                setShowElectrons(!showElectrons);
                playHapticTone(300);
              }}
              title="Bật/Tắt Electron"
              className={`px-2 py-1 rounded-md text-[11px] font-mono border transition ${
                showElectrons 
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/50' 
                  : 'bg-slate-800/60 text-slate-500 border-slate-700 line-through'
              }`}
            >
              e⁻
            </button>
            <button
              onClick={() => {
                setShowOrbits(!showOrbits);
                playHapticTone(300);
              }}
              title="Bật/Tắt Đường quỹ đạo electron"
              className={`px-2 py-1 rounded-md text-[11px] border transition ${
                showOrbits 
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50' 
                  : 'bg-slate-800/60 text-slate-500 border-slate-700 line-through'
              }`}
            >
              Quỹ đạo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
