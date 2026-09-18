// Deterministic ~6s ambient loop timeline for the cinematic hero.
// Pure module: no three.js, no React, no Date.now/Math.random — every value
// is a function of the loop clock so the same timeMs always yields the same
// frame and the seam between loops is invisible.

export const LOOP_DURATION_MS = 6000;

export type LoopPhase = "whole" | "push" | "isolation" | "return";

export type CameraPose = {
  px: number;
  py: number;
  pz: number;
  tx: number;
  ty: number;
  tz: number;
  fov: number;
  exposure: number;
};

export type LoopClock = {
  timeMs: number;
  playing: boolean;
};

export type HeroChapter = "cell-body" | "axon" | "junction" | "muscle";

// --- easing helpers (exported for reuse by the hero renderer) ---------------

export function clamp01(value: number): number {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

export function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

export function easeInCubic(t: number): number {
  const x = clamp01(t);
  return x * x * x;
}

export function easeOutCubic(t: number): number {
  const x = clamp01(t);
  return 1 - (1 - x) ** 3;
}

export function easeInOutCubic(t: number): number {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
}

// --- loop clock ---------------------------------------------------------------

/** Wraps any real time into [0, LOOP_DURATION_MS). */
export function normalizeLoopTime(timeMs: number): number {
  return ((timeMs % LOOP_DURATION_MS) + LOOP_DURATION_MS) % LOOP_DURATION_MS;
}

export function createLoopClock(playing: boolean): LoopClock {
  return { timeMs: 0, playing };
}

export function advanceLoopClock(clock: LoopClock, realDeltaMs: number): LoopClock {
  if (!clock.playing || realDeltaMs <= 0) {
    return clock;
  }
  return {
    timeMs: normalizeLoopTime(clock.timeMs + realDeltaMs),
    playing: clock.playing,
  };
}

// --- phases -------------------------------------------------------------------
// whole      0–1200ms   slow orbit of the whole motor unit
// push    1200–3500ms   macro-to-micro push through tissue toward the soma
// isolation 3500–4500ms field darkens, small isolated specimen on black
// return  4500–6000ms   specimen rotates/grows/slides back to the opening shot

export function loopPhaseAt(timeMs: number): LoopPhase {
  const t = normalizeLoopTime(timeMs);
  if (t < 1200) return "whole";
  if (t < 3500) return "push";
  if (t < 4500) return "isolation";
  return "return";
}

// --- camera -------------------------------------------------------------------
// The motor unit lies along the x-axis: soma/spinal cord near x=-5.4,
// junction/muscle near x=+5, all at y≈0. Motion is deliberately slow: small
// positional deltas, no roll, fov stays in a narrow 34–40 band, and exposure
// only dips while the field darkens for the isolation beat.

type PoseKeyframe = { timeMs: number; pose: CameraPose };

const OPENING_POSE: CameraPose = {
  px: 0,
  py: 2.2,
  pz: 16,
  tx: 0,
  ty: 0,
  tz: 0,
  fov: 40,
  exposure: 1,
};

const POSE_KEYFRAMES: PoseKeyframe[] = [
  // 0ms — opening wide composition; the exact frame the loop returns to.
  { timeMs: 0, pose: OPENING_POSE },
  // 1200ms — end of the slow orbit: drifted slightly right and down so the
  // distal (junction/muscle) end reads before the push begins.
  {
    timeMs: 1200,
    pose: { px: 2.4, py: 2.0, pz: 15.4, tx: 0.4, ty: 0, tz: 0, fov: 40, exposure: 1 },
  },
  // 3500ms — end of the push: close to the soma/proximal axon (x≈-5.4) for
  // the fluorescent cross-section moment; tighter fov, slightly dimmed.
  {
    timeMs: 3500,
    pose: { px: -3.2, py: 0.9, pz: 4.2, tx: -4.9, ty: 0.1, tz: 0, fov: 34, exposure: 0.85 },
  },
  // 4500ms — isolation: pulled back so the specimen sits small on black;
  // exposure bottoms out here.
  {
    timeMs: 4500,
    pose: { px: -2.0, py: 1.4, pz: 9.5, tx: -4.2, ty: 0, tz: 0, fov: 38, exposure: 0.55 },
  },
  // 6000ms — identical to the opening pose so the seam is invisible.
  { timeMs: LOOP_DURATION_MS, pose: OPENING_POSE },
];

export function cameraPoseAt(timeMs: number): CameraPose {
  const t = normalizeLoopTime(timeMs);
  let index = 0;
  while (index < POSE_KEYFRAMES.length - 2 && t >= POSE_KEYFRAMES[index + 1].timeMs) {
    index += 1;
  }
  const from = POSE_KEYFRAMES[index];
  const to = POSE_KEYFRAMES[index + 1];
  const eased = easeInOutCubic((t - from.timeMs) / (to.timeMs - from.timeMs));
  return {
    px: lerp(from.pose.px, to.pose.px, eased),
    py: lerp(from.pose.py, to.pose.py, eased),
    pz: lerp(from.pose.pz, to.pose.pz, eased),
    tx: lerp(from.pose.tx, to.pose.tx, eased),
    ty: lerp(from.pose.ty, to.pose.ty, eased),
    tz: lerp(from.pose.tz, to.pose.tz, eased),
    fov: lerp(from.pose.fov, to.pose.fov, eased),
    exposure: lerp(from.pose.exposure, to.pose.exposure, eased),
  };
}

// --- chapter seek targets -----------------------------------------------------

export const HERO_CHAPTER_TIMES_MS: Record<HeroChapter, number> = {
  // Mid "whole" phase (0–1200ms): the orbit has drifted toward +x, so the
  // neuromuscular junction at x≈+5 is most prominent in the wide frame.
  junction: 600,
  // Late "whole" phase: the widest, most distal-biased view before the push
  // starts — the muscle field beyond the junction reads best here.
  muscle: 1000,
  // Mid "push" phase (1200–3500ms): the camera is traveling through tissue
  // along the proximal axon, so the axon shaft dominates the frame.
  axon: 2400,
  // Late "push" phase: the camera has nearly arrived at x≈-5.4, the soma
  // fills the frame for the fluorescent cross-section moment.
  "cell-body": 3200,
};
