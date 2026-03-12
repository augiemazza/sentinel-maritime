export type VesselType =
  | "cargo"
  | "tanker"
  | "military"
  | "fishing"
  | "passenger"
  | "unknown";

export type VesselStatus = "underway" | "anchored" | "moored" | "dark";

export type PortType = "commercial" | "military" | "oil-terminal" | "mixed";

export type StrategicTier = 1 | 2 | 3;

export interface Vessel {
  id: string;
  mmsi: string;
  name: string;
  type: VesselType;
  flag: string;
  lat: number;
  lon: number;
  heading: number;
  speed: number;
  status: VesselStatus;
  lastSeen: string;
  destination?: string;
  length?: number;
}

export interface Port {
  id: string;
  name: string;
  country: string;
  lat: number;
  lon: number;
  type: PortType;
  strategicTier: StrategicTier;
  throughput?: number;
  notes?: string;
}

export interface Chokepoint {
  id: string;
  name: string;
  lat: number;
  lon: number;
  widthNm: number;
  annualTraffic?: number;
  oilFlowBpd?: number;
  geopoliticalContext: string;
}

export type SelectedEntityType = "vessel" | "port" | "chokepoint";

export interface SelectedEntity {
  type: SelectedEntityType;
  id: string;
}
