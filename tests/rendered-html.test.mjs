import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import net from "node:net";
import { after, before, test } from "node:test";

const root = new URL("../", import.meta.url);
let server;
let baseUrl;
let serverOutput = "";

async function availablePort() {
  return new Promise((resolve, reject) => {
    const listener = net.createServer();
    listener.unref();
    listener.on("error", reject);
    listener.listen(0, "127.0.0.1", () => {
      const address = listener.address();
      const port = typeof address === "object" && address ? address.port : 0;
      listener.close(() => resolve(port));
    });
  });
}

async function waitForServer(url) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // The production server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 125));
  }
  throw new Error(`Next production server did not become ready.\n${serverOutput}`);
}

before(async () => {
  const port = await availablePort();
  baseUrl = `http://127.0.0.1:${port}`;
  server = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "start", "-H", "127.0.0.1", "-p", String(port)],
    {
      cwd: root,
      env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  server.stdout.on("data", (chunk) => { serverOutput += chunk.toString(); });
  server.stderr.on("data", (chunk) => { serverOutput += chunk.toString(); });
  await waitForServer(baseUrl);
});

after(() => {
  server?.kill("SIGTERM");
});

test("server-renders the educational experience and safety context", async () => {
  const response = await fetch(baseUrl, { headers: { accept: "text/html" } });
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /Lower Motor Unit/);
  assert.match(html, /See how a motor signal becomes movement\./);
  assert.match(html, /Explore the full atlas/);
  assert.match(html, /Hero illustrative state/);
  assert.match(html, /One spinal lower motor unit · educational schematic · not to scale\./);
  assert.match(html, /Normal/);
  assert.match(html, /Compare/);
  assert.match(html, /Illustrative ALS-related changes/);
  assert.match(html, /These processes can overlap, occur in a different order, or be absent; this is not a clinical staging system/);
  assert.match(html, /Signal journey/);
  assert.match(html, /Anterior horn \(spinal cord\)/);
  assert.match(html, /Loss of effective motor-nerve contact with a muscle endplate/);
  assert.match(html, /Collateral sprouting from a surviving motor axon/);
  assert.match(html, /Reduction in muscle-fiber size/);
  assert.match(html, /one spinal alpha-motor-unit pathway/i);
  assert.match(html, /Evidence behind the experience/);
  assert.match(html, /not a diagnostic tool/i);
  assert.match(html, /og-monochrome\.png/);
  assert.match(html, /property="og:image:width" content="1200"/);
  assert.match(html, /property="og:image:height" content="630"/);
});

test("ships adaptive 3D, fallback, responsive accessibility, and Vercel paths", async () => {
  const [scene, model, hero, loop, fallback, experience, css, pkg, vercelIgnore] = await Promise.all([
    readFile(new URL("../components/MotorUnitScene.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/motor-unit-model.ts", import.meta.url), "utf8"),
    readFile(new URL("../components/CinematicMotorUnitHero.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/cinematic-loop.ts", import.meta.url), "utf8"),
    readFile(new URL("../components/MotorUnitFallback.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/MotorUnitExperience.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../.vercelignore", import.meta.url), "utf8"),
  ]);

  assert.match(scene, /new THREE\.WebGLRenderer/);
  assert.match(scene, /OrbitControls/);
  assert.match(scene, /deviceMemory/);
  assert.match(scene, /IntersectionObserver/);
  assert.match(scene, /renderer\.forceContextLoss/);
  assert.match(scene, /isHorizontalCompare/);
  assert.match(scene, /pauseSensitive/);
  assert.match(model, /structureId/);
  assert.match(model, /tag\(nmj, "nmj"\)/);
  assert.match(model, /export function createMotorUnit/);
  assert.match(hero, /cameraPoseAt/);
  assert.match(hero, /new THREE\.WebGLRenderer/);
  assert.match(hero, /renderer\.forceContextLoss/);
  assert.match(loop, /LOOP_DURATION_MS = 6000/);
  assert.match(loop, /export function cameraPoseAt/);
  assert.match(fallback, /<canvas/);
  assert.match(fallback, /drawSignal/);
  assert.match(fallback, /drawSelection/);
  assert.match(fallback, /NEIGHBORING SURVIVING MOTOR AXON/);
  assert.match(fallback, /fallback-panel-labels--compare/);
  assert.match(fallback, /\{!props\.loading && props\.labels !== false && \(\s*<p className="fallback-notice">/);
  assert.match(experience, /prefers-reduced-motion: reduce/);
  assert.match(experience, /canUseWebGL/);
  assert.match(experience, /Signal journey/);
  assert.match(experience, /Browse the anatomy index/);
  assert.match(experience, /mode === "compare" && !useFallback/);
  assert.doesNotMatch(experience, /window\.setTimeout/);
  assert.match(experience, /URLSearchParams[\s\S]*?"fallback"/);
  assert.match(css, /@media \(max-width: 620px\)/);
  assert.match(css, /@media \(orientation: landscape\) and \(max-height: 650px\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /touch-action:\s*none/);
  assert.match(css, /\.fallback-wrap\s*\{[\s\S]*?grid-template-rows/);
  assert.match(css, /\.scene-legend/);
  assert.match(css, /@container \(min-width: 820px\)/);
  assert.match(css, /\.comparison-scene-labels/);
  assert.match(pkg, /"build": "next build"/);
  assert.match(vercelIgnore, /\.openai/);
  await access(new URL("../public/og-monochrome.png", import.meta.url));
});
