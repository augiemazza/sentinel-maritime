"use client";

import LayerToggleBar from "@/components/ui/LayerToggleBar";
import IntelligencePanel from "@/components/ui/IntelligencePanel";

export default function HUD() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Top bar — full width */}
      <div className="pointer-events-auto">
        <LayerToggleBar />
      </div>

      {/* Right panel — below top bar */}
      <div className="absolute top-[40px] right-0 bottom-0 pointer-events-auto">
        <IntelligencePanel />
      </div>
    </div>
  );
}
