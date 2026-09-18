import type { ViewMode } from "./scene-types";

export type HeroSceneProps = {
  mode: ViewMode; // "normal" | "als" | "compare"
  stage: number; // illustrative ALS state 0-5 (atlas semantics)
  playing: boolean;
  reducedMotion: boolean;
  seekTimeMs: number | null; // chapter seek target; null = free-running loop
  onWebGLError: () => void;
};
