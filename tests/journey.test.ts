import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import {
  JOURNEY_PHASE_DURATION_MS,
  advanceJourney,
  cancelJourney,
  createJourneyState,
  journeyPhaseProgress,
  setJourneyPlaying,
  setJourneySpeed,
  startJourney,
} from "../lib/journey.ts";

test("Pause prevents every journey phase and timing change", () => {
  let journey = startJourney(createJourneyState({ mode: "als", illustrativeState: 3 }), { mode: "als", illustrativeState: 3 });
  journey = advanceJourney(journey, 620);
  journey = setJourneyPlaying(journey, false);
  const frozen = journey;
  journey = advanceJourney(journey, JOURNEY_PHASE_DURATION_MS * 8);
  assert.deepEqual(journey, frozen);
});

test("Play resumes from remaining phase time and speed scales the same clock", () => {
  let journey = startJourney(createJourneyState({ mode: "normal", illustrativeState: 0 }), { mode: "normal", illustrativeState: 0 });
  journey = advanceJourney(journey, 800);
  assert.equal(journey.remainingMs, 900);
  journey = setJourneyPlaying(journey, false);
  journey = advanceJourney(journey, 30_000);
  journey = setJourneyPlaying(journey, true);
  journey = setJourneySpeed(journey, 0.5);
  journey = advanceJourney(journey, 1_798);
  assert.equal(journey.phase, "soma");
  journey = advanceJourney(journey, 4);
  assert.equal(journey.phase, "axon");
  assert.equal(journey.elapsedMs, 1);
});

test("Replay resets signal, camera phase, narrative phase, and replay token", () => {
  let journey = startJourney(createJourneyState({ mode: "als", illustrativeState: 2 }), { mode: "als", illustrativeState: 2 });
  journey = advanceJourney(journey, 2_400);
  assert.equal(journey.phase, "axon");
  const previousToken = journey.replayToken;
  journey = startJourney(journey, { mode: "als", illustrativeState: 2 });
  assert.equal(journey.phase, "soma");
  assert.equal(journey.elapsedMs, 0);
  assert.equal(journey.remainingMs, JOURNEY_PHASE_DURATION_MS);
  assert.equal(journey.replayToken, previousToken + 1);
  assert.equal(journeyPhaseProgress(journey), 0);
});

test("mode, state, and structure handlers cancel rather than queue a journey", async () => {
  let journey = startJourney(createJourneyState({ mode: "normal", illustrativeState: 0 }), { mode: "normal", illustrativeState: 0 });
  journey = cancelJourney(journey, { mode: "compare", illustrativeState: 4 });
  assert.equal(journey.phase, "idle");
  assert.equal(journey.active, false);
  assert.equal(journey.mode, "compare");
  assert.equal(journey.illustrativeState, 4);

  const source = await readFile(new URL("../components/MotorUnitExperience.tsx", import.meta.url), "utf8");
  assert.match(source, /const changeMode[\s\S]*?cancelJourney/);
  assert.match(source, /const changeStage[\s\S]*?cancelJourney/);
  assert.match(source, /const selectStructure[\s\S]*?cancelJourney/);
});

test("repeated journey starts replace one state and create no timer callbacks", async () => {
  let journey = createJourneyState({ mode: "als", illustrativeState: 4 });
  for (let click = 0; click < 12; click += 1) {
    journey = startJourney(journey, { mode: "als", illustrativeState: 4 });
  }
  assert.equal(journey.replayToken, 12);
  assert.equal(journey.phase, "soma");
  assert.equal(journey.elapsedMs, 0);

  const source = await readFile(new URL("../components/MotorUnitExperience.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(source, /setTimeout|clearTimeout|journeyTimers/);
  assert.match(source, /requestAnimationFrame/);
});

