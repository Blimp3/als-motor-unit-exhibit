export type Point = { x: number; y: number };

export const FALLBACK_STRUCTURE_ANCHORS: Record<string, Point> = {
  "anterior-horn": { x: 110, y: 177 },
  "cell-body": { x: 178, y: 151 },
  nucleus: { x: 172, y: 151 },
  dendrites: { x: 75, y: 112 },
  "axon-hillock": { x: 235, y: 151 },
  axon: { x: 480, y: 151 },
  myelin: { x: 420, y: 151 },
  "schwann-cell": { x: 420, y: 132 },
  mitochondria: { x: 365, y: 144 },
  transport: { x: 515, y: 158 },
  terminal: { x: 792, y: 151 },
  nmj: { x: 812, y: 151 },
  acetylcholine: { x: 807, y: 151 },
  muscle: { x: 900, y: 151 },
  "motor-unit": { x: 520, y: 151 },
  denervation: { x: 800, y: 113 },
  reinnervation: { x: 727, y: 218 },
  atrophy: { x: 900, y: 218 },
};

export function connectedFibersForState(illustrativeState: number) {
  if (illustrativeState <= 1) return [0, 1, 2, 3, 4];
  if (illustrativeState === 2) return [0, 2, 3];
  if (illustrativeState === 3) return [0, 2];
  if (illustrativeState === 4) return [0, 2, 3, 4];
  return [];
}

export function originalTerminalFibersForState(illustrativeState: number) {
  if (illustrativeState === 4) return [0, 2];
  return connectedFibersForState(illustrativeState);
}

export function fallbackSignalState(illustrativeState: number, routeProgress: number | null) {
  const requestedProgress = routeProgress ?? 0.45;
  const failureProgress = 0.58;
  const failed = illustrativeState >= 5 && requestedProgress >= failureProgress;
  return {
    progress: failed ? failureProgress : Math.max(0, Math.min(1, requestedProgress)),
    failed,
    reachesJunction: illustrativeState < 5 && requestedProgress >= 0.68,
    reachesMuscle: illustrativeState < 5 && requestedProgress >= 0.9,
  };
}

