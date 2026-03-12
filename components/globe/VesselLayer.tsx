"use client";

import { useRef, useMemo, useEffect, useCallback } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import type { Vessel } from "@/lib/adapters/types";
import { latLonToVec3, orientOnSphere } from "@/lib/geo";
import { useAppStore } from "@/store/useAppStore";

const VESSEL_TYPE_COLORS: Record<string, THREE.Color> = {
  cargo:     new THREE.Color(0x67e8f9),  // vivid sky-cyan
  tanker:    new THREE.Color(0xfcd34d),  // vivid amber-yellow
  military:  new THREE.Color(0xfca5a5),  // vivid coral-red
  fishing:   new THREE.Color(0x86efac),  // vivid green
  passenger: new THREE.Color(0xd8b4fe),  // vivid lavender
  unknown:   new THREE.Color(0xcbd5e1),  // light slate
  dark:      new THREE.Color(0x94a3b8),  // medium slate — AIS-dark
};

const SELECTED_COLOR = new THREE.Color(0xffffff);

interface Props {
  vessels: Vessel[];
}

export default function VesselLayer({ vessels }: Props) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const selectEntity = useAppStore((s) => s.selectEntity);
  const selectedEntity = useAppStore((s) => s.selectedEntity);

  const selectedId =
    selectedEntity?.type === "vessel" ? selectedEntity.data.id : null;

  // Cone: radius 0.022, height 0.065, 4-sided — clearly visible at global zoom
  const geometry = useMemo(() => new THREE.ConeGeometry(0.022, 0.065, 4), []);
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

  // Pre-compute instance data from vessel array
  const { matrices, baseColors } = useMemo(() => {
    const matrices: THREE.Matrix4[] = [];
    const baseColors: THREE.Color[] = [];

    for (const v of vessels) {
      const pos = latLonToVec3(v.lat, v.lon, 1.022);
      const quat = orientOnSphere(pos, v.heading);
      const m = new THREE.Matrix4().compose(pos, quat, new THREE.Vector3(1, 1, 1));
      matrices.push(m);

      const c =
        v.status === "dark"
          ? VESSEL_TYPE_COLORS.dark
          : (VESSEL_TYPE_COLORS[v.type] ?? VESSEL_TYPE_COLORS.unknown);
      baseColors.push(c);
    }

    return { matrices, baseColors };
  }, [vessels]);

  // Apply matrices + colors to InstancedMesh AFTER the mesh is created (useEffect, not useMemo)
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    for (let i = 0; i < vessels.length; i++) {
      mesh.setMatrixAt(i, matrices[i]);
      const isSelected = vessels[i].id === selectedId;
      mesh.setColorAt(i, isSelected ? SELECTED_COLOR : baseColors[i]);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [matrices, baseColors, selectedId, vessels]);

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      const idx = e.instanceId;
      if (idx !== undefined && vessels[idx]) {
        selectEntity("vessel", vessels[idx]);
      }
    },
    [vessels, selectEntity]
  );

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, vessels.length]}
      onClick={handleClick}
    />
  );
}
