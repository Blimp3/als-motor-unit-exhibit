"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  applyUnitStage,
  createMotorUnit,
  updateCargo,
  updateSignal,
} from "./motor-unit-model";
import { advanceLoopClock, cameraPoseAt, createLoopClock, type LoopClock } from "../lib/cinematic-loop";
import type { JourneyVisualState } from "./scene-types";
import type { HeroSceneProps } from "./hero-types";

// The hero never drives a guided Signal journey: the pulse free-runs along the
// whole route so the loop stays ambient and deterministic.
const IDLE_JOURNEY: JourneyVisualState = {
  active: false,
  phase: "idle",
  progress: 0,
  routeProgress: null,
};

const PAGE_BACKGROUND = 0x07080a;

type HeroRig = {
  applyLayout: () => void;
  seek: (timeMs: number) => void;
  renderPoster: () => void;
};

function clampStage(stage: number) {
  return Math.max(0, Math.min(5, stage));
}

export function CinematicMotorUnitHero(props: HeroSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef(props);
  const rigRef = useRef<HeroRig | null>(null);

  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
    const lowPower = window.innerWidth < 720 || memory <= 4 || navigator.hardwareConcurrency <= 4;
    const quality = lowPower ? 0 : 1;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(PAGE_BACKGROUND, 17, 46);
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 140);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !lowPower,
        alpha: true,
        powerPreference: lowPower ? "low-power" : "high-performance",
      });
    } catch {
      propsRef.current.onWebGLError();
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, lowPower ? 1 : 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.domElement.setAttribute(
      "aria-label",
      "Ambient cinematic view of a simplified, illustrative spinal lower motor unit: a motor neuron cell body in the spinal cord, its axon, neuromuscular junctions, and muscle fibers. Decorative; not to scale and not diagnostic.",
    );
    container.append(renderer.domElement);
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      propsRef.current.onWebGLError();
    };
    renderer.domElement.addEventListener("webglcontextlost", handleContextLost);

    // Cool fluorescent key/rim against a near-black fog; no postprocessing.
    const ambient = new THREE.HemisphereLight(0x9fd8ce, 0x05070a, 1.5);
    const key = new THREE.DirectionalLight(0xf2f1ec, 2.2);
    key.position.set(3, 8, 12);
    const rim = new THREE.DirectionalLight(0x8fd8ce, 1.5);
    rim.position.set(-8, -4, 8);
    scene.add(ambient, key, rim);

    const healthy = createMotorUnit(quality, lowPower);
    const als = createMotorUnit(quality, lowPower);
    scene.add(healthy.root, als.root);

    // A restrained emissive pass gives the anatomy its fluorescent character on
    // the dark stage. The amber pulse and coral markers are already unlit
    // MeshBasicMaterials, so they read as self-illuminating under ACES.
    [healthy, als].forEach((unit) => {
      unit.root.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => {
            if (material instanceof THREE.MeshStandardMaterial) {
              material.emissive.copy(material.color).multiplyScalar(0.24);
            }
          });
        }
      });
    });

    // Deterministic loop clock: rAF deltas accumulate only while playing.
    let clock: LoopClock = createLoopClock(true);
    if (propsRef.current.seekTimeMs !== null) {
      clock = { ...clock, timeMs: propsRef.current.seekTimeMs };
    }

    const layoutUnits = () => {
      const { mode, stage } = propsRef.current;
      healthy.root.visible = mode !== "als";
      als.root.visible = mode !== "normal";

      if (mode === "compare") {
        // Always stack the pair: side by side the two collinear units read as
        // one continuous axon, so the comparison was illegible at any width.
        healthy.root.scale.setScalar(0.68);
        als.root.scale.setScalar(0.68);
        healthy.root.position.set(0, 2.45, 0);
        als.root.position.set(0, -2.45, 0);
      } else {
        const visible = mode === "normal" ? healthy : als;
        const hidden = mode === "normal" ? als : healthy;
        visible.root.scale.setScalar(0.96);
        visible.root.position.set(0, 0, 0);
        hidden.root.position.set(0, 0, 0);
      }
      applyUnitStage(healthy, 0);
      applyUnitStage(als, clampStage(stage));
    };

    const lookTarget = new THREE.Vector3();
    const applyCameraPose = () => {
      // Compare pins the camera to the wide opening pose: the pose track is
      // tuned for a single centered unit, so tracking it zoomed into the gap
      // between the two stacked units and cropped both out of frame.
      const compare = propsRef.current.mode === "compare";
      const pose = cameraPoseAt(compare ? 0 : clock.timeMs);
      camera.position.set(pose.px, pose.py, pose.pz);
      if (compare) camera.position.multiplyScalar(1.45); // frame both stacked units
      lookTarget.set(pose.tx, pose.ty, pose.tz);
      camera.lookAt(lookTarget);
      if (Math.abs(camera.fov - pose.fov) > 0.001) {
        camera.fov = pose.fov;
        camera.updateProjectionMatrix();
      }
      renderer.toneMappingExposure = pose.exposure;
    };

    const stepUnits = (deltaSeconds: number, playing: boolean, reducedMotion: boolean) => {
      const { mode } = propsRef.current;
      if (mode !== "als") {
        updateCargo(healthy, deltaSeconds, playing, 1, reducedMotion);
        updateSignal(healthy, deltaSeconds, playing, 1, reducedMotion, IDLE_JOURNEY);
      }
      if (mode !== "normal") {
        updateCargo(als, deltaSeconds, playing, 1, reducedMotion);
        updateSignal(als, deltaSeconds, playing, 1, reducedMotion, IDLE_JOURNEY);
      }
    };

    // Poster state: a single static frame at the current loop time, with all
    // animation frozen (delta 0, playing false) so positions stay deterministic.
    const renderPoster = () => {
      stepUnits(0, false, true);
      applyCameraPose();
      renderer.render(scene, camera);
    };

    rigRef.current = {
      applyLayout: () => {
        layoutUnits();
      },
      seek: (timeMs: number) => {
        clock = { ...clock, timeMs };
      },
      renderPoster,
    };

    const resize = () => {
      const width = Math.max(1, container.clientWidth);
      const height = Math.max(1, container.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      layoutUnits();
      const current = propsRef.current;
      if (!current.playing || current.reducedMotion) renderPoster();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    let inView = true;
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
      },
      { rootMargin: "80px" },
    );
    intersectionObserver.observe(container);

    resize();

    let previousFrame = 0;
    let animationId = 0;
    const render = (time: number) => {
      animationId = requestAnimationFrame(render);
      if (!inView || document.hidden) return;
      const current = propsRef.current;
      if (!current.playing || current.reducedMotion) return; // poster state
      const targetInterval = lowPower ? 1000 / 24 : 1000 / 45;
      if (time - previousFrame < targetInterval) return;
      const deltaMs = Math.min(previousFrame === 0 ? targetInterval : time - previousFrame, 50);
      previousFrame = time;

      clock = advanceLoopClock(clock, deltaMs);
      const deltaSeconds = Math.min(deltaMs / 1000, 0.05);
      stepUnits(deltaSeconds, true, false);
      applyCameraPose();
      renderer.render(scene, camera);
    };
    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      renderer.domElement.removeEventListener("webglcontextlost", handleContextLost);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
      rigRef.current = null;
    };
  }, []);

  // Layout/stage changes re-apply immediately; when paused they also re-render
  // the static poster frame so the canvas never shows stale state.
  useEffect(() => {
    rigRef.current?.applyLayout();
    if (!props.playing || props.reducedMotion) rigRef.current?.renderPoster();
  }, [props.mode, props.stage, props.playing, props.reducedMotion]);

  useEffect(() => {
    if (props.seekTimeMs === null) return;
    rigRef.current?.seek(props.seekTimeMs);
    if (!props.playing || props.reducedMotion) rigRef.current?.renderPoster();
  }, [props.seekTimeMs, props.playing, props.reducedMotion]);

  return <div className="hero-three-mount" ref={containerRef} />;
}
