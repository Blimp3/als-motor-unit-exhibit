import assert from "node:assert/strict";
import { test } from "node:test";
import {
  HERO_CHAPTER_TIMES_MS,
  LOOP_DURATION_MS,
  advanceLoopClock,
  cameraPoseAt,
  createLoopClock,
  loopPhaseAt,
} from "../lib/cinematic-loop.ts";

test("loop duration is 6s and phase boundaries match the cinematic beats", () => {
  assert.equal(LOOP_DURATION_MS, 6000);

  assert.equal(loopPhaseAt(0), "whole");
  assert.equal(loopPhaseAt(1199), "whole");
  assert.equal(loopPhaseAt(1200), "push");
  assert.equal(loopPhaseAt(3499), "push");
  assert.equal(loopPhaseAt(3500), "isolation");
  assert.equal(loopPhaseAt(4499), "isolation");
  assert.equal(loopPhaseAt(4500), "return");
  assert.equal(loopPhaseAt(5999), "return");

  // Out-of-range times wrap into the loop.
  assert.equal(loopPhaseAt(6000), "whole");
  assert.equal(loopPhaseAt(6001), "whole");
  assert.equal(loopPhaseAt(-1), "return");
});

test("camera pose at the loop seam deep-equals the opening pose exactly", () => {
  assert.deepEqual(cameraPoseAt(LOOP_DURATION_MS), cameraPoseAt(0));
  // The frame just before the seam must already be nearly identical to the
  // opening frame, so wrapping produces no visible jump.
  const before = cameraPoseAt(LOOP_DURATION_MS - 1);
  const after = cameraPoseAt(0);
  for (const key of Object.keys(after) as (keyof typeof after)[]) {
    assert.ok(Math.abs(before[key] - after[key]) < 0.05, `${key} jumps across the seam`);
  }
});

test("camera poses are deterministic for repeated calls", () => {
  for (const timeMs of [0, 600, 1200, 2400, 3500, 4200, 4500, 5999, 6000, 12_345]) {
    assert.deepEqual(cameraPoseAt(timeMs), cameraPoseAt(timeMs));
    assert.equal(loopPhaseAt(timeMs), loopPhaseAt(timeMs));
  }
});

test("camera motion is continuous with no pose jumps, including across phase boundaries and the seam", () => {
  const STEP_MS = 16;
  const EPSILON = 0.4;
  let previous = cameraPoseAt(0);
  for (let timeMs = STEP_MS; timeMs <= LOOP_DURATION_MS; timeMs += STEP_MS) {
    const current = cameraPoseAt(timeMs);
    for (const key of Object.keys(current) as (keyof typeof current)[]) {
      const delta = Math.abs(current[key] - previous[key]);
      assert.ok(delta <= EPSILON, `${key} jumped ${delta} between ${timeMs - STEP_MS}ms and ${timeMs}ms`);
    }
    previous = current;
  }
});

test("exposure dips during isolation and returns to the opening value", () => {
  const openingExposure = cameraPoseAt(0).exposure;
  assert.ok(cameraPoseAt(4000).exposure < openingExposure);
  assert.equal(cameraPoseAt(LOOP_DURATION_MS).exposure, openingExposure);
});

test("advanceLoopClock advances and wraps modulo the loop duration", () => {
  let clock = createLoopClock(true);
  assert.deepEqual(clock, { timeMs: 0, playing: true });

  clock = advanceLoopClock(clock, 250);
  assert.equal(clock.timeMs, 250);

  clock = advanceLoopClock({ timeMs: 5900, playing: true }, 200);
  assert.equal(clock.timeMs, 100);

  clock = advanceLoopClock({ timeMs: 0, playing: true }, LOOP_DURATION_MS);
  assert.equal(clock.timeMs, 0);
});

test("paused clocks and non-positive deltas leave the clock unchanged", () => {
  const paused = createLoopClock(false);
  assert.equal(advanceLoopClock(paused, 5000), paused);

  const playing = advanceLoopClock(createLoopClock(true), 1234);
  assert.equal(advanceLoopClock(playing, 0), playing);
  assert.equal(advanceLoopClock(playing, -100), playing);

  // Resume keeps the frozen time and continues from it.
  const resumed = advanceLoopClock({ ...paused, playing: true }, 40);
  assert.equal(resumed.timeMs, 40);
  assert.equal(resumed.playing, true);
});

test("hero chapter seek targets cover all four structures within the loop", () => {
  assert.deepEqual(Object.keys(HERO_CHAPTER_TIMES_MS).sort(), ["axon", "cell-body", "junction", "muscle"]);
  for (const timeMs of Object.values(HERO_CHAPTER_TIMES_MS)) {
    assert.ok(timeMs >= 0 && timeMs <= LOOP_DURATION_MS, `chapter time ${timeMs} outside the loop`);
  }
  // Junction/muscle are wide-shot chapters, cell-body/axon are push chapters.
  assert.equal(loopPhaseAt(HERO_CHAPTER_TIMES_MS.junction), "whole");
  assert.equal(loopPhaseAt(HERO_CHAPTER_TIMES_MS.muscle), "whole");
  assert.equal(loopPhaseAt(HERO_CHAPTER_TIMES_MS.axon), "push");
  assert.equal(loopPhaseAt(HERO_CHAPTER_TIMES_MS["cell-body"]), "push");
});
