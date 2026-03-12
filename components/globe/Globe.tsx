"use client";

import { Suspense, useCallback, useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import GlobeEarth from "./GlobeEarth";
import VesselLayer from "./VesselLayer";
import PortLayer from "./PortLayer";
import ChokepointLayer from "./ChokepointLayer";
import { useAppStore } from "@/store/useAppStore";
import { getVessels, getPorts, getChokepoints } from "@/lib/adapters/mock-adapter";
import { THEATERS, theaterCameraPos } from "@/lib/theaters";

const VESSELS = getVessels();
const PORTS = getPorts();
const CHOKEPOINTS = getChokepoints();

// Camera positioned to face the Indian Ocean / Middle East hemisphere:
// lat=10°N, lon=75°E — shows Hormuz, Red Sea, Malacca, Bay of Bengal, partial SCS
// Computed via latLonToVec3(10, 75, 2.55):
//   phi = 80°, theta = 255°
//   x = -2.55 * sin(80°) * cos(255°) ≈  0.65
//   y =  2.55 * cos(80°)             ≈  0.44
//   z =  2.55 * sin(80°) * sin(255°) ≈ -2.43
const INITIAL_CAMERA: [number, number, number] = [0.65, 0.44, -2.43];

// ——————————————————————————————————————————
// Camera fly-to animator — must live inside Canvas to access r3f context
// ——————————————————————————————————————————

interface ControlsRef {
  enabled: boolean;
  update(): void;
}

function CameraFlyTo({ controlsRef }: { controlsRef: React.RefObject<ControlsRef | null> }) {
  const { camera } = useThree();
  const selectedTheaterId = useAppStore((s) => s.selectedTheaterId);
  const animTarget = useRef<THREE.Vector3 | null>(null);
  const lastTriggeredId = useRef<string | null>(null);

  useEffect(() => {
    // Only trigger on a new theater selection (not on re-renders with same id)
    if (!selectedTheaterId || selectedTheaterId === lastTriggeredId.current) return;
    const theater = THEATERS.find((t) => t.id === selectedTheaterId);
    if (theater) {
      animTarget.current = theaterCameraPos(theater);
      lastTriggeredId.current = selectedTheaterId;
    }
  }, [selectedTheaterId]);

  useFrame(() => {
    if (!animTarget.current) return;
    const controls = controlsRef.current;

    // Disable OrbitControls so it doesn't fight the lerp each frame
    if (controls) controls.enabled = false;

    camera.position.lerp(animTarget.current, 0.07);
    camera.lookAt(0, 0, 0);

    if (camera.position.distanceTo(animTarget.current) < 0.008) {
      camera.position.copy(animTarget.current);
      camera.lookAt(0, 0, 0);
      animTarget.current = null;
      // Re-enable and sync OrbitControls from new position
      if (controls) {
        controls.enabled = true;
        controls.update();
      }
    }
  });

  return null;
}

// ——————————————————————————————————————————
// Main Globe component
// ——————————————————————————————————————————

export default function Globe() {
  const layers = useAppStore((s) => s.layers);
  const clearSelection = useAppStore((s) => s.clearSelection);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);

  const handleMissed = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: INITIAL_CAMERA, fov: 42, near: 0.01, far: 100 }}
        gl={{ antialias: true, alpha: false, toneMapping: THREE.NoToneMapping }}
        style={{ background: "#060a10" }}
        onPointerMissed={handleMissed}
      >
        {/* Lighting: ambient floor + primary sun facing the Indian Ocean hemisphere + faint fill */}
        {/* Camera is at [0.65, 0.44, -2.43] (Indian Ocean face, -Z hemisphere). */}
        {/* Primary light must be on the -Z side so the visible face is lit. */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[0.5, 1.5, -4]} intensity={1.1} color="#fffaf0" />
        <directionalLight position={[-3, -1, 3]} intensity={0.15} color="#4488cc" />

        <OrbitControls
          ref={controlsRef}
          makeDefault
          enablePan={false}
          minDistance={1.25}
          maxDistance={4.0}
          rotateSpeed={0.4}
          zoomSpeed={0.8}
          dampingFactor={0.08}
          enableDamping
        />

        {/* Camera fly-to animator — reacts to theater preset selection */}
        <CameraFlyTo controlsRef={controlsRef} />

        <Suspense fallback={null}>
          <GlobeEarth />
        </Suspense>

        {layers.vessels && <VesselLayer vessels={VESSELS} />}
        {layers.ports && <PortLayer ports={PORTS} />}
        {layers.chokepoints && <ChokepointLayer chokepoints={CHOKEPOINTS} />}
      </Canvas>
    </div>
  );
}
