"use client";

import { useMemo, useCallback } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import type { Chokepoint } from "@/lib/adapters/types";
import { latLonToVec3, orientOnSphere } from "@/lib/geo";
import { useAppStore } from "@/store/useAppStore";

// Shared geometries and materials (created once)
const OUTER_GEO = new THREE.RingGeometry(0.044, 0.056, 48);
const INNER_GEO = new THREE.RingGeometry(0.024, 0.030, 48);
const DOT_GEO = new THREE.CircleGeometry(0.010, 12);
const HIT_GEO = new THREE.SphereGeometry(0.058, 8, 8);

const RING_MAT_NORMAL = new THREE.MeshBasicMaterial({
  color: 0xfbbf24,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.95,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  toneMapped: false,
});
const RING_INNER_MAT_NORMAL = new THREE.MeshBasicMaterial({
  color: 0xfbbf24,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.55,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  toneMapped: false,
});
const DOT_MAT_NORMAL = new THREE.MeshBasicMaterial({
  color: 0xfcd34d,
  side: THREE.DoubleSide,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  toneMapped: false,
});
const RING_MAT_SELECTED = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 1.0,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  toneMapped: false,
});
const RING_INNER_MAT_SELECTED = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.6,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  toneMapped: false,
});
const DOT_MAT_SELECTED = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  side: THREE.DoubleSide,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  toneMapped: false,
});
const HIT_MAT = new THREE.MeshBasicMaterial({
  transparent: true,
  opacity: 0,
  depthWrite: false,
});

interface MarkerProps {
  chokepoint: Chokepoint;
  isSelected: boolean;
  onClick: () => void;
}

function ChokepointMarker({ chokepoint, isSelected, onClick }: MarkerProps) {
  const pos = useMemo(
    () => latLonToVec3(chokepoint.lat, chokepoint.lon, 1.008),
    [chokepoint.lat, chokepoint.lon]
  );
  const quat = useMemo(() => orientOnSphere(pos, 0), [pos]);

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      onClick();
    },
    [onClick]
  );

  const outerMat = isSelected ? RING_MAT_SELECTED : RING_MAT_NORMAL;
  const innerMat = isSelected ? RING_INNER_MAT_SELECTED : RING_INNER_MAT_NORMAL;
  const dotMat = isSelected ? DOT_MAT_SELECTED : DOT_MAT_NORMAL;

  return (
    <group position={pos} quaternion={quat}>
      <mesh geometry={OUTER_GEO} material={outerMat} />
      <mesh geometry={INNER_GEO} material={innerMat} />
      <mesh geometry={DOT_GEO} material={dotMat} />
      {/* Invisible hit sphere for easy clicking */}
      <mesh geometry={HIT_GEO} material={HIT_MAT} onClick={handleClick} />
    </group>
  );
}

export default function ChokepointLayer({ chokepoints }: { chokepoints: Chokepoint[] }) {
  const selectEntity = useAppStore((s) => s.selectEntity);
  const selectedEntity = useAppStore((s) => s.selectedEntity);

  return (
    <group>
      {chokepoints.map((cp) => {
        const isSelected =
          selectedEntity?.type === "chokepoint" &&
          selectedEntity.data.id === cp.id;
        return (
          <ChokepointMarker
            key={cp.id}
            chokepoint={cp}
            isSelected={isSelected}
            onClick={() => selectEntity("chokepoint", cp)}
          />
        );
      })}
    </group>
  );
}
