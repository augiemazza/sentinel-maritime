import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cesium static assets are served from /cesium-static (public/cesium-static/).
  // Populate via: node scripts/copy-cesium.js  (runs automatically on npm install)
};

export default nextConfig;
