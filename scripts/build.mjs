import { cp, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const src = path.join(root, "src");
const dist = path.join(root, "dist");

if (!existsSync(src)) {
  throw new Error("Missing src directory.");
}

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(src, dist, { recursive: true });

console.log("Build complete: dist/");
