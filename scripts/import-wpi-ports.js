#!/usr/bin/env node
/**
 * import-wpi-ports.js
 *
 * Fetches the NGA World Port Index (WPI) via the public MSI REST API,
 * transforms each record into our internal Port schema, and writes the
 * result to data/ports.json.
 *
 * Source: National Geospatial-Intelligence Agency (US DoD)
 *   https://msi.nga.mil/Publications/WPI
 *   Public domain — no API key required.
 *
 * Usage:
 *   node scripts/import-wpi-ports.js
 *
 * WPI harborSize codes:
 *   L = Large   → strategicTier 1
 *   M = Medium  → strategicTier 2
 *   S = Small   → strategicTier 3
 *   V = Very Small → excluded (fishing anchorages, tiny inlets)
 *
 * WPI harborUse codes:
 *   Mil    → type: "military"
 *   Cargo  → type: "commercial" (unless loOilTerm = Y)
 *   Ferry  → type: "commercial"
 *   Fish   → type: "commercial"
 *   UNK    → type: "commercial" (unless loOilTerm = Y or name keywords match)
 *
 * loOilTerm = "Y" overrides harborUse → type: "oil-terminal"
 */

const { writeFileSync } = require("fs");
const path = require("path");

const API_URL =
  "https://msi.nga.mil/api/publications/world-port-index?output=json&pageSize=5000&page=1";

const OUT_PATH = path.join(__dirname, "../data/ports.json");

// ——————————————————————————————————————————
// DMS → decimal degrees parser
// Handles WPI format: "30°20'00\"N" or "48°17'00\"E"
// ——————————————————————————————————————————
function parseDMS(dmsStr) {
  if (!dmsStr || typeof dmsStr !== "string") return null;
  const m = dmsStr.match(/(\d+)[°\u00b0](\d+)'([\d.]+)?["""]?\s*([NSEWnsew])/);
  if (!m) return null;
  const deg = parseFloat(m[1]);
  const min = parseFloat(m[2]);
  const sec = parseFloat(m[3] || "0");
  const dir = m[4].toUpperCase();
  let decimal = deg + min / 60 + sec / 3600;
  if (dir === "S" || dir === "W") decimal = -decimal;
  return decimal;
}

// ——————————————————————————————————————————
// Derive our Port.type from WPI fields
// ——————————————————————————————————————————
const MILITARY_NAME_RE =
  /\b(NAVAL|NAVY|NAVBASE|MILITARY|MIL\b|NAS\b|NAB\b|NOLF\b|MCAS\b|USCG|COAST GUARD)\b/i;
const OIL_NAME_RE =
  /\b(OIL|PETROLEUM|REFINERY|LNG|LPG|TERMINAL|TANKER|JETTY|FPSO)\b/i;

function deriveType(port) {
  if (port.harborUse === "Mil" || MILITARY_NAME_RE.test(port.portName)) {
    return "military";
  }
  // loOilTerm: "Y" means the port *has* oil terminal facilities — true of most
  // large commercial ports. Use only the name regex to identify ports that are
  // *primarily* oil/LNG/petroleum terminals.
  if (OIL_NAME_RE.test(port.portName)) {
    return "oil-terminal";
  }
  return "commercial";
}

// ——————————————————————————————————————————
// Derive strategicTier from harborSize
// ——————————————————————————————————————————
function deriveTier(harborSize) {
  if (harborSize === "L") return 1;
  if (harborSize === "M") return 2;
  return 3; // S
}

// ——————————————————————————————————————————
// Build a short notes string from WPI metadata
// ——————————————————————————————————————————
const HARBOR_TYPE_LABELS = {
  RN: "River, Natural",
  RO: "River, Outlet",
  TH: "Tidal Harbor",
  CB: "Coastal Breakwater",
  CN: "Canal",
  CT: "Canal with Tide",
  LC: "Land Cutoff",
  OR: "Open Roadstead",
  TY: "Typhoon Harbor",
};

const SHELTER_LABELS = {
  E: "Excellent shelter",
  G: "Good shelter",
  F: "Fair shelter",
  P: "Poor shelter",
  N: "No shelter",
};

function buildNotes(port) {
  const parts = [];
  const typeLabel = HARBOR_TYPE_LABELS[port.harborType];
  if (typeLabel) parts.push(typeLabel);
  const shelterLabel = SHELTER_LABELS[port.shelter];
  if (shelterLabel) parts.push(shelterLabel);
  if (port.unloCode) parts.push(`UN/LOCODE: ${port.unloCode}`);
  if (port.regionName && port.regionName !== port.countryName) {
    parts.push(`Region: ${port.regionName}`);
  }
  return parts.length > 0 ? parts.join(". ") + "." : undefined;
}

// ——————————————————————————————————————————
// Main
// ——————————————————————————————————————————
async function main() {
  process.stdout.write(`Fetching WPI from NGA MSI API...\n`);

  let raw;
  try {
    const res = await fetch(API_URL);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    raw = await res.json();
  } catch (err) {
    console.error("Failed to fetch WPI data:", err.message);
    process.exit(1);
  }

  const allPorts = raw.ports ?? [];
  console.log(`  Raw WPI records: ${allPorts.length}`);

  // ——————————————————
  // Transform and filter
  // ——————————————————
  const ports = [];
  let skippedV = 0;
  let skippedNoCoords = 0;

  for (const p of allPorts) {
    // Exclude Very Small harbors
    if (p.harborSize === "V" || p.harborSize == null) {
      skippedV++;
      continue;
    }

    const lat = parseDMS(p.latitude);
    const lon = parseDMS(p.longitude);

    if (lat == null || lon == null || isNaN(lat) || isNaN(lon)) {
      skippedNoCoords++;
      continue;
    }

    ports.push({
      id: `wpi-${p.portNumber}`,
      name: p.portName,
      country: p.countryName ?? "Unknown",
      lat,
      lon,
      type: deriveType(p),
      strategicTier: deriveTier(p.harborSize),
      notes: buildNotes(p),
    });
  }

  // Sort: tier 1 first, then alphabetical by name within tier
  ports.sort((a, b) => {
    if (a.strategicTier !== b.strategicTier)
      return a.strategicTier - b.strategicTier;
    return a.name.localeCompare(b.name);
  });

  // ——————————————————
  // Stats
  // ——————————————————
  const byType = {};
  const byTier = {};
  for (const p of ports) {
    byType[p.type] = (byType[p.type] || 0) + 1;
    byTier[p.strategicTier] = (byTier[p.strategicTier] || 0) + 1;
  }

  console.log(`  Skipped V (Very Small): ${skippedV}`);
  console.log(`  Skipped missing coords: ${skippedNoCoords}`);
  console.log(`  Output ports: ${ports.length}`);
  console.log(`  By type:`, byType);
  console.log(`  By tier:`, byTier);

  // ——————————————————
  // Write
  // ——————————————————
  writeFileSync(OUT_PATH, JSON.stringify(ports, null, 2), "utf8");
  console.log(`\n✓ Written to ${OUT_PATH}`);
}

main();
