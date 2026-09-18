"use client";

import { useEffect, useRef } from "react";
import {
  FALLBACK_STRUCTURE_ANCHORS,
  connectedFibersForState,
  fallbackSignalState,
  originalTerminalFibersForState,
} from "../lib/fallback-model";
import type { JourneyVisualState, ViewMode } from "./scene-types";

type Props = {
  mode: ViewMode;
  stage: number;
  playing: boolean;
  speed: number;
  replayToken: number;
  reducedMotion: boolean;
  selectedStructure: string;
  journey: JourneyVisualState;
  loading?: boolean;
  /** When false, paints anatomy only: no canvas text, reticle, panel labels, or
   * notice. Used by the hero, which supplies its own overlay copy and chrome. */
  labels?: boolean;
};

const palette = {
  ink: "#a9c6c0",
  inkBright: "#f2f1ec",
  soft: "#141a19",
  cord: "#1d2524",
  grayMatter: "#5f7a75",
  neuron: "#9fd8ce",
  nucleus: "#5f938b",
  myelin: "#8fbdb6",
  axon: "#7fc4bc",
  muscle: "#9fb2ba",
  stress: "#dd6b55",
  signal: "#f0ad4e",
  cargo: "#a68cf5",
  withdrawn: "#6e838a",
};

const FIBER_Y = [80, 116, 152, 188, 224];

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
}

function drawText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  align: CanvasTextAlign = "left",
) {
  const bounds = context.canvas.getBoundingClientRect();
  const deviceScale = bounds.width > 0 ? context.canvas.width / bounds.width : 1;
  const drawingScale = Math.max(0.01, Math.abs(context.getTransform().a) / deviceScale);
  context.fillStyle = palette.ink;
  context.font = `500 ${Math.max(13, 14 / drawingScale)}px system-ui, sans-serif`;
  context.textAlign = align;
  context.fillText(text, x, y);
}

function drawSpinalCord(context: CanvasRenderingContext2D, stage: number, compact: boolean, labels: boolean) {
  context.fillStyle = palette.cord;
  context.strokeStyle = palette.ink;
  context.lineWidth = 2;
  context.beginPath();
  context.ellipse(118, 154, 96, 122, 0, 0, Math.PI * 2);
  context.fill();
  context.stroke();

  // Simplified butterfly-shaped spinal gray matter with an identifiable ventral horn.
  context.fillStyle = palette.grayMatter;
  context.globalAlpha = 0.7;
  context.beginPath();
  context.moveTo(118, 143);
  context.bezierCurveTo(79, 102, 72, 63, 51, 63);
  context.bezierCurveTo(49, 105, 69, 135, 93, 153);
  context.bezierCurveTo(60, 175, 57, 230, 79, 245);
  context.bezierCurveTo(96, 229, 105, 190, 118, 169);
  context.bezierCurveTo(131, 190, 140, 229, 157, 245);
  context.bezierCurveTo(179, 230, 176, 175, 143, 153);
  context.bezierCurveTo(167, 135, 187, 105, 185, 63);
  context.bezierCurveTo(164, 63, 157, 102, 118, 143);
  context.fill();
  context.globalAlpha = 1;

  if (labels) {
    drawText(context, compact ? "SPINAL CORD" : "SPINAL CORD · GRAY MATTER", 28, 105);
  }
  context.strokeStyle = palette.ink;
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(74, 211);
  context.lineTo(39, 253);
  context.stroke();
  if (labels) {
    drawText(context, compact ? "VENTRAL HORN" : "ventral horn", 25, 270);
    if (!compact) drawText(context, "anterior / ventral", 118, 295, "center");
  }

  const somaScale = stage >= 5 ? 0.72 : 1;
  const somaX = 158;
  const somaY = 196;
  context.strokeStyle = palette.neuron;
  context.globalAlpha = stage >= 5 ? 0.34 : 0.9;
  context.lineWidth = 9;
  const dendriteEnds = [[92, 161], [83, 190], [91, 225], [121, 143], [123, 249]];
  dendriteEnds.forEach(([dx, dy]) => {
    context.beginPath();
    context.moveTo(somaX - 18, somaY);
    context.quadraticCurveTo(121, (dy + somaY) / 2, dx, dy);
    context.stroke();
  });
  context.globalAlpha = stage >= 5 ? 0.42 : 1;
  context.fillStyle = palette.neuron;
  context.beginPath();
  context.ellipse(somaX, somaY, 38 * somaScale, 31 * somaScale, -0.18, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = palette.nucleus;
  context.beginPath();
  context.arc(somaX - 4, somaY, 14 * somaScale, 0, Math.PI * 2);
  context.fill();
  context.globalAlpha = 1;

  if (stage >= 1) {
    context.fillStyle = palette.stress;
    for (let dot = 0; dot < 8; dot += 1) {
      context.beginPath();
      context.arc(somaX - 25 + (dot % 4) * 14, somaY - 20 + Math.floor(dot / 4) * 31, 3 + (dot % 2), 0, Math.PI * 2);
      context.fill();
    }
  }
}

function drawRootAndAxon(context: CanvasRenderingContext2D, stage: number, compact: boolean, labels: boolean) {
  context.strokeStyle = palette.axon;
  context.lineWidth = stage >= 5 ? 6 : 9;
  context.globalAlpha = stage >= 5 ? 0.42 : 1;
  context.setLineDash(stage >= 3 ? [43, 16, 11, 13] : []);
  context.beginPath();
  context.moveTo(190, 196);
  context.bezierCurveTo(221, 198, 224, 238, 270, 221);
  context.bezierCurveTo(300, 204, 302, 152, 342, 152);
  context.lineTo(748, 152);
  context.stroke();
  context.setLineDash([]);
  context.globalAlpha = 1;

  if (labels) {
    drawText(context, "VENTRAL ROOT", compact ? 320 : 205, compact ? 290 : 249);
    drawText(context, compact ? "AXON" : "PERIPHERAL NERVE", compact ? 420 : 315, 109);
  }
}

function drawMyelinAndCargo(
  context: CanvasRenderingContext2D,
  stage: number,
  motion: number,
) {
  for (let segment = 0; segment < 7; segment += 1) {
    const segmentX = 340 + segment * 56;
    roundedRect(context, segmentX, 135, 42, 34, 16);
    context.fillStyle = palette.myelin;
    context.globalAlpha = stage >= 5 ? 0.48 : 0.88;
    context.fill();
    context.fillStyle = palette.soft;
    context.beginPath();
    context.ellipse(segmentX + 29, 132, 7, 3, 0, 0, Math.PI * 2);
    context.fill();
  }
  context.globalAlpha = 1;

  const cargoCount = stage >= 3 ? 4 : 8;
  for (let cargo = 0; cargo < cargoCount; cargo += 1) {
    const direction = cargo % 2 === 0 ? 1 : -1;
    const position = ((motion * (stage >= 3 ? 0.28 : 1) * direction + cargo / cargoCount) % 1 + 1) % 1;
    const cargoX = 345 + position * 372;
    context.fillStyle = stage >= 1 && cargo % 3 === 0 ? palette.stress : palette.cargo;
    if (cargo % 4 === 0) {
      context.beginPath();
      context.ellipse(cargoX, 144 + direction * 8, 8, 4, 0, 0, Math.PI * 2);
      context.fill();
    } else if (cargo % 4 === 1) {
      context.fillRect(cargoX - 4, 153 + direction * 7, 8, 8);
    } else {
      context.beginPath();
      context.arc(cargoX, 151 + direction * 8, 4, 0, Math.PI * 2);
      context.fill();
    }
  }
}

function drawTerminalAndMuscle(
  context: CanvasRenderingContext2D,
  stage: number,
  muscleResponding: boolean,
  compact: boolean,
  labels: boolean,
) {
  const connected = connectedFibersForState(stage);
  const originalConnections = originalTerminalFibersForState(stage);
  FIBER_Y.forEach((fiber, index) => {
    const originalConnected = originalConnections.includes(index) && stage < 5;
    const withdrawn = !originalConnected;
    const terminalX = withdrawn ? (stage >= 3 ? 770 : 782) : 798;

    context.strokeStyle = withdrawn ? palette.withdrawn : palette.axon;
    context.lineWidth = 6;
    context.globalAlpha = withdrawn ? 0.7 : 1;
    if (withdrawn) context.setLineDash([11, 9]);
    context.beginPath();
    context.moveTo(747, 152);
    context.quadraticCurveTo(769, fiber, terminalX, fiber);
    context.stroke();
    context.setLineDash([]);
    context.beginPath();
    context.ellipse(terminalX, fiber, 9, 6, 0, 0, Math.PI * 2);
    context.fillStyle = withdrawn ? palette.withdrawn : palette.neuron;
    context.fill();
    context.globalAlpha = 1;

    // A visible synaptic cleft separates the presynaptic bouton from the postsynaptic endplate.
    context.strokeStyle = originalConnected ? palette.inkBright : palette.withdrawn;
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(807, fiber - 10);
    context.quadraticCurveTo(813, fiber, 807, fiber + 10);
    context.stroke();
    context.fillStyle = palette.soft;
    context.fillRect(800, fiber - 9, 5, 18);

    if (withdrawn) {
      context.strokeStyle = palette.inkBright;
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(788, fiber - 6);
      context.lineTo(798, fiber + 6);
      context.moveTo(798, fiber - 6);
      context.lineTo(788, fiber + 6);
      context.stroke();
    }

    const atrophy = stage >= 5 ? (index === 2 ? 0.72 : 0.48) : 1;
    const contraction = muscleResponding && connected.includes(index) ? 0.9 : 1;
    const muscleWidth = 160 * contraction;
    roundedRect(context, 817, fiber - 13 * atrophy, muscleWidth, 26 * atrophy, 13 * atrophy);
    context.fillStyle = muscleResponding && connected.includes(index) ? palette.inkBright : palette.muscle;
    context.globalAlpha = stage >= 5 ? 0.42 : connected.includes(index) ? 0.92 : 0.38;
    context.fill();
    context.globalAlpha = 1;
  });

  if (labels && stage >= 2) {
    drawText(context, compact ? "DENERVATED NMJ" : "DENERVATED", compact ? 970 : 815, compact ? 268 : 105, compact ? "right" : "left");
    context.strokeStyle = palette.ink;
    context.beginPath();
    context.moveTo(808, 108);
    context.lineTo(794, 116);
    context.stroke();
  }

  if (stage === 4 || stage === 5) {
    context.strokeStyle = palette.inkBright;
    context.lineWidth = 6;
    context.globalAlpha = stage === 5 ? 0.22 : 1;
    context.setLineDash([14, 7]);
    context.beginPath();
    context.moveTo(550, 302);
    context.bezierCurveTo(625, 274, 698, 255, 804, 188);
    context.moveTo(690, 248);
    context.quadraticCurveTo(746, 235, 804, 224);
    context.stroke();
    context.setLineDash([]);
    context.globalAlpha = 1;
    if (labels && compact) {
      drawText(context, "NEIGHBORING AXON → COLLATERAL", 970, 292, "right");
    } else if (labels) {
      drawText(context, "NEIGHBORING SURVIVING MOTOR AXON", 535, 288);
      drawText(context, "COLLATERAL REINNERVATION", 655, 271);
    }
  }

  if (labels && compact && stage < 2) drawText(context, "NMJ → MUSCLE", 970, 268, "right");
}

function signalPoint(progress: number) {
  if (progress < 0.06) return { x: 158 + progress / 0.06 * 35, y: 196 };
  if (progress < 0.2) {
    const part = (progress - 0.06) / 0.14;
    return { x: 193 + part * 149, y: 196 + Math.sin(part * Math.PI) * 34 - part * 44 };
  }
  if (progress < 0.68) return { x: 342 + (progress - 0.2) / 0.48 * 406, y: 152 };
  if (progress < 0.9) return { x: 748 + (progress - 0.68) / 0.22 * 64, y: 152 };
  return { x: 817 + (progress - 0.9) / 0.1 * 145, y: 152 };
}

function drawSignal(
  context: CanvasRenderingContext2D,
  stage: number,
  routeProgress: number,
  labels: boolean,
) {
  const signal = fallbackSignalState(stage, routeProgress);
  const point = signalPoint(signal.progress);
  context.fillStyle = palette.signal;
  context.beginPath();
  context.arc(point.x, point.y, 8, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = palette.signal;
  context.globalAlpha = 0.35;
  context.lineWidth = 2;
  context.beginPath();
  context.arc(point.x, point.y, 13, 0, Math.PI * 2);
  context.stroke();
  context.globalAlpha = 1;

  if (signal.failed) {
    context.strokeStyle = palette.inkBright;
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(point.x - 8, point.y - 8);
    context.lineTo(point.x + 8, point.y + 8);
    context.moveTo(point.x + 8, point.y - 8);
    context.lineTo(point.x - 8, point.y + 8);
    context.stroke();
    if (labels) drawText(context, "SIGNAL STOPS", point.x, point.y - 18, "center");
  }
}

function drawSelection(context: CanvasRenderingContext2D, selectedStructure: string, compact: boolean) {
  const anchor = FALLBACK_STRUCTURE_ANCHORS[selectedStructure] ?? FALLBACK_STRUCTURE_ANCHORS["motor-unit"];
  const radius = selectedStructure === "motor-unit" ? 30 : 22;
  context.fillStyle = palette.inkBright;
  context.globalAlpha = 0.12;
  context.beginPath();
  context.arc(anchor.x, anchor.y, radius, 0, Math.PI * 2);
  context.fill();
  context.globalAlpha = 1;
  context.strokeStyle = palette.inkBright;
  context.lineWidth = 4;
  context.beginPath();
  context.arc(anchor.x, anchor.y, radius, 0, Math.PI * 2);
  context.stroke();
  context.lineWidth = 2;
  context.setLineDash([5, 4]);
  context.beginPath();
  context.arc(anchor.x, anchor.y, radius + 8, 0, Math.PI * 2);
  context.stroke();
  context.setLineDash([]);
  context.beginPath();
  context.moveTo(anchor.x - radius - 12, anchor.y);
  context.lineTo(anchor.x - radius + 2, anchor.y);
  context.moveTo(anchor.x + radius - 2, anchor.y);
  context.lineTo(anchor.x + radius + 12, anchor.y);
  context.moveTo(anchor.x, anchor.y - radius - 12);
  context.lineTo(anchor.x, anchor.y - radius + 2);
  context.moveTo(anchor.x, anchor.y + radius - 2);
  context.lineTo(anchor.x, anchor.y + radius + 12);
  context.stroke();
  if (compact) return;
  context.beginPath();
  context.moveTo(anchor.x + 14, anchor.y - 14);
  context.lineTo(Math.min(970, anchor.x + 42), Math.max(20, anchor.y - 34));
  context.stroke();
  const label = selectedStructure.replaceAll("-", " ").toUpperCase();
  drawText(context, label, Math.min(970, anchor.x + 46), Math.max(18, anchor.y - 36));
}

function drawUnit(
  context: CanvasRenderingContext2D,
  bounds: { x: number; y: number; width: number; height: number },
  stage: number,
  _label: string,
  motion: number,
  routeProgress: number,
  selectedStructure: string,
  labels: boolean,
) {
  const { x, y, width, height } = bounds;
  const scale = Math.min(width / 1000, height / 310);
  const compact = scale < 0.58;
  const drawWidth = 1000 * scale;
  const drawHeight = 310 * scale;
  context.save();
  context.beginPath();
  context.rect(x, y, width, height);
  context.clip();
  context.translate(x + (width - drawWidth) / 2, y + (height - drawHeight) / 2);
  context.scale(scale, scale);
  context.lineCap = "round";
  context.lineJoin = "round";

  drawSpinalCord(context, stage, compact, labels);
  drawRootAndAxon(context, stage, compact, labels);
  drawMyelinAndCargo(context, stage, motion);
  const muscleResponding = fallbackSignalState(stage, routeProgress).reachesMuscle;
  drawTerminalAndMuscle(context, stage, muscleResponding, compact, labels);
  drawSignal(context, stage, routeProgress, labels);
  if (labels && stage >= 5) drawText(context, "ORIGINAL MOTOR UNIT LOST", 520, 55, "center");
  if (labels) drawSelection(context, selectedStructure, compact);
  context.restore();
}

export function MotorUnitFallback(props: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const propsRef = useRef(props);
  const motionRef = useRef(0);
  const lastFrameRef = useRef<number | null>(null);
  const drawRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    propsRef.current = props;
    drawRef.current?.();
  }, [props]);

  useEffect(() => {
    motionRef.current = 0;
    drawRef.current?.();
  }, [props.replayToken]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const draw = () => {
      const current = propsRef.current;
      const bounds = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const pixelWidth = Math.max(1, Math.round(bounds.width * dpr));
      const pixelHeight = Math.max(1, Math.round(bounds.height * dpr));
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
      }
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, bounds.width, bounds.height);

      const routeProgress = current.journey.routeProgress ?? motionRef.current % 1;
      const showLabels = current.labels !== false;
      if (current.mode === "compare") {
        const horizontal = bounds.width >= 820;
        if (horizontal) {
          const panelWidth = bounds.width / 2;
          drawUnit(context, { x: 0, y: 0, width: panelWidth, height: bounds.height }, 0, "Healthy", motionRef.current, routeProgress, current.selectedStructure, showLabels);
          context.strokeStyle = "#4f4f4c";
          context.beginPath();
          context.moveTo(panelWidth, 0);
          context.lineTo(panelWidth, bounds.height);
          context.stroke();
          drawUnit(context, { x: panelWidth, y: 0, width: panelWidth, height: bounds.height }, Math.max(1, current.stage), "ALS-affected", motionRef.current, routeProgress, current.selectedStructure, showLabels);
        } else {
          const panelHeight = bounds.height / 2;
          drawUnit(context, { x: 0, y: 0, width: bounds.width, height: panelHeight }, 0, "Healthy", motionRef.current, routeProgress, current.selectedStructure, showLabels);
          context.strokeStyle = "#4f4f4c";
          context.beginPath();
          context.moveTo(0, panelHeight);
          context.lineTo(bounds.width, panelHeight);
          context.stroke();
          drawUnit(context, { x: 0, y: panelHeight, width: bounds.width, height: panelHeight }, Math.max(1, current.stage), "ALS-affected", motionRef.current, routeProgress, current.selectedStructure, showLabels);
        }
      } else {
        drawUnit(
          context,
          { x: 0, y: 0, width: bounds.width, height: bounds.height },
          current.mode === "normal" ? 0 : Math.max(1, current.stage),
          current.mode === "normal" ? "Healthy" : "ALS-affected",
          motionRef.current,
          routeProgress,
          current.selectedStructure,
          showLabels,
        );
      }
    };

    drawRef.current = draw;
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);

    let animationId = 0;
    const animate = (time: number) => {
      const current = propsRef.current;
      if (lastFrameRef.current === null) lastFrameRef.current = time - 34;
      if (time - lastFrameRef.current < 32) {
        animationId = window.requestAnimationFrame(animate);
        return;
      }
      const delta = Math.min(64, time - lastFrameRef.current);
      lastFrameRef.current = time;
      if (current.playing && !current.reducedMotion) {
        motionRef.current = (motionRef.current + delta * 0.00012 * current.speed) % 1;
      }
      draw();
      animationId = window.requestAnimationFrame(animate);
    };
    draw();
    animationId = window.requestAnimationFrame(animate);
    return () => {
      window.cancelAnimationFrame(animationId);
      observer.disconnect();
      drawRef.current = null;
    };
  }, []);

  return (
    <div className="fallback-wrap" data-selected-structure={props.selectedStructure}>
      <div className="fallback-scene">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={`Simplified two-dimensional lower motor unit showing ${props.mode === "compare" ? "healthy and ALS-affected routes" : props.mode === "normal" ? "a healthy route" : `illustrative ALS-related state ${Math.max(1, props.stage)}`}. The selected structure is ${props.selectedStructure.replaceAll("-", " ")}.`}
        />
        {props.labels !== false && (
          <div className={`fallback-panel-labels${props.mode === "compare" ? " fallback-panel-labels--compare" : ""}`} aria-hidden="true">
            {props.mode === "compare" ? (
              <>
                <span>Healthy</span>
                <span>ALS-affected</span>
              </>
            ) : (
              <span>{props.mode === "normal" ? "Healthy" : "ALS-affected"}</span>
            )}
          </div>
        )}
      </div>
      {!props.loading && props.labels !== false && (
        <p className="fallback-notice">
          <strong>Schematic—not to scale.</strong> This simplified 2D view shows five muscle fibers as a small sample. Playback, Signal journey, structure highlighting, and the illustrative-state controls remain functional; rotation and zoom require WebGL.
        </p>
      )}
    </div>
  );
}
