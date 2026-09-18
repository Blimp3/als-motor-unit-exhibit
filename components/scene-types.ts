export type ViewMode = "normal" | "als" | "compare";

export type JourneyVisualState = {
  active: boolean;
  phase: "idle" | "soma" | "axon" | "junction" | "muscle";
  progress: number;
  routeProgress: number | null;
};

export type SceneController = {
  focus: (
    structureId: string,
    options?: { journey?: boolean; immediate?: boolean },
  ) => void;
  reset: () => void;
};

export type SceneProps = {
  mode: ViewMode;
  stage: number;
  playing: boolean;
  speed: number;
  replayToken: number;
  reducedMotion: boolean;
  journey: JourneyVisualState;
  selectedStructure: string;
  onController: (controller: SceneController) => void;
  onSelect: (structureId: string) => void;
  onPerformanceProfile: (profile: "adaptive" | "full") => void;
  onWebGLError: () => void;
};
