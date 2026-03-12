"use client";

import { useRef, useMemo, useEffect, useCallback } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import type { Port } from "@/lib/adapters/types";
import { latLonToVec3 } from "@/lib/geo";
import { useAppStore } from "@/store/useAppStore";

// Tier 1 = brightest, Tier 2 = mid, Tier 3 = dim
const TIER_COLORS: Record<number, THREE.Color> = {
  1: new THREE.Color(0x67e8f9),  // vivid sky-cyan
  2: new THREE.Color(0x22d3ee),  // bright cyan
  3: new THREE.Color(0x0e7490),  // muted teal
};
const MILITARY_COLOR = new THREE.Color(0xff9a70);  // bright orange
const SELECTED_COLOR = new THREE.Color(0xffffff);

interface Props {
  ports: Port[];
}

export default function PortLayer({ ports }: Props) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const selectEntity = useAppStore((s) => s.selectEntity);
  const selectedEntity = useAppStore((s) => s.selectedEntity);

  const selectedId =
    selectedEntity?.type === "port" ? selectedEntity.data.id : null;

  // Octahedron = diamond shape — clearly distinct from vessel cones
  const geometry = useMemo(() => new THREE.OctahedronGeometry(0.024), []);
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        vertexColors: true,
        toneMapped: false,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    []
  );

  const { matrices, baseColors } = useMemo(() => {
    const matrices: THREE.Matrix4[] = [];
    const baseColors: THREE.Color[] = [];

    for (const p of ports) {
      const pos = latLonToVec3(p.lat, p.lon, 1.026);
      const m = new THREE.Matrix4().setPosition(pos);
      matrices.push(m);

      const color =
        p.type === "military"
          ? MILITARY_COLOR
          : (TIER_COLORS[p.strategicTier] ?? TIER_COLORS[3]);
      baseColors.push(color);
    }

    return { matrices, baseColors };
  }, [ports]);

  // Apply to InstancedMesh after it is created (useEffect, not useMemo)
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    for (let i = 0; i < ports.length; i++) {
      mesh.setMatrixAt(i, matrices[i]);
      const isSelected = ports[i].id === selectedId;
      mesh.setColorAt(i, isSelected ? SELECTED_COLOR : baseColors[i]);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [matrices, baseColors, selectedId, ports]);

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      const idx = e.instanceId;
      if (idx !== undefined && ports[idx]) {
        selectEntity("port", ports[idx]);
      }
    },
    [ports, selectEntity]
  );

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, ports.length]}
      onClick={handleClick}
    />
  );
}
