#!/usr/bin/env node
/**
 * Copies Cesium static assets (Workers, Assets, Widgets, ThirdParty) from the
 * cesium npm package into public/cesium-static/ so Next.js can serve them.
 *
 * Runs automatically via the "postinstall" npm hook.
 * Skips copy if the destination directory already exists.
 */

const { cpSync, existsSync, mkdirSync } = require("fs");
const path = require("path");

const src = path.join(__dirname, "../node_modules/cesium/Build/Cesium");
const dest = path.join(__dirname, "../public/cesium-static");

if (existsSync(dest)) {
  process.exit(0);
}

const dirs = ["Workers", "Assets", "Widgets", "ThirdParty"];

mkdirSync(dest, { recursive: true });

for (const dir of dirs) {
  const from = path.join(src, dir);
  const to = path.join(dest, dir);
  cpSync(from, to, { recursive: true });
}

console.log("✓ Cesium static assets copied to public/cesium-static/");
