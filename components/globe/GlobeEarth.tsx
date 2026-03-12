"use client";

import { useEffect, useState, useMemo } from "react";
import * as THREE from "three";

function buildGraticule(): THREE.BufferGeometry {
  const r = 1.0012;
  const verts: number[] = [];

  const toXYZ = (lat: number, lon: number): [number, number, number] => {
    const phi = ((90 - lat) * Math.PI) / 180;
    const theta = ((lon + 180) * Math.PI) / 180;
    return [
      -r * Math.sin(phi) * Math.cos(theta),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta),
    ];
  };

  const SEGS = 128;

  // Latitude parallels at 30° intervals
  for (const lat of [-60, -30, 30, 60]) {
    for (let i = 0; i < SEGS; i++) {
      const lon1 = (i / SEGS) * 360 - 180;
      const lon2 = ((i + 1) / SEGS) * 360 - 180;
      verts.push(...toXYZ(lat, lon1), ...toXYZ(lat, lon2));
    }
  }

  // Longitude meridians at 30° intervals
  for (let lon = -180; lon < 180; lon += 30) {
    for (let i = 0; i < SEGS; i++) {
      const lat1 = (i / SEGS) * 180 - 90;
      const lat2 = ((i + 1) / SEGS) * 180 - 90;
      verts.push(...toXYZ(lat1, lon), ...toXYZ(lat2, lon));
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  return geo;
}

function buildEquator(): THREE.BufferGeometry {
  const r = 1.0012;
  const verts: number[] = [];
  const SEGS = 128;
  for (let i = 0; i < SEGS; i++) {
    const lon1 = (i / SEGS) * 360 - 180;
    const lon2 = ((i + 1) / SEGS) * 360 - 180;
    const phi = Math.PI / 2;
    const t1 = ((lon1 + 180) * Math.PI) / 180;
    const t2 = ((lon2 + 180) * Math.PI) / 180;
    verts.push(
      -r * Math.sin(phi) * Math.cos(t1),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(t1),
      -r * Math.sin(phi) * Math.cos(t2),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(t2)
    );
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  return geo;
}

export default function GlobeEarth() {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(
      "/textures/earth-day.jpg",
      (t) => {
        t.colorSpace = THREE.SRGBColorSpace;
        console.log("[GlobeEarth] texture loaded OK:", t.image?.width, "×", t.image?.height);
        setTexture(t);
      },
      undefined,
      (err) => {
        console.error("[GlobeEarth] texture FAILED to load:", err);
        setTexture(null);
      }
    );
  }, []);

  useEffect(() => {
    console.log("[GlobeEarth] branch:", texture ? "TEXTURED" : "FALLBACK");
  }, [texture]);

  const graticuleGeo = useMemo(() => buildGraticule(), []);
  const equatorGeo = useMemo(() => buildEquator(), []);

  const graticuleMat = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: 0x1e3f66,
        transparent: true,
        opacity: 0.18,
      }),
    []
  );
  const equatorMat = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: 0x2a5a8a,
        transparent: true,
        opacity: 0.38,
      }),
    []
  );

  return (
    <group>
      {/* Earth sphere */}
      {/* key forces r3f to create a new material instance when switching branches,   */}
      {/* preventing the dark fallback color from being carried over to the texture.  */}
      <mesh>
        <sphereGeometry args={[1, 64, 64]} />
        {texture ? (
          <meshPhongMaterial
            key="globe-textured"
            map={texture}
            color={0xffffff}
            specular={new THREE.Color(0x111111)}
            shininess={8}
            toneMapped={false}
          />
        ) : (
          <meshPhongMaterial
            key="globe-fallback"
            color={0x1a4a7a}
            emissive={0x061525}
            emissiveIntensity={0.6}
            specular={new THREE.Color(0x080808)}
            shininess={6}
            toneMapped={false}
          />
        )}
      </mesh>

      {/* Lat/lon graticule */}
      <lineSegments geometry={graticuleGeo} material={graticuleMat} />
      {/* Equator — slightly brighter */}
      <lineSegments geometry={equatorGeo} material={equatorMat} />

      {/* Atmosphere inner */}
      <mesh>
        <sphereGeometry args={[1.020, 48, 48]} />
        <meshPhongMaterial
          color="#1e7fc0"
          transparent
          opacity={0.18}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Atmosphere outer halo */}
      <mesh>
        <sphereGeometry args={[1.060, 32, 32]} />
        <meshPhongMaterial
          color="#0d4a8a"
          transparent
          opacity={0.07}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
