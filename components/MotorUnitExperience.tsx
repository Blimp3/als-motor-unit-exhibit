"use client";

import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { STAGES, STRUCTURES } from "../lib/content";
import {
  advanceJourney,
  cancelJourney,
  createJourneyState,
  journeyPhaseProgress,
  journeyRouteProgress,
  setJourneyPlaying,
  setJourneySpeed,
  startJourney,
} from "../lib/journey";
import { MotorUnitFallback } from "./MotorUnitFallback";
import type { JourneyVisualState, SceneController, ViewMode } from "./scene-types";

const LazyMotorUnitScene = lazy(() =>
  import("./MotorUnitScene").then((module) => ({ default: module.MotorUnitScene })),
);

const STRUCTURE_GROUPS = [
  {
    label: "Neuron",
    ids: ["anterior-horn", "cell-body", "nucleus", "dendrites", "axon-hillock"],
  },
  {
    label: "Axon & transport",
    ids: ["axon", "myelin", "schwann-cell", "mitochondria", "transport"],
  },
  {
    label: "Junction & muscle",
    ids: ["terminal", "nmj", "acetylcholine", "muscle", "motor-unit"],
  },
  {
    label: "ALS processes",
    ids: ["denervation", "reinnervation", "atrophy"],
  },
] as const;

const MOBILE_STAGE_LABELS = ["Healthy", "Stress", "NMJ", "Axon", "Comp.", "Loss"];

type Capability = "checking" | "webgl" | "fallback";

type SceneLoadingProps = {
  mode: ViewMode;
  stage: number;
  message: string;
  selectedStructure: string;
};

const IDLE_JOURNEY: JourneyVisualState = {
  active: false,
  phase: "idle",
  progress: 0,
  routeProgress: null,
};

function SceneLoading({ mode, stage, message, selectedStructure }: SceneLoadingProps) {
  return (
    <div className="scene-loading" role="status">
      <MotorUnitFallback
        mode={mode}
        stage={stage}
        playing={false}
        speed={1}
        replayToken={0}
        reducedMotion
        selectedStructure={selectedStructure}
        journey={IDLE_JOURNEY}
        loading
      />
      <div className="scene-loading-label">
        <span aria-hidden="true" />
        {message}
      </div>
    </div>
  );
}

function canUseWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGL2RenderingContext && canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: true })
      || window.WebGLRenderingContext && canvas.getContext("webgl", { failIfMajorPerformanceCaveat: true }),
    );
  } catch {
    return false;
  }
}

export function MotorUnitExperience() {
  const [mode, setMode] = useState<ViewMode>("normal");
  const [stage, setStage] = useState(0);
  const [journey, setJourney] = useState(() => createJourneyState({ mode: "normal", illustrativeState: 0 }));
  const [selectedId, setSelectedId] = useState("motor-unit");
  const [capability, setCapability] = useState<Capability>("checking");
  const [forceFallback, setForceFallback] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [motionOptIn, setMotionOptIn] = useState(false);
  const [performanceProfile, setPerformanceProfile] = useState<"adaptive" | "full">("adaptive");
  const controllerRef = useRef<SceneController | null>(null);
  const journeyFrameRef = useRef<number | null>(null);

  const currentStage = STAGES[stage];
  const selected = useMemo(
    () => STRUCTURES.find((structure) => structure.id === selectedId)
      ?? STRUCTURES.find((structure) => structure.id === "motor-unit")
      ?? STRUCTURES[0],
    [selectedId],
  );
  const readyJourneyStatus = useMemo(() => {
    if (mode === "normal") {
      return "Ready: spinal motor-neuron cell body → axon → neuromuscular junction → muscle.";
    }
    if (mode === "compare") {
      return `Ready to compare: the healthy route remains intact while the ALS-affected route reflects ${STAGES[stage].short.toLowerCase()}.`;
    }
    return `Ready at illustrative state ${stage}: follow the signal to see where communication becomes inefficient or fails.`;
  }, [mode, stage]);
  const journeyStatus = useMemo(() => {
    if (journey.phase === "idle") return readyJourneyStatus;
    const illustrativeState = journey.mode === "normal" ? 0 : journey.illustrativeState;
    if (journey.phase === "soma") {
      return "Voluntary command: the spinal alpha motor neuron initiates an action potential.";
    }
    if (journey.phase === "axon") {
      return illustrativeState >= 3
        ? "Axon: the pulse travels through a route with distal degeneration and reduced reach."
        : "Axon: the electrical pulse propagates while cellular cargo moves on separate internal tracks.";
    }
    if (journey.phase === "junction") {
      return illustrativeState >= 5
        ? "Route failure: the pulse stops along the degenerating axon before reaching the terminal."
        : illustrativeState >= 2
          ? "Neuromuscular junction: only the remaining connected endplates receive effective input."
          : "Neuromuscular junction: the terminal releases acetylcholine across a stable synapse.";
    }
    if (illustrativeState >= 5) {
      return "Muscle: widespread denervation reduces recruitment and drives neurogenic atrophy.";
    }
    if (illustrativeState === 4) {
      return "Compensation: a collateral from a separate surviving neighboring motor axon temporarily restores input to some abandoned fibers.";
    }
    if (illustrativeState >= 2) {
      return "Muscle: fewer fibers activate together, so contraction is weaker and less coordinated.";
    }
    if (illustrativeState === 1) {
      return "Muscle: activation can remain largely preserved despite cellular stress.";
    }
    return "Muscle: coordinated activation produces contraction across the healthy motor unit.";
  }, [journey, readyJourneyStatus]);
  const effectiveReducedMotion = reducedMotion && !motionOptIn;
  const useFallback = forceFallback || capability === "fallback";
  const playing = journey.playing;
  const speed = journey.speed;
  const replayToken = journey.replayToken;
  const journeyVisual = useMemo<JourneyVisualState>(() => ({
    active: journey.active,
    phase: journey.phase,
    progress: journeyPhaseProgress(journey),
    routeProgress: journeyRouteProgress(journey),
  }), [journey]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setReducedMotion(query.matches);
      if (query.matches) {
        setJourney((current) => setJourneyPlaying(current, false));
        setMotionOptIn(false);
      }
    };
    const frame = window.requestAnimationFrame(() => {
      const forcedByQuery = new URLSearchParams(window.location.search).get("fallback") === "1";
      setCapability(forcedByQuery || !canUseWebGL() ? "fallback" : "webgl");
      if (forcedByQuery) setForceFallback(true);
      update();
    });
    query.addEventListener?.("change", update);
    return () => {
      window.cancelAnimationFrame(frame);
      query.removeEventListener?.("change", update);
    };
  }, []);

  useEffect(() => {
    if (!journey.active || !journey.playing || effectiveReducedMotion) return;
    let previous = performance.now();
    let accumulated = 0;
    const step = (time: number) => {
      const delta = Math.min(100, Math.max(0, time - previous));
      previous = time;
      accumulated += delta;
      if (accumulated >= 32) {
        const elapsed = accumulated;
        accumulated = 0;
        setJourney((current) => advanceJourney(current, elapsed));
      }
      journeyFrameRef.current = window.requestAnimationFrame(step);
    };
    journeyFrameRef.current = window.requestAnimationFrame(step);
    return () => {
      if (journeyFrameRef.current !== null) window.cancelAnimationFrame(journeyFrameRef.current);
      journeyFrameRef.current = null;
    };
  }, [journey.active, journey.playing, journey.replayToken, effectiveReducedMotion]);

  useEffect(() => {
    if (journey.phase === "idle") return;
    const destination = journey.phase === "soma"
      ? "cell-body"
      : journey.phase === "axon"
        ? "axon"
        : journey.phase === "junction"
          ? journey.illustrativeState >= 5 ? "axon" : journey.illustrativeState >= 2 ? "denervation" : "nmj"
          : journey.illustrativeState >= 5 ? "atrophy" : journey.illustrativeState === 4 ? "reinnervation" : "muscle";
    controllerRef.current?.focus(destination, {
      journey: true,
      immediate: effectiveReducedMotion,
    });
  }, [journey.phase, journey.replayToken, journey.illustrativeState, effectiveReducedMotion]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      controllerRef.current?.focus(selectedId);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [mode, selectedId, stage]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, button, select, textarea, a, summary")) return;
      if (event.key.toLowerCase() === "r") controllerRef.current?.reset();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const handleController = useCallback((controller: SceneController) => {
    controllerRef.current = controller;
  }, []);

  const handleWebGLFailure = useCallback(() => {
    setCapability("fallback");
    setForceFallback(true);
  }, []);

  const changeMode = (nextMode: ViewMode) => {
    const nextStage = nextMode === "normal" ? 0 : stage === 0 ? nextMode === "compare" ? 3 : 1 : stage;
    setJourney((current) => cancelJourney(current, { mode: nextMode, illustrativeState: nextStage }));
    setSelectedId("motor-unit");
    setMode(nextMode);
    setStage(nextStage);
  };

  const changeStage = (value: number) => {
    const next = Math.max(0, Math.min(5, value));
    const nextMode = next === 0 ? "normal" : mode === "normal" ? "als" : mode;
    setJourney((current) => cancelJourney(current, { mode: nextMode, illustrativeState: next }));
    setSelectedId("motor-unit");
    setStage(next);
    setMode(nextMode);
  };

  const selectStructure = useCallback((id: string) => {
    let nextStage = stage;
    let nextMode = mode;
    setSelectedId(id);
    if (id === "denervation" && stage < 2) {
      nextStage = 2;
      nextMode = "als";
    }
    if (id === "reinnervation" && stage !== 4) {
      nextStage = 4;
      nextMode = "als";
    }
    if (id === "atrophy" && stage !== 5) {
      nextStage = 5;
      nextMode = "als";
    }
    setJourney((current) => cancelJourney(current, { mode: nextMode, illustrativeState: nextStage }));
    setStage(nextStage);
    setMode(nextMode);
    controllerRef.current?.focus(id, { immediate: effectiveReducedMotion || !playing });
  }, [effectiveReducedMotion, mode, playing, stage]);

  const togglePlayback = () => {
    if (effectiveReducedMotion) {
      setMotionOptIn(true);
      setJourney((current) => setJourneyPlaying(current, true));
      return;
    }
    setJourney((current) => setJourneyPlaying(current, !current.playing));
  };

  const startSignalJourney = () => {
    if (effectiveReducedMotion) setMotionOptIn(true);
    setJourney((current) => startJourney(current, { mode, illustrativeState: stage }));
    controllerRef.current?.focus("cell-body", { journey: true, immediate: effectiveReducedMotion });
  };
  const replay = startSignalJourney;
  const signalJourney = startSignalJourney;

  return (
    <section className="experience" aria-labelledby="experience-title">
      <header className="experience-heading">
        <div>
          <p className="kicker">Interactive motor-unit atlas</p>
          <h2 id="experience-title">One connected system</h2>
        </div>
        <p>
          Rotate the model, follow a voluntary motor signal, and inspect how changes at one point can affect the entire path from spinal cord to muscle.
        </p>
      </header>

      <div className="experience-frame">
        <div className="control-deck">
          <fieldset className="mode-switch">
            <legend>Viewing mode</legend>
            <div className="mode-bar">
              {([
                ["normal", "Normal"],
                ["als", "ALS"],
                ["compare", "Compare"],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={mode === value ? "mode-choice is-active" : "mode-choice"}
                  aria-pressed={mode === value}
                  onClick={() => changeMode(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="timeline-panel">
            <div className="timeline-label">
              <label htmlFor="stage-range">Illustrative ALS-related changes</label>
              <output htmlFor="stage-range">
                <span>{stage === 0 ? "Healthy" : `Illustrative state ${stage}`}</span>
                {currentStage.short}
              </output>
            </div>
            <p className="timeline-caveat">
              These processes can overlap, occur in a different order, or be absent; this is not a clinical staging system.
            </p>
            <input
              id="stage-range"
              className="timeline-range"
              type="range"
              min="0"
              max="5"
              step="1"
              value={stage}
              aria-valuetext={`${stage === 0 ? "Healthy" : `Illustrative state ${stage}`}: ${currentStage.short}`}
              onChange={(event) => changeStage(Number(event.target.value))}
            />
            <ol className="timeline-ticks" aria-hidden="true">
              {STAGES.map((item) => (
                <li key={item.id} className={stage === item.id ? "is-current" : undefined}>
                  <span>{item.id === 0 ? "H" : item.id}</span>
                  <b data-mobile-label={MOBILE_STAGE_LABELS[item.id]}>{item.short}</b>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="viewer-grid">
          <div className="viewer-column">
            <div className={`scene-shell scene-shell--${mode}${useFallback ? " is-fallback" : ""}`}>
              <div className="scene-hud scene-hud--left">
                <span>Focus</span>
                <strong>{selected.label}</strong>
              </div>
              <div className="scene-hud scene-hud--right">
                <span>{mode === "normal" ? "Healthy motor unit" : mode === "als" ? `ALS · State ${stage}` : `Compare · State ${Math.max(1, stage)}`}</span>
                <strong>{playing && !effectiveReducedMotion ? `${speed}× motion` : "Paused"}</strong>
              </div>
              {mode === "compare" && !useFallback && (
                <div className="comparison-scene-labels" aria-hidden="true">
                  <span>Healthy</span>
                  <span>ALS-affected</span>
                </div>
              )}
              {!useFallback && mode !== "normal" && stage >= 4 && (
                <div className="collateral-label">
                  {stage >= 5
                    ? "Faded original pathway: motor unit lost; the separate neighboring axon can no longer compensate fully"
                    : "Collateral from a separate surviving neighboring motor axon"}
                </div>
              )}
              {capability === "checking" ? (
                <SceneLoading mode={mode} stage={stage} selectedStructure={selectedId} message="Checking 3D support…" />
              ) : useFallback ? (
                <MotorUnitFallback
                  mode={mode}
                  stage={stage}
                  playing={playing}
                  speed={speed}
                  replayToken={replayToken}
                  reducedMotion={effectiveReducedMotion}
                  selectedStructure={selectedId}
                  journey={journeyVisual}
                />
              ) : (
                <Suspense fallback={<SceneLoading mode={mode} stage={stage} selectedStructure={selectedId} message="Preparing interactive anatomy…" />}>
                  <LazyMotorUnitScene
                    mode={mode}
                    stage={stage}
                    playing={playing}
                    speed={speed}
                    replayToken={replayToken}
                    reducedMotion={effectiveReducedMotion}
                    journey={journeyVisual}
                    selectedStructure={selectedId}
                    onController={handleController}
                    onSelect={selectStructure}
                    onPerformanceProfile={setPerformanceProfile}
                    onWebGLError={handleWebGLFailure}
                  />
                </Suspense>
              )}
            </div>

            {!useFallback && capability !== "checking" && (
              <div className="scene-anatomy-caption">
                <span>Schematic—not to scale</span>
                <span>Spinal cord · gray matter · ventral horn · ventral root · peripheral nerve</span>
                <span>Five fibers shown; a small sample of a motor unit</span>
              </div>
            )}

            {mode === "compare" && (
              <ul className="scene-legend" aria-label="Comparison scene legend">
                <li><i className="legend-intact" aria-hidden="true" />Intact contact</li>
                <li><i className="legend-failing" aria-hidden="true" />Failing or withdrawn branch</li>
                <li><i className="legend-collateral" aria-hidden="true" />Collateral reinnervation</li>
                <li><i className="legend-atrophy" aria-hidden="true" />Atrophy</li>
                <li><i className="legend-signal" aria-hidden="true" />Signal pulse</li>
              </ul>
            )}

            <div className="playback-controls" aria-label="Animation and camera controls">
              <button type="button" className="control control--primary" onClick={togglePlayback}>
                {playing && !effectiveReducedMotion ? "Pause" : effectiveReducedMotion ? "Enable & play" : "Play"}
              </button>
              <button type="button" className="control control--journey" onClick={signalJourney}>
                Signal journey
              </button>
              <button type="button" className="control" onClick={replay}>Replay</button>
              <button type="button" className="control control--step" onClick={() => changeStage(stage - 1)} disabled={stage === 0}>
                Previous
              </button>
              <button type="button" className="control control--step" onClick={() => changeStage(stage + 1)} disabled={stage === 5}>
                Next
              </button>
              <label className="speed-control">
                <span>Speed</span>
                <select value={speed} onChange={(event) => setJourney((current) => setJourneySpeed(current, Number(event.target.value)))}>
                  <option value={0.25}>0.25×</option>
                  <option value={0.5}>0.5×</option>
                  <option value={1}>1×</option>
                </select>
              </label>
              {!useFallback && (
                <button type="button" className="control" onClick={() => controllerRef.current?.reset()}>
                  Reset view
                </button>
              )}
            </div>

            <div className="scene-meta">
              <div className="scene-instructions" aria-label={useFallback ? "2D interaction instructions" : "3D interaction instructions"}>
                {!useFallback && <span>Drag to rotate</span>}
                {!useFallback && <span>Pinch or scroll to zoom</span>}
                <span>Select anatomy to focus</span>
                {useFallback && <span>Playback and Signal journey remain active</span>}
              </div>
              <span className="scene-profile">
                {useFallback ? "2D fallback" : performanceProfile === "full" ? "Full 3D quality" : "Adaptive 3D quality"}
              </span>
            </div>

            <div className="journey-status" role="status" aria-live="polite">
              <span>Signal journey</span>
              <p>{journeyStatus}</p>
            </div>

            {effectiveReducedMotion && (
              <p className="motion-message" role="status">
                Reduced motion is active. Camera changes are immediate and animation remains paused until you choose Enable & play.
              </p>
            )}

            {capability === "webgl" && (
              <button type="button" className="fallback-toggle" onClick={() => setForceFallback((value) => !value)}>
                {forceFallback ? "Return to interactive 3D" : "Use simplified 2D view"}
              </button>
            )}
          </div>

          <aside className="context-panel" aria-label="Current illustrative state and selected structure">
            <div className="stage-summary" aria-live="polite">
              <div className="stage-summary-copy">
                <p>{currentStage.eyebrow}</p>
                <h3>{currentStage.title}</h3>
                <span>{currentStage.summary}</span>
              </div>
              <dl>
                <div><dt>Connection</dt><dd>{currentStage.connection}</dd></div>
                <div><dt>Signal</dt><dd>{currentStage.signal}</dd></div>
                <div><dt>Motor unit</dt><dd>{currentStage.unit}</dd></div>
              </dl>
            </div>

            {mode === "compare" && (
              <section className="comparison-inline" aria-labelledby="comparison-inline-title">
                <h3 id="comparison-inline-title">Healthy and ALS-affected</h3>
                <div>
                  <article>
                    <span>Healthy</span>
                    <ul>
                      <li>Stable neuromuscular contact</li>
                      <li>Effective bidirectional transport</li>
                      <li>Reliable recruitment</li>
                      <li>Preserved muscle mass</li>
                    </ul>
                  </article>
                  <article>
                    <span>ALS-affected</span>
                    <ul>
                      <li>Neuron, axon, and terminal degeneration</li>
                      <li>Denervation and reduced recruitment</li>
                      <li>Temporary collateral reinnervation</li>
                      <li>Weakness and neurogenic atrophy</li>
                    </ul>
                  </article>
                </div>
              </section>
            )}

            <article className="structure-detail" aria-live="polite">
              <header>
                <span>{selected.category}</span>
                <h3>{selected.label}</h3>
              </header>
              <div>
                <section>
                  <h4>{selected.definition ? "Definition" : "Normal role"}</h4>
                  <p>{selected.definition ?? selected.normal}</p>
                </section>
                <section>
                  <h4>{selected.definition ? "ALS context" : "How ALS may affect it"}</h4>
                  <p>{selected.als}</p>
                </section>
              </div>
            </article>

            <div className="scope-note" role="note" aria-label="Scope of this visualization">
              <span>Scope</span>
              <p>
                This model shows one spinal alpha-motor-unit pathway. ALS can affect both upper and lower motor neurons; brainstem/bulbar lower motor neurons and upper-motor-neuron pathways are outside the displayed view.
              </p>
            </div>
          </aside>
        </div>

        <details className="structure-index">
          <summary>
            <span>
              <small>Guided camera</small>
              Browse the anatomy index
            </span>
            <b>{STRUCTURES.length} structures</b>
          </summary>
          <div className="structure-groups" aria-label="Anatomical structure labels">
            {STRUCTURE_GROUPS.map((group) => (
              <section key={group.label}>
                <h3>{group.label}</h3>
                <div>
                  {group.ids.map((id) => {
                    const structure = STRUCTURES.find((item) => item.id === id);
                    if (!structure) return null;
                    return (
                      <button
                        key={structure.id}
                        type="button"
                        className={selectedId === structure.id ? "structure-chip is-active" : "structure-chip"}
                        aria-pressed={selectedId === structure.id}
                        onClick={() => selectStructure(structure.id)}
                      >
                        {structure.label}
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </details>
      </div>
    </section>
  );
}
