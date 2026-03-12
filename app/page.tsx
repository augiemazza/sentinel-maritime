"use client";

import dynamic from "next/dynamic";
import HUD from "@/components/layout/HUD";

// CesiumViewer must be loaded client-side only (WebGL + browser APIs).
const CesiumViewer = dynamic(
  () => import("@/components/cesium/CesiumViewer"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <span className="panel-label">INITIALIZING SENSOR ARRAY...</span>
      </div>
    ),
  }
);

export default function Page() {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#060a10]">
      <CesiumViewer />
      <HUD />
    </main>
  );
}
