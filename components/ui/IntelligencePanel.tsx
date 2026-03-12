"use client";

import { useAppStore } from "@/store/useAppStore";
import type { Vessel, Port, Chokepoint } from "@/lib/adapters/types";
import { getVessels, getPorts, getChokepoints } from "@/lib/adapters/mock-adapter";
import { THEATERS, type TheaterPreset } from "@/lib/theaters";

const ALL_VESSELS = getVessels();
const ALL_PORTS = getPorts();
const ALL_CHOKEPOINTS = getChokepoints();

// ——————————————————————————————————————————
// Sub-components
// ——————————————————————————————————————————

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[9px] font-bold tracking-[0.15em] text-[#334155] uppercase mb-1.5">
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start gap-2 py-1.5 border-b border-[#0f1e30]">
      <span className="text-[9px] font-semibold tracking-[0.1em] text-[#334155] uppercase whitespace-nowrap">
        {label}
      </span>
      <span className="text-[11px] text-[#94a3b8] text-right break-words">{value}</span>
    </div>
  );
}

function Badge({
  label,
  color,
}: {
  label: string;
  color: "cyan" | "amber" | "red" | "green" | "orange" | "gray";
}) {
  const colorMap = {
    cyan:   "border-[#22d3ee]/60 text-[#22d3ee] bg-[#22d3ee]/5",
    amber:  "border-[#f59e0b]/60 text-[#f59e0b] bg-[#f59e0b]/5",
    red:    "border-[#f87171]/60 text-[#f87171] bg-[#f87171]/5",
    green:  "border-[#4ade80]/60 text-[#4ade80] bg-[#4ade80]/5",
    orange: "border-[#ff7a40]/60 text-[#ff7a40] bg-[#ff7a40]/5",
    gray:   "border-[#334155] text-[#64748b]",
  };
  return (
    <span
      className={`inline-block border px-1.5 py-0.5 text-[9px] font-bold tracking-[0.1em] ${colorMap[color]}`}
    >
      {label}
    </span>
  );
}

// ——————————————————————————————————————————
// Empty / default state
// ——————————————————————————————————————————

function EmptyState() {
  const darkCount = ALL_VESSELS.filter((v) => v.status === "dark").length;
  const militaryCount = ALL_VESSELS.filter((v) => v.type === "military").length;
  const tier1Ports = ALL_PORTS.filter((p) => p.strategicTier === 1).length;

  return (
    <div className="px-4 py-4 flex flex-col gap-5">
      {/* Instruction */}
      <p className="text-[10px] text-[#334155] leading-relaxed">
        Select a vessel, port, or chokepoint on the globe for intelligence detail.
      </p>

      {/* Summary stats */}
      <div>
        <SectionLabel>TRACKED CONTACTS</SectionLabel>
        <div className="grid grid-cols-3 gap-px bg-[#0f1e30]">
          {[
            { label: "Vessels", value: ALL_VESSELS.length, color: "#22d3ee" },
            { label: "Ports", value: ALL_PORTS.length, color: "#00e5ff" },
            { label: "Chkpts", value: ALL_CHOKEPOINTS.length, color: "#f59e0b" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-[#080f1c] px-3 py-2.5">
              <div className="text-[18px] font-bold" style={{ color }}>{value}</div>
              <div className="text-[9px] tracking-widest text-[#334155] mt-0.5">{label.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Attention items */}
      <div>
        <SectionLabel>ATTENTION ITEMS</SectionLabel>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 py-1.5 border-b border-[#0f1e30]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#64748b] flex-shrink-0" />
            <span className="text-[10px] text-[#64748b]">
              <span className="text-[#f87171] font-semibold">{darkCount}</span> vessels currently AIS-dark
            </span>
          </div>
          <div className="flex items-center gap-2 py-1.5 border-b border-[#0f1e30]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#64748b] flex-shrink-0" />
            <span className="text-[10px] text-[#64748b]">
              <span className="text-[#f87171] font-semibold">{militaryCount}</span> military vessels tracked
            </span>
          </div>
          <div className="flex items-center gap-2 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#64748b] flex-shrink-0" />
            <span className="text-[10px] text-[#64748b]">
              <span className="text-[#22d3ee] font-semibold">{tier1Ports}</span> Tier 1 strategic ports active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ——————————————————————————————————————————
// Vessel detail
// ——————————————————————————————————————————

function getVesselContext(v: Vessel): string {
  if (v.status === "dark") {
    return "AIS-dark — transmissions ceased at last known position. Dark status can indicate deliberate transponder manipulation to conceal movement near sensitive infrastructure or during illicit transfers.";
  }
  if (v.type === "military") {
    return "Military vessel in this region. Track relative to civilian traffic density and proximity to chokepoints or undersea infrastructure.";
  }
  if (v.type === "tanker") {
    return "Energy tanker in transit. Disruption near this region directly affects regional fuel supply chains. Monitor speed anomalies and deviations from declared destination.";
  }
  if (v.type === "fishing") {
    return "Fishing vessel. Monitor for transit in restricted zones, proximity to military exercises, or irregular patterns suggesting intelligence gathering.";
  }
  return "Commercial vessel in transit. Monitor for behavioral anomalies, proximity to conflict zones, and deviation from declared destination.";
}

function VesselDetail({ vessel }: { vessel: Vessel }) {
  const typeColor: Record<string, "cyan" | "amber" | "red" | "green" | "gray"> = {
    cargo: "cyan", tanker: "amber", military: "red",
    fishing: "green", passenger: "cyan", unknown: "gray",
  };
  const statusColor: Record<string, "cyan" | "amber" | "red" | "green" | "gray"> = {
    underway: "green", anchored: "amber", moored: "gray", dark: "red",
  };

  const lastSeenStr = new Date(vessel.lastSeen)
    .toISOString().replace("T", " ").slice(0, 16) + "Z";

  return (
    <div>
      <div className="mb-3">
        <div className="text-[13px] font-bold text-[#e2e8f0] mb-2 leading-tight">
          {vessel.name}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <Badge label={vessel.type.toUpperCase()} color={typeColor[vessel.type] ?? "gray"} />
          <Badge label={vessel.status.toUpperCase()} color={statusColor[vessel.status] ?? "gray"} />
          <Badge label={`FLAG: ${vessel.flag}`} color="gray" />
        </div>
      </div>

      <Row label="MMSI" value={vessel.mmsi} />
      <Row
        label="POSITION"
        value={`${Math.abs(vessel.lat).toFixed(3)}° ${vessel.lat >= 0 ? "N" : "S"} / ${Math.abs(vessel.lon).toFixed(3)}° ${vessel.lon >= 0 ? "E" : "W"}`}
      />
      <Row label="HEADING" value={`${vessel.heading}°`} />
      <Row label="SPEED" value={vessel.status === "dark" ? "—" : `${vessel.speed.toFixed(1)} kts`} />
      {vessel.destination && <Row label="DESTINATION" value={vessel.destination} />}
      {vessel.length && <Row label="LENGTH" value={`${vessel.length} m`} />}
      <Row label="LAST SEEN" value={lastSeenStr} />

      <div className="mt-4">
        <SectionLabel>ASSESSMENT</SectionLabel>
        <p className="text-[11px] text-[#64748b] leading-relaxed">
          {getVesselContext(vessel)}
        </p>
      </div>
    </div>
  );
}

// ——————————————————————————————————————————
// Port detail
// ——————————————————————————————————————————

function PortDetail({ port }: { port: Port }) {
  const tierColor: Record<number, "cyan" | "amber" | "gray"> = { 1: "cyan", 2: "amber", 3: "gray" };
  const typeColor: Record<string, "cyan" | "red" | "amber" | "orange" | "gray"> = {
    commercial: "cyan", military: "red", "oil-terminal": "amber", mixed: "gray",
  };

  return (
    <div>
      <div className="mb-3">
        <div className="text-[13px] font-bold text-[#e2e8f0] mb-2 leading-tight">
          {port.name}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <Badge label={`TIER ${port.strategicTier}`} color={tierColor[port.strategicTier]} />
          <Badge label={port.type.replace("-", " ").toUpperCase()} color={typeColor[port.type] ?? "gray"} />
          <Badge label={port.country.toUpperCase()} color="gray" />
        </div>
      </div>

      <Row
        label="POSITION"
        value={`${Math.abs(port.lat).toFixed(3)}° ${port.lat >= 0 ? "N" : "S"} / ${Math.abs(port.lon).toFixed(3)}° ${port.lon >= 0 ? "E" : "W"}`}
      />
      {port.throughput ? (
        <Row label="THROUGHPUT" value={`${(port.throughput / 1_000_000).toFixed(1)}M TEU/yr`} />
      ) : null}

      {port.notes && (
        <div className="mt-4">
          <SectionLabel>STRATEGIC SIGNIFICANCE</SectionLabel>
          <p className="text-[11px] text-[#64748b] leading-relaxed">{port.notes}</p>
        </div>
      )}
    </div>
  );
}

// ——————————————————————————————————————————
// Chokepoint detail
// ——————————————————————————————————————————

function ChokepointDetail({ chokepoint }: { chokepoint: Chokepoint }) {
  return (
    <div>
      <div className="mb-3">
        <div className="text-[13px] font-bold text-[#e2e8f0] mb-2 leading-tight">
          {chokepoint.name}
        </div>
        <Badge label="STRATEGIC CHOKEPOINT" color="amber" />
      </div>

      <Row label="WIDTH" value={`${chokepoint.widthNm} nm`} />
      {chokepoint.annualTraffic && (
        <Row label="ANNUAL TRAFFIC" value={`~${chokepoint.annualTraffic.toLocaleString()} vessels`} />
      )}
      {chokepoint.oilFlowBpd ? (
        <Row label="OIL THROUGHPUT" value={`${(chokepoint.oilFlowBpd / 1_000_000).toFixed(1)}M bpd`} />
      ) : null}
      <Row
        label="POSITION"
        value={`${Math.abs(chokepoint.lat).toFixed(2)}° ${chokepoint.lat >= 0 ? "N" : "S"} / ${Math.abs(chokepoint.lon).toFixed(2)}° ${chokepoint.lon >= 0 ? "E" : "W"}`}
      />

      <div className="mt-4">
        <SectionLabel>GEOPOLITICAL CONTEXT</SectionLabel>
        <p className="text-[11px] text-[#64748b] leading-relaxed">
          {chokepoint.geopoliticalContext}
        </p>
      </div>
    </div>
  );
}

// ——————————————————————————————————————————
// Theater panel
// ——————————————————————————————————————————

function TheaterPanel({ theater }: { theater: TheaterPreset }) {
  const setTheater = useAppStore((s) => s.setTheater);
  const darkCount = ALL_VESSELS.filter((v) => v.status === "dark").length;
  const militaryCount = ALL_VESSELS.filter((v) => v.type === "military").length;

  return (
    <div className="px-4 py-4 flex flex-col gap-4">
      {/* Theater name + dismiss */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[8px] tracking-[0.18em] text-[#f59e0b] font-bold mb-1">THEATER</div>
          <div className="text-[13px] font-bold text-[#e2e8f0] leading-tight">{theater.label}</div>
        </div>
        <button
          onClick={() => setTheater(null)}
          className="text-[9px] tracking-widest text-[#334155] hover:text-[#64748b] transition-colors flex-shrink-0 mt-0.5"
        >
          CLEAR ×
        </button>
      </div>

      {/* Regional assessment */}
      <div>
        <SectionLabel>REGIONAL ASSESSMENT</SectionLabel>
        <p className="text-[11px] text-[#64748b] leading-relaxed">{theater.summary}</p>
      </div>

      {/* Quick stats */}
      <div>
        <SectionLabel>TRACKED CONTACTS</SectionLabel>
        <div className="grid grid-cols-3 gap-px bg-[#0f1e30]">
          {[
            { label: "Vessels", value: ALL_VESSELS.length, color: "#22d3ee" },
            { label: "Ports", value: ALL_PORTS.length, color: "#00e5ff" },
            { label: "Chkpts", value: ALL_CHOKEPOINTS.length, color: "#f59e0b" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-[#080f1c] px-3 py-2.5">
              <div className="text-[18px] font-bold" style={{ color }}>{value}</div>
              <div className="text-[9px] tracking-widest text-[#334155] mt-0.5">{label.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Attention items */}
      <div>
        <SectionLabel>ATTENTION ITEMS</SectionLabel>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 py-1.5 border-b border-[#0f1e30]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#64748b] flex-shrink-0" />
            <span className="text-[10px] text-[#64748b]">
              <span className="text-[#f87171] font-semibold">{darkCount}</span> vessels currently AIS-dark
            </span>
          </div>
          <div className="flex items-center gap-2 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#64748b] flex-shrink-0" />
            <span className="text-[10px] text-[#64748b]">
              <span className="text-[#f87171] font-semibold">{militaryCount}</span> military vessels tracked
            </span>
          </div>
        </div>
      </div>

      <p className="text-[10px] text-[#1e3a5a] leading-relaxed">
        Select a vessel, port, or chokepoint for detailed intelligence.
      </p>
    </div>
  );
}

// ——————————————————————————————————————————
// Main panel
// ——————————————————————————————————————————

export default function IntelligencePanel() {
  const selectedEntity = useAppStore((s) => s.selectedEntity);
  const clearSelection = useAppStore((s) => s.clearSelection);
  const selectedTheaterId = useAppStore((s) => s.selectedTheaterId);

  const activeTheater = selectedTheaterId
    ? THEATERS.find((t) => t.id === selectedTheaterId) ?? null
    : null;

  // Header label: entity type > theater name > default
  const headerLabel = selectedEntity
    ? selectedEntity.type.toUpperCase()
    : activeTheater
    ? activeTheater.shortLabel
    : "INTELLIGENCE";

  return (
    <div className="absolute top-0 right-0 bottom-0 w-[300px] bg-[#060d18]/92 border-l border-[#0f1e30] backdrop-blur-sm flex flex-col">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-[#0f1e30] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold tracking-[0.15em] text-[#334155]">
            {headerLabel}
          </span>
        </div>
        {selectedEntity && (
          <button
            onClick={clearSelection}
            className="text-[9px] tracking-widest text-[#334155] hover:text-[#64748b] transition-colors"
          >
            CLEAR ×
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {selectedEntity ? (
          <div className="px-4 py-3">
            {selectedEntity.type === "vessel" && (
              <VesselDetail vessel={selectedEntity.data as Vessel} />
            )}
            {selectedEntity.type === "port" && (
              <PortDetail port={selectedEntity.data as Port} />
            )}
            {selectedEntity.type === "chokepoint" && (
              <ChokepointDetail chokepoint={selectedEntity.data as Chokepoint} />
            )}
          </div>
        ) : activeTheater ? (
          <TheaterPanel theater={activeTheater} />
        ) : (
          <EmptyState />
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-[#0f1e30] flex items-center justify-between flex-shrink-0">
        <span className="text-[9px] tracking-widest text-[#1a2a3a]">
          MOCK / UNCLASSIFIED
        </span>
        <span className="text-[9px] tracking-widest text-[#1a2a3a]">
          SMC-1
        </span>
      </div>
    </div>
  );
}
