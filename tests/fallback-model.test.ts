import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import {
  FALLBACK_STRUCTURE_ANCHORS,
  connectedFibersForState,
  fallbackSignalState,
  originalTerminalFibersForState,
} from "../lib/fallback-model.ts";

test("fallback stops an extensively degenerated route at its failure point", () => {
  const signal = fallbackSignalState(5, 0.94);
  assert.equal(signal.failed, true);
  assert.equal(signal.progress, 0.58);
  assert.equal(signal.reachesJunction, false);
  assert.equal(signal.reachesMuscle, false);
});

test("fallback encodes partial recruitment and separate collateral reinnervation", () => {
  assert.deepEqual(connectedFibersForState(2), [0, 2, 3]);
  assert.deepEqual(originalTerminalFibersForState(4), [0, 2]);
  assert.deepEqual(connectedFibersForState(4), [0, 2, 3, 4]);
});

test("fallback has a visible selection anchor for every interactive structure", async () => {
  const content = await import("../lib/content.ts");
  for (const structure of content.STRUCTURES) {
    assert.ok(FALLBACK_STRUCTURE_ANCHORS[structure.id], `${structure.label} needs a fallback callout anchor`);
  }
  const fallback = await readFile(new URL("../components/MotorUnitFallback.tsx", import.meta.url), "utf8");
  assert.match(fallback, /drawSelection/);
  assert.match(fallback, /data-selected-structure/);
  assert.match(fallback, /playing && !current\.reducedMotion/);
  assert.match(fallback, /replayToken/);
});

