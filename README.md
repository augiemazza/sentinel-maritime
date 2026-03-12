# Sentinel Maritime

A 3D global maritime situational awareness console. Built as a portfolio project targeting defense-tech and maritime autonomy engineers.

## Running locally

```bash
npm install --legacy-peer-deps
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript** (strict)
- **react-three-fiber** + **@react-three/drei** — 3D globe
- **Three.js** — rendering
- **Zustand** — state management
- **Tailwind CSS** — UI

## Optional: Earth Texture

The globe falls back to a solid dark-blue sphere if no texture is found. To enable a real earth texture:

1. Download a NASA Blue Marble image (~5400×2700): [NASA Visible Earth](https://visibleearth.nasa.gov/images/73909/december-blue-marble-next-generation-w-topography-and-bathymetry)
2. Save as `public/textures/earth-day.jpg`

## Phase 1 Features

- Interactive 3D globe with OrbitControls (drag to rotate, scroll to zoom)
- **Vessel layer** — 60 mock vessels near major chokepoints, color-coded by type; dark (AIS-off) vessels shown in gray
- **Port layer** — 20 strategic ports color-coded by tier (Tier 1 = bright cyan, military = orange)
- **Chokepoint layer** — 8 major chokepoints: Hormuz, Bab-el-Mandeb, Malacca, Taiwan Strait, Suez, Panama, Gibraltar, Lombok
- **Layer toggles** — top bar to show/hide each layer independently
- **Intelligence panel** — click any object to view details and geopolitical context

## Data Architecture

All data is mock (realistic but synthetic). Located in `/data/`. The adapter pattern in `lib/adapters/` is designed so that real AIS feeds or a PostGIS backend can be plugged in later without touching the UI components.

## Roadmap

- Phase 2: Theater presets (camera fly-to) + conflict event layer
- Phase 3: AIS gap detection and dark vessel hotspot visualization
- Phase 4: Chokepoint stress index (composite risk score)
- Phase 5: Submarine cable infrastructure proximity alerts
- Phase 6: Timeline scrubber and 24h replay mode
