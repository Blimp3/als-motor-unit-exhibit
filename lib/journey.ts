import type { ViewMode } from "../components/scene-types";

export const JOURNEY_PHASE_DURATION_MS = 1700;

export const JOURNEY_PHASES = ["soma", "axon", "junction", "muscle"] as const;

export type JourneyPhase = "idle" | (typeof JOURNEY_PHASES)[number];

export type JourneyState = {
  active: boolean;
  phase: JourneyPhase;
  phaseIndex: number;
  elapsedMs: number;
  remainingMs: number;
  playing: boolean;
  speed: number;
  replayToken: number;
  mode: ViewMode;
  illustrativeState: number;
};

type JourneyContext = {
  mode: ViewMode;
  illustrativeState: number;
};

export function createJourneyState(
  context: JourneyContext,
  options: { playing?: boolean; speed?: number; replayToken?: number } = {},
): JourneyState {
  return {
    active: false,
    phase: "idle",
    phaseIndex: -1,
    elapsedMs: 0,
    remainingMs: JOURNEY_PHASE_DURATION_MS,
    playing: options.playing ?? true,
    speed: options.speed ?? 1,
    replayToken: options.replayToken ?? 0,
    mode: context.mode,
    illustrativeState: context.illustrativeState,
  };
}

export function startJourney(state: JourneyState, context: JourneyContext): JourneyState {
  return {
    ...state,
    active: true,
    phase: "soma",
    phaseIndex: 0,
    elapsedMs: 0,
    remainingMs: JOURNEY_PHASE_DURATION_MS,
    playing: true,
    replayToken: state.replayToken + 1,
    mode: context.mode,
    illustrativeState: context.illustrativeState,
  };
}

export function cancelJourney(state: JourneyState, context: JourneyContext): JourneyState {
  return {
    ...createJourneyState(context, {
      playing: state.playing,
      speed: state.speed,
      replayToken: state.replayToken + 1,
    }),
  };
}

export function setJourneyPlaying(state: JourneyState, playing: boolean): JourneyState {
  if (state.playing === playing) return state;
  return { ...state, playing };
}

export function setJourneySpeed(state: JourneyState, speed: number): JourneyState {
  const safeSpeed = Math.max(0.1, Math.min(2, speed));
  if (state.speed === safeSpeed) return state;
  return { ...state, speed: safeSpeed };
}

/**
 * Advances one pause-aware journey clock. There are no scheduled callbacks:
 * pausing simply prevents elapsed time, narrative phases, and camera targets
 * from changing, while resuming continues from the recorded remainder.
 */
export function advanceJourney(state: JourneyState, realDeltaMs: number): JourneyState {
  if (!state.active || !state.playing || realDeltaMs <= 0) return state;

  let remainingDelta = realDeltaMs * state.speed;
  let phaseIndex = state.phaseIndex;
  let elapsedMs = state.elapsedMs;
  let active: boolean = state.active;

  while (active && remainingDelta > 0) {
    const phaseRemaining = JOURNEY_PHASE_DURATION_MS - elapsedMs;
    if (remainingDelta < phaseRemaining) {
      elapsedMs += remainingDelta;
      remainingDelta = 0;
      break;
    }

    remainingDelta -= phaseRemaining;
    if (phaseIndex >= JOURNEY_PHASES.length - 1) {
      elapsedMs = JOURNEY_PHASE_DURATION_MS;
      active = false;
      break;
    }

    phaseIndex += 1;
    elapsedMs = 0;
  }

  return {
    ...state,
    active,
    phase: JOURNEY_PHASES[phaseIndex] ?? "idle",
    phaseIndex,
    elapsedMs,
    remainingMs: Math.max(0, JOURNEY_PHASE_DURATION_MS - elapsedMs),
  };
}

export function journeyPhaseProgress(state: JourneyState) {
  if (state.phase === "idle") return 0;
  return Math.max(0, Math.min(1, state.elapsedMs / JOURNEY_PHASE_DURATION_MS));
}

export function journeyRouteProgress(state: JourneyState) {
  if (state.phase === "idle") return null;
  const progress = journeyPhaseProgress(state);
  switch (state.phase) {
    case "soma":
      return progress * 0.04;
    case "axon":
      return 0.04 + progress * 0.64;
    case "junction":
      return 0.68 + progress * 0.22;
    case "muscle":
      return 0.9 + progress * 0.1;
    default:
      return null;
  }
}
