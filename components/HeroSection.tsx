"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { HERO_CHAPTER_TIMES_MS } from "../lib/cinematic-loop";
import { STAGES } from "../lib/content";
import { MotorUnitFallback } from "./MotorUnitFallback";
import type { HeroSceneProps } from "./hero-types";
import type { JourneyVisualState, ViewMode } from "./scene-types";

const IDLE_JOURNEY: JourneyVisualState = {
  active: false,
  phase: "idle",
  progress: 0,
  routeProgress: null,
};

const MODE_CHOICES = [
  ["normal", "Normal"],
  ["als", "ALS"],
  ["compare", "Compare"],
] as const;

const CHAPTERS = [
  ["cell-body", "Cell body"],
  ["axon", "Axon"],
  ["junction", "Junction"],
  ["muscle", "Muscle"],
] as const;

type ChapterKey = (typeof CHAPTERS)[number][0];

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

function HeroPosterLoading() {
  return (
    <div className="scene-loading" role="status">
      <MotorUnitFallback
        mode="normal"
        stage={0}
        playing={false}
        speed={1}
        replayToken={0}
        reducedMotion
        selectedStructure="motor-unit"
        journey={IDLE_JOURNEY}
        labels={false}
        loading
      />
      <div className="scene-loading-label">
        <span aria-hidden="true" />
        Preparing the cinematic loop…
      </div>
    </div>
  );
}

const LazyCinematicHero = dynamic(
  () => import("./CinematicMotorUnitHero").then((module) => ({ default: module.CinematicMotorUnitHero })),
  { ssr: false, loading: () => <HeroPosterLoading /> },
);

export function HeroSection() {
  const [mode, setMode] = useState<ViewMode>("normal");
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [seekTimeMs, setSeekTimeMs] = useState<number | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [motionOptIn, setMotionOptIn] = useState(false);
  const [forceFallback, setForceFallback] = useState(false);
  const [webglFailed, setWebglFailed] = useState(false);

  const currentStage = STAGES[stage] ?? STAGES[0];
  const effectiveReducedMotion = reducedMotion && !motionOptIn;
  const effectivePlaying = playing && !effectiveReducedMotion;
  const useFallback = forceFallback || webglFailed;
  const statusText = !effectivePlaying
    ? "Motion paused"
    : mode === "normal"
      ? "Playing normal view, healthy motor unit"
      : `Playing ${mode === "als" ? "ALS" : "compare"} view, illustrative state ${stage}`;

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setReducedMotion(query.matches);
      if (query.matches) {
        setPlaying(false);
        setMotionOptIn(false);
      }
    };
    const frame = window.requestAnimationFrame(() => {
      const forcedByQuery = new URLSearchParams(window.location.search).get("fallback") === "1";
      setForceFallback(forcedByQuery || !canUseWebGL());
      update();
    });
    query.addEventListener?.("change", update);
    return () => {
      window.cancelAnimationFrame(frame);
      query.removeEventListener?.("change", update);
    };
  }, []);

  const handleWebGLError = useCallback(() => {
    setWebglFailed(true);
  }, []);

  const changeMode = (nextMode: ViewMode) => {
    if (nextMode === "normal") {
      setStage(0);
    } else if (nextMode === "als") {
      setStage((current) => (current < 1 ? 3 : current));
    } else {
      setStage((current) => (current < 3 ? 3 : current));
    }
    setMode(nextMode);
  };

  const changeStage = (value: number) => {
    const next = Math.max(0, Math.min(5, value));
    if (next === 0) {
      setMode("normal");
      setStage(0);
      return;
    }
    if (mode === "compare" && next < 3) setMode("als");
    setStage(next);
  };

  const togglePlayback = () => {
    if (effectiveReducedMotion) {
      setMotionOptIn(true);
      setPlaying(true);
      return;
    }
    setPlaying((current) => !current);
  };

  const seekToChapter = (key: ChapterKey) => {
    const time = HERO_CHAPTER_TIMES_MS[key];
    if (typeof time !== "number") return;
    setSeekTimeMs(null);
    window.requestAnimationFrame(() => setSeekTimeMs(time));
    if (!effectiveReducedMotion) setPlaying(true);
  };

  const sceneProps: HeroSceneProps = {
    mode,
    stage,
    playing: effectivePlaying,
    reducedMotion: effectiveReducedMotion,
    seekTimeMs,
    onWebGLError: handleWebGLError,
  };

  return (
    <header className="hero" id="top">
      <div className={`hero-stage hero-stage--${mode}`}>
        <div className="hero-scene">
          {useFallback ? (
            <MotorUnitFallback
              mode={mode}
              stage={stage}
              playing={effectivePlaying}
              speed={1}
              replayToken={0}
              reducedMotion={effectiveReducedMotion}
              selectedStructure="motor-unit"
              journey={IDLE_JOURNEY}
              labels={false}
            />
          ) : (
            <LazyCinematicHero {...sceneProps} />
          )}
        </div>
        {mode === "compare" && <div className="hero-compare-divider" aria-hidden="true" />}
        <div className="hero-scrim" aria-hidden="true" />

        <div className="hero-overlay">
          <nav className="site-nav hero-nav" aria-label="Primary navigation">
            <a className="wordmark" href="#top" aria-label="Lower Motor Unit home">
              <span aria-hidden="true">LMU</span>
              <span>Lower Motor Unit</span>
            </a>
            <div>
              <a href="#experience">3D model</a>
              <a href="#lesson">Key lesson</a>
              <a href="#glossary">Glossary</a>
              <a href="#sources">Sources</a>
            </div>
          </nav>

          {mode === "compare" && (
            <div className="hero-compare-labels" aria-hidden="true">
              <span>Normal</span>
              <span>Illustrative · {currentStage.short}</span>
            </div>
          )}

          <div className="hero-copy">
            <p className="kicker">Interactive 3D neuroanatomy</p>
            <h1>See how a motor signal becomes movement.</h1>
            <p className="hero-lede">
              Follow one spinal motor neuron from the ventral horn to muscle, then compare how ALS can disrupt the connected motor unit.
            </p>
            <p className="hero-note">One spinal lower motor unit · educational schematic · not to scale.</p>
            <p className="hero-scope">
              <strong>Scope:</strong> This schematic shows one spinal alpha-motor-unit pathway. Brainstem/bulbar lower motor neurons and upper-motor-neuron pathways are outside the displayed view.
            </p>
          </div>

          <div className="hero-controls">
            <div className="hero-mode" role="group" aria-label="Hero viewing mode">
              {MODE_CHOICES.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={mode === value ? "hero-mode-choice is-active" : "hero-mode-choice"}
                  aria-pressed={mode === value}
                  onClick={() => changeMode(value)}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="hero-play"
              aria-pressed={effectivePlaying}
              onClick={togglePlayback}
            >
              {effectivePlaying ? "Pause motion" : "Play motion"}
            </button>

            <div className="hero-state">
              <span className="hero-state-label" id="hero-state-label">Illustrative state</span>
              <input
                id="hero-stage-range"
                className="hero-state-range"
                type="range"
                min={0}
                max={5}
                step={1}
                value={stage}
                disabled={mode === "normal"}
                aria-label="Hero illustrative state"
                aria-valuetext={stage === 0 ? "Healthy" : `Illustrative state ${stage}: ${currentStage.short}`}
                onChange={(event) => changeStage(Number(event.target.value))}
              />
              <output className="hero-state-output" htmlFor="hero-stage-range">
                {currentStage.short}
              </output>
            </div>

            <div className="hero-chapters" role="group" aria-label="Hero chapter markers">
              {CHAPTERS.map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className="hero-chapter"
                  onClick={() => seekToChapter(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            <a className="hero-link hero-cta" href="#experience">
              Explore the full atlas <span aria-hidden="true">↓</span>
            </a>

            <p className="hero-status" role="status" aria-live="polite">
              {statusText}
            </p>
            {effectiveReducedMotion && (
              <p className="hero-motion-note">
                Reduced motion is active — the loop stays paused at the first frame until you choose Play motion.
              </p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
