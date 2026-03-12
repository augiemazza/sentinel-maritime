import { latLonToVec3 } from "@/lib/geo";
import * as THREE from "three";

export interface TheaterPreset {
  id: string;
  shortLabel: string;
  label: string;
  lat: number;
  lon: number;
  distance: number;
  summary: string;
}

export const THEATERS: readonly TheaterPreset[] = [
  {
    id: "hormuz",
    shortLabel: "HORMUZ",
    label: "STRAIT OF HORMUZ",
    lat: 26.5,
    lon: 56.5,
    distance: 1.85,
    summary:
      "Approximately 20% of global petroleum liquids — over 20 million barrels per day — transit this 33nm passage between Iran and Oman. The northern shore is controlled by Iran; any closure or interdiction causes immediate global energy market disruption and triggers NATO and GCC contingency operations.",
  },
  {
    id: "red-sea",
    shortLabel: "RED SEA",
    label: "RED SEA / GULF OF ADEN",
    lat: 14.0,
    lon: 43.5,
    distance: 1.9,
    summary:
      "Houthi anti-ship operations since late 2023 have significantly reduced commercial traffic through Bab-el-Mandeb, rerouting vessels via the Cape of Good Hope and adding 10–14 transit days. Naval assets from the US, UK, France, and regional partners are actively deployed. Threat classification: ELEVATED.",
  },
  {
    id: "taiwan-strait",
    shortLabel: "TAIWAN",
    label: "TAIWAN STRAIT",
    lat: 24.5,
    lon: 120.0,
    distance: 1.85,
    summary:
      "The 110nm strait separates mainland China from Taiwan. Over 50% of global container shipping transits the broader Western Pacific. Taiwan manufactures 88% of the world's most advanced semiconductors. PLA naval exercises have increased in frequency and scale since 2022, with repeat live-fire drills encircling the island.",
  },
  {
    id: "south-china-sea",
    shortLabel: "S.C.SEA",
    label: "SOUTH CHINA SEA",
    lat: 13.0,
    lon: 114.0,
    distance: 2.0,
    summary:
      "Approximately $3.4 trillion in global trade transits annually. China's maritime militia, island-building program, and ADIZ assertions contest Philippine, Vietnamese, Malaysian, and Bruneian EEZ rights. The Spratly and Paracel chains are focal points of active grey-zone operations and periodic Coast Guard standoffs.",
  },
  {
    id: "suez",
    shortLabel: "SUEZ",
    label: "SUEZ / EASTERN MED",
    lat: 30.7,
    lon: 32.3,
    distance: 1.9,
    summary:
      "The Suez Canal handles 12–15% of global trade, connecting the Mediterranean to the Red Sea. Houthi interdiction in the adjacent Red Sea has diverted significant traffic, compressing canal revenue and straining Egyptian economic stability. The Eastern Mediterranean is an active convergence zone for Russian, NATO, and regional naval forces.",
  },
  {
    id: "panama",
    shortLabel: "PANAMA",
    label: "PANAMA CANAL",
    lat: 9.0,
    lon: -79.5,
    distance: 1.85,
    summary:
      "The Panama Canal processes approximately 5% of global maritime trade, linking Pacific and Atlantic routes. Severe drought during 2023–2024 El Niño forced reduced draft restrictions and extended vessel queues, exposing critical climate-driven infrastructure vulnerability in the primary inter-ocean logistics corridor for the United States.",
  },
];

export function theaterCameraPos(theater: TheaterPreset): THREE.Vector3 {
  return latLonToVec3(theater.lat, theater.lon, theater.distance);
}
