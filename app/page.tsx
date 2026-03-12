"use client";

import dynamic from "next/dynamic";
import HUD from "@/components/layout/HUD";

// Globe must be loaded client-side only (WebGL)
const Globe = dynamic(() => import("@/components/globe/Globe"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-console-bg">
      <span className="panel-label">INITIALIZING SENSOR ARRAY...</span>
    </div>
  ),
});

export default function Page() {
  return (
    <main className="relative w-screen h-screen bg-console-bg overflow-hidden">
      <Globe />
      <HUD />
    </main>
  );
}
