"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { SceneController, SceneProps, ViewMode } from "./scene-types";
import {
  FOCUS_POINTS,
  applyUnitStage,
  createMotorUnit,
  updateCargo,
  updateSignal,
  type UnitRefs,
} from "./motor-unit-model";

type Engine = {
  healthy: UnitRefs;
  als: UnitRefs;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  cameraGoal: {
    position: THREE.Vector3;
    target: THREE.Vector3;
    active: boolean;
    pauseSensitive: boolean;
  };
  reset: () => void;
  focus: (id: string, options?: { journey?: boolean; immediate?: boolean }) => void;
  applyMode: () => void;
  replay: () => void;
};

function isHorizontalCompare() {
  return window.innerWidth >= 1320;
}

function wholeUnitCameraDistance(mode: ViewMode, aspect: number) {
  const safeAspect = Math.max(0.58, aspect);
  const halfFovTangent = Math.tan(THREE.MathUtils.degToRad(19));
  const horizontalCompare = mode === "compare" && isHorizontalCompare();
  const horizontalHalfSpan = mode === "compare"
    ? horizontalCompare ? 12.5 : 7.75
    : 10.6;
  const verticalHalfSpan = mode === "compare"
    ? horizontalCompare ? 2.9 : 4.65
    : 3.65;
  const horizontalFit = horizontalHalfSpan / (halfFovTangent * safeAspect);
  const verticalFit = verticalHalfSpan / halfFovTangent;
  return Math.max(mode === "compare" ? 18.8 : 18.5, horizontalFit, verticalFit);
}

function layoutUnits(engine: Engine, mode: ViewMode, stage: number) {
  const { healthy, als } = engine;
  healthy.root.visible = mode !== "als";
  als.root.visible = mode !== "normal";

  if (mode === "compare") {
    if (isHorizontalCompare()) {
      healthy.root.scale.setScalar(0.5);
      als.root.scale.setScalar(0.5);
      healthy.root.position.set(-5.7, 0, 0);
      als.root.position.set(5.7, 0, 0);
    } else {
      healthy.root.scale.setScalar(0.68);
      als.root.scale.setScalar(0.68);
      healthy.root.position.set(0, 2.45, 0);
      als.root.position.set(0, -2.45, 0);
    }
    applyUnitStage(healthy, 0);
    applyUnitStage(als, Math.max(1, stage));
    return;
  }

  const visible = mode === "normal" ? healthy : als;
  const hidden = mode === "normal" ? als : healthy;
  visible.root.scale.setScalar(0.96);
  visible.root.position.set(0, 0, 0);
  hidden.root.position.set(0, 0, 0);
  applyUnitStage(healthy, 0);
  applyUnitStage(als, Math.max(1, stage));
}

function resetCameraForMode(engine: Engine, mode: ViewMode, aspect: number, immediate = false) {
  const compact = window.innerWidth < 720 || aspect < 1.18;
  const distance = wholeUnitCameraDistance(mode, aspect);
  const position = mode === "compare"
    ? new THREE.Vector3(0.2, compact ? 1.5 : 0.9, distance)
    : new THREE.Vector3(0.2, compact ? 1.45 : 1.15, distance);
  const target = new THREE.Vector3(0, 0, 0);
  engine.cameraGoal.position.copy(position);
  engine.cameraGoal.target.copy(target);
  engine.cameraGoal.active = true;
  engine.cameraGoal.pauseSensitive = false;
  if (immediate) {
    engine.camera.position.copy(position);
    engine.controls.target.copy(target);
    engine.controls.update();
    engine.cameraGoal.active = false;
    engine.cameraGoal.pauseSensitive = false;
  }
}

export function MotorUnitScene(props: SceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef(props);
  const engineRef = useRef<Engine | null>(null);

  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
    const lowPower = window.innerWidth < 720 || memory <= 4 || navigator.hardwareConcurrency <= 4;
    const quality = lowPower ? 0 : 1;
    propsRef.current.onPerformanceProfile(lowPower ? "adaptive" : "full");

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 120);
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
    renderer.toneMappingExposure = 1.14;
    renderer.domElement.setAttribute(
      "aria-label",
      "Interactive schematic 3D spinal alpha motor unit. The soma lies in a spinal-cord ventral horn and its axon exits through a ventral root, enters a peripheral nerve, and reaches neuromuscular junctions and muscle. Drag to rotate, pinch or scroll to zoom, and use the structure buttons for guided camera views.",
    );
    container.append(renderer.domElement);
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      propsRef.current.onWebGLError();
    };
    renderer.domElement.addEventListener("webglcontextlost", handleContextLost);

    const ambient = new THREE.HemisphereLight(0xffffff, 0x202020, 2.35);
    const key = new THREE.DirectionalLight(0xffffff, 2.85);
    key.position.set(3, 8, 12);
    const rim = new THREE.DirectionalLight(0xbcbcb8, 1.1);
    rim.position.set(-8, -4, 8);
    scene.add(ambient, key, rim);

    const healthy = createMotorUnit(quality, lowPower);
    const als = createMotorUnit(quality, lowPower);
    scene.add(healthy.root, als.root);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !propsRef.current.reducedMotion;
    controls.dampingFactor = 0.075;
    controls.enablePan = false;
    controls.minDistance = 7.5;
    controls.maxDistance = 55;
    controls.minPolarAngle = Math.PI * 0.22;
    controls.maxPolarAngle = Math.PI * 0.78;

    const cameraGoal = {
      position: new THREE.Vector3(),
      target: new THREE.Vector3(),
      active: false,
      pauseSensitive: false,
    };

    const engine = {
      healthy,
      als,
      camera,
      controls,
      cameraGoal,
      reset: () => resetCameraForMode(
        engine,
        propsRef.current.mode,
        camera.aspect,
        propsRef.current.reducedMotion,
      ),
      focus: (id: string, options?: { journey?: boolean; immediate?: boolean }) => {
        const mode = propsRef.current.mode;
        const wholeUnit = id === "motor-unit";
        if (mode === "compare" && wholeUnit) {
          resetCameraForMode(engine, mode, camera.aspect, propsRef.current.reducedMotion);
          return;
        }
        const local = (FOCUS_POINTS[id] ?? FOCUS_POINTS["motor-unit"]).clone();
        const unit = mode === "normal" ? healthy : als;
        const world = unit.root.localToWorld(local);
        const compact = window.innerWidth < 720 || camera.aspect < 1.18;
        const distance = wholeUnit
          ? wholeUnitCameraDistance(mode, camera.aspect)
          : compact ? 14.2 : 10.8;
        cameraGoal.target.copy(world);
        cameraGoal.position.set(world.x + 0.25, world.y + 1.25, world.z + distance);
        cameraGoal.active = true;
        cameraGoal.pauseSensitive = options?.journey ?? false;
        if (propsRef.current.reducedMotion || options?.immediate) {
          camera.position.copy(cameraGoal.position);
          controls.target.copy(cameraGoal.target);
          cameraGoal.active = false;
          cameraGoal.pauseSensitive = false;
        }
      },
      applyMode: () => {
        const mode = propsRef.current.mode;
        const stage = propsRef.current.stage;
        layoutUnits(engine, mode, stage);
        resetCameraForMode(engine, mode, camera.aspect, propsRef.current.reducedMotion);
      },
      replay: () => {
        healthy.signalProgress = 0;
        als.signalProgress = 0;
      },
    } satisfies Engine;
    engineRef.current = engine;
    controls.addEventListener("start", () => {
      cameraGoal.active = false;
      cameraGoal.pauseSensitive = false;
    });

    const controller: SceneController = {
      focus: engine.focus,
      reset: engine.reset,
    };
    propsRef.current.onController(controller);

    const pointerStart = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const handlePointerDown = (event: PointerEvent) => {
      pointerStart.set(event.clientX, event.clientY);
    };
    const handlePointerUp = (event: PointerEvent) => {
      if (pointerStart.distanceTo(new THREE.Vector2(event.clientX, event.clientY)) > 7) return;
      const bounds = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const intersections = raycaster.intersectObjects([healthy.root, als.root], true);
      for (const intersection of intersections) {
        let object: THREE.Object3D | null = intersection.object;
        while (object && object !== scene) {
          if (object.userData.structureId) {
            propsRef.current.onSelect(object.userData.structureId as string);
            return;
          }
          object = object.parent;
        }
      }
    };
    renderer.domElement.addEventListener("pointerdown", handlePointerDown);
    renderer.domElement.addEventListener("pointerup", handlePointerUp);

    const resize = () => {
      const width = Math.max(1, container.clientWidth);
      const height = Math.max(1, container.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      layoutUnits(engine, propsRef.current.mode, propsRef.current.stage);
      if (!cameraGoal.active) resetCameraForMode(engine, propsRef.current.mode, camera.aspect, true);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();
    engine.applyMode();
    resetCameraForMode(engine, propsRef.current.mode, camera.aspect, true);

    let inView = true;
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
      },
      { rootMargin: "120px" },
    );
    intersectionObserver.observe(container);

    const clock = new THREE.Clock();
    let previousFrame = 0;
    let sampleStartedAt = performance.now();
    let sampledFrames = 0;
    let animationId = 0;
    const render = (time: number) => {
      animationId = requestAnimationFrame(render);
      if (!inView || document.hidden) return;
      // A steady cadence is preferable to bursty rendering for this slow, explanatory motion.
      const targetInterval = lowPower ? 1000 / 24 : 1000 / 45;
      if (time - previousFrame < targetInterval) return;
      previousFrame = time;
      const delta = Math.min(clock.getDelta(), 0.05);
      const current = propsRef.current;

      if (current.mode !== "als") {
        updateCargo(healthy, delta, current.playing, current.speed, current.reducedMotion);
        updateSignal(healthy, delta, current.playing, current.speed, current.reducedMotion, current.journey);
      }
      if (current.mode !== "normal") {
        updateCargo(als, delta, current.playing, current.speed, current.reducedMotion);
        updateSignal(als, delta, current.playing, current.speed, current.reducedMotion, current.journey);
      }

      controls.enableDamping = !current.reducedMotion && current.playing;
      if (cameraGoal.active && (!cameraGoal.pauseSensitive || current.playing)) {
        const amount = current.reducedMotion ? 1 : 0.085;
        camera.position.lerp(cameraGoal.position, amount);
        controls.target.lerp(cameraGoal.target, amount);
        if (camera.position.distanceTo(cameraGoal.position) < 0.025) {
          cameraGoal.active = false;
          cameraGoal.pauseSensitive = false;
        }
      }
      controls.update();
      renderer.render(scene, camera);
      sampledFrames += 1;
      if (time - sampleStartedAt >= 1000) {
        container.dataset.renderFps = Math.round((sampledFrames * 1000) / (time - sampleStartedAt)).toString();
        sampledFrames = 0;
        sampleStartedAt = time;
      }
    };
    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      renderer.domElement.removeEventListener("pointerup", handlePointerUp);
      renderer.domElement.removeEventListener("webglcontextlost", handleContextLost);
      controls.dispose();
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
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    engineRef.current?.applyMode();
  }, [props.mode, props.stage]);

  useEffect(() => {
    engineRef.current?.replay();
  }, [props.replayToken]);

  return <div className="three-mount" ref={containerRef} />;
}
