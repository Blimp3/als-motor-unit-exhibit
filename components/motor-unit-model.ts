import * as THREE from "three";
import type { JourneyVisualState } from "./scene-types";

// Pure (non-React) procedural Three.js model for the spinal lower motor unit.
// Shared by the interactive atlas (`MotorUnitScene.tsx`) and the cinematic hero
// (`CinematicMotorUnitHero.tsx`) so both render the same illustrative anatomy.
// All geometry is generated in code — no external assets. Colors follow the
// cinematic palette: sea-glass cyan anatomy, amber electrical pulse, violet
// intracellular cargo, muted coral ALS stress/loss accents, pale slate muscle.
// Loss is always shown via opacity/scale/visibility/fragmentation as well —
// color is never the only cue.

export type CargoRef = {
  mesh: THREE.Object3D;
  progress: number;
  direction: 1 | -1;
  speed: number;
  lane: number;
  kind: "mitochondria" | "protein" | "vesicle" | "rna";
};

export type UnitRefs = {
  root: THREE.Group;
  soma: THREE.Mesh;
  somaMaterial: THREE.MeshStandardMaterial;
  nucleus: THREE.Mesh;
  dendrites: THREE.Group;
  dendriteMaterial: THREE.MeshStandardMaterial;
  hillock: THREE.Group;
  axonCurve: THREE.CatmullRomCurve3;
  axonSegments: THREE.Mesh[];
  myelin: THREE.Group;
  schwann: THREE.Group;
  terminals: THREE.Group[];
  terminalMaterials: THREE.MeshStandardMaterial[];
  endplates: THREE.Group[];
  denervationMarkers: THREE.Group[];
  muscles: THREE.Group[];
  muscleMaterials: THREE.MeshStandardMaterial[];
  cargo: CargoRef[];
  cargoMaterials: Record<CargoRef["kind"], THREE.MeshStandardMaterial>;
  aggregates: THREE.Group;
  stressHalo: THREE.Mesh;
  acetylcholine: THREE.Group[];
  collateral: THREE.Group;
  collateralPulse: THREE.Mesh;
  signalPulse: THREE.Mesh;
  failureMarker: THREE.Group;
  motorUnitStage: number;
  signalProgress: number;
};

export const COLORS = {
  neuron: 0x9fd8ce,
  neuronLight: 0xcdf0e9,
  neuronDeep: 0x4f7d76,
  nucleus: 0x5f938b,
  axon: 0x7fc4bc,
  myelin: 0x6b9a93,
  myelinLight: 0x93c6be,
  muscle: 0x9fb2ba,
  musclePale: 0xc2d1d7,
  signal: 0xf0ad4e,
  transportOut: 0xa68cf5,
  transportBack: 0x7a68b8,
  stress: 0xdd6b55,
  reinnervation: 0xd8f4ee,
};

export const FOCUS_POINTS: Record<string, THREE.Vector3> = {
  "anterior-horn": new THREE.Vector3(-7.45, -0.25, -0.55),
  "cell-body": new THREE.Vector3(-7.1, 0, 0),
  nucleus: new THREE.Vector3(-7.05, 0.05, 0.45),
  dendrites: new THREE.Vector3(-9.15, 0.1, 0),
  "axon-hillock": new THREE.Vector3(-5.8, 0, 0),
  axon: new THREE.Vector3(-1.2, 0, 0),
  myelin: new THREE.Vector3(-1.0, 0, 0),
  "schwann-cell": new THREE.Vector3(-0.8, 0.48, 0.15),
  mitochondria: new THREE.Vector3(-2.1, 0, 0.2),
  transport: new THREE.Vector3(-1.4, 0, 0),
  terminal: new THREE.Vector3(5.25, 0, 0),
  nmj: new THREE.Vector3(6.25, 0, 0),
  acetylcholine: new THREE.Vector3(6.35, 0, 0),
  muscle: new THREE.Vector3(8.3, 0, 0),
  "motor-unit": new THREE.Vector3(0, 0, 0),
  denervation: new THREE.Vector3(6.1, -1.0, 0),
  reinnervation: new THREE.Vector3(4.8, -2.15, 0),
  atrophy: new THREE.Vector3(8.4, -1.4, 0),
};

export function tag(object: THREE.Object3D, structureId: string) {
  object.userData.structureId = structureId;
  return object;
}

export function makeMaterial(
  color: number,
  roughness = 0.62,
  metalness = 0.02,
  opacity = 1,
) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness,
    transparent: opacity < 1,
    opacity,
  });
}

export function makeTube(
  points: THREE.Vector3[],
  radius: number,
  material: THREE.Material,
  quality: number,
) {
  const curve = new THREE.CatmullRomCurve3(points);
  const geometry = new THREE.TubeGeometry(
    curve,
    quality > 0 ? 18 : 9,
    radius,
    quality > 0 ? 8 : 5,
    false,
  );
  return new THREE.Mesh(geometry, material);
}

export function makeCapsule(length: number, radius: number, material: THREE.Material, quality: number) {
  const group = new THREE.Group();
  const radial = quality > 0 ? 16 : 9;
  const cylinder = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, length, radial, 1, false),
    material,
  );
  cylinder.rotation.z = Math.PI / 2;
  group.add(cylinder);

  const endGeometry = new THREE.SphereGeometry(radius, radial, Math.max(6, radial / 2));
  const left = new THREE.Mesh(endGeometry, material);
  const right = new THREE.Mesh(endGeometry, material);
  left.position.x = -length / 2;
  right.position.x = length / 2;
  group.add(left, right);
  return group;
}

export function makeMitochondrion(material: THREE.Material, quality: number) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.13, quality > 0 ? 12 : 8, quality > 0 ? 8 : 6),
    material,
  );
  body.scale.set(1.75, 0.72, 0.72);
  group.add(body);
  const cristaMaterial = new THREE.MeshBasicMaterial({ color: 0x4a3f6e });
  const crista = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.012, 5, 9), cristaMaterial);
  crista.rotation.y = Math.PI / 2;
  group.add(crista);
  return group;
}

export function makeRna(material: THREE.Material, quality: number) {
  const points = Array.from({ length: 9 }, (_, i) =>
    new THREE.Vector3((i - 4) * 0.035, Math.sin(i * 1.8) * 0.05, 0),
  );
  return makeTube(points, 0.012, material, quality);
}

export function setMaterialOpacity(material: THREE.Material, opacity: number) {
  if (!(material instanceof THREE.MeshStandardMaterial) && !(material instanceof THREE.MeshBasicMaterial)) return;
  material.transparent = opacity < 0.999;
  material.opacity = opacity;
  material.depthWrite = opacity > 0.75;
}

export function makeSpinalCordContext(quality: number) {
  const group = new THREE.Group();
  const cordMaterial = makeMaterial(0x63787f, 0.9, 0, 0.2);
  const cord = new THREE.Mesh(
    new THREE.CylinderGeometry(2.62, 2.62, 0.3, quality > 0 ? 40 : 22),
    cordMaterial,
  );
  cord.rotation.x = Math.PI / 2;
  cord.position.set(-7.45, 0, -0.92);
  group.add(cord);

  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(2.62, 0.035, 6, quality > 0 ? 48 : 24),
    new THREE.MeshBasicMaterial({ color: 0x93a8ae, transparent: true, opacity: 0.68 }),
  );
  rim.position.set(-7.45, 0, -0.73);
  group.add(rim);

  // Four restrained lobes and a commissure make the spinal gray matter recognizable
  // without turning the schematic into a diagnostic atlas.
  const grayMatterMaterial = makeMaterial(0x46565c, 0.92, 0, 0.58);
  const commissure = makeCapsule(1.35, 0.24, grayMatterMaterial, quality);
  commissure.position.set(-7.45, 0, -0.68);
  commissure.scale.z = 0.28;
  group.add(commissure);
  const lobeGeometry = new THREE.SphereGeometry(0.92, quality > 0 ? 18 : 11, quality > 0 ? 12 : 8);
  const lobes = [
    { x: -8.18, y: 0.78, sx: 0.42, sy: 1.12, rotation: 0.42 },
    { x: -8.18, y: -0.78, sx: 0.42, sy: 1.12, rotation: -0.42 },
    { x: -6.72, y: 0.7, sx: 0.62, sy: 1.25, rotation: -0.5 },
    { x: -6.72, y: -0.7, sx: 0.62, sy: 1.25, rotation: 0.5 },
  ];
  lobes.forEach(({ x, y, sx, sy, rotation }) => {
    const lobe = new THREE.Mesh(lobeGeometry, grayMatterMaterial);
    lobe.position.set(x, y, -0.67);
    lobe.scale.set(sx, sy, 0.22);
    lobe.rotation.z = rotation;
    group.add(lobe);
  });

  const ventralHorn = new THREE.Mesh(lobeGeometry, makeMaterial(0x5f747b, 0.88, 0, 0.72));
  ventralHorn.position.set(-6.72, -0.22, -0.61);
  ventralHorn.scale.set(0.72, 1.18, 0.24);
  ventralHorn.rotation.z = 0.76;
  tag(ventralHorn, "anterior-horn");
  group.add(ventralHorn);
  tag(group, "anterior-horn");
  return group;
}

export function createMotorUnit(quality: number, lowPower: boolean): UnitRefs {
  const root = new THREE.Group();
  root.add(makeSpinalCordContext(quality));

  const somaMaterial = makeMaterial(COLORS.neuron, 0.68);
  const soma = new THREE.Mesh(
    new THREE.SphereGeometry(1.03, quality > 0 ? 28 : 16, quality > 0 ? 18 : 11),
    somaMaterial,
  );
  soma.scale.set(1.22, 1, 0.9);
  soma.position.set(-7.05, 0, 0);
  tag(soma, "cell-body");
  root.add(soma);

  const nucleusMaterial = makeMaterial(COLORS.nucleus, 0.56, 0.02, 0.95);
  const nucleus = new THREE.Mesh(
    new THREE.SphereGeometry(0.48, quality > 0 ? 20 : 12, quality > 0 ? 14 : 8),
    nucleusMaterial,
  );
  nucleus.scale.set(1, 1, 0.72);
  nucleus.position.set(-7.18, 0.08, 0.69);
  tag(nucleus, "nucleus");
  root.add(nucleus);

  const nucleolus = new THREE.Mesh(
    new THREE.SphereGeometry(0.13, 10, 7),
    makeMaterial(0x35534e, 0.55),
  );
  nucleolus.position.set(0.14, 0.04, 0.3);
  nucleus.add(nucleolus);

  const organelleMaterial = makeMaterial(0x57807a, 0.75);
  for (let i = 0; i < 4; i += 1) {
    const organelle = new THREE.Mesh(new THREE.TorusGeometry(0.44 + i * 0.07, 0.018, 5, 18), organelleMaterial);
    organelle.scale.set(1, 0.48, 1);
    organelle.rotation.x = Math.PI / 2;
    organelle.position.set(-7.15 + i * 0.03, -0.1 + i * 0.12, 0.43);
    root.add(organelle);
  }

  const dendrites = new THREE.Group();
  const dendriteMaterial = makeMaterial(COLORS.neuronLight, 0.72);
  const dendriteEnds = [
    [-10.6, 2.35, -0.15], [-10.95, 1.25, 0.5], [-10.8, 0.1, -0.55],
    [-10.7, -1.3, 0.45], [-10.35, -2.35, -0.2], [-9.55, 2.85, 0.45],
    [-9.35, -2.75, 0.4], [-8.8, 2.35, -0.6],
  ];
  dendriteEnds.forEach((end, index) => {
    const start = new THREE.Vector3(-7.65, (index - 3.5) * 0.08, (index % 2 ? 1 : -1) * 0.06);
    const finish = new THREE.Vector3(end[0], end[1], end[2]);
    const middle = start.clone().lerp(finish, 0.48);
    middle.y += Math.sin(index * 1.7) * 0.38;
    const branch = makeTube([start, middle, finish], index < 5 ? 0.13 : 0.09, dendriteMaterial, quality);
    dendrites.add(branch);
  });
  tag(dendrites, "dendrites");
  root.add(dendrites);

  const hillock = makeCapsule(1.45, 0.43, somaMaterial, quality);
  hillock.position.set(-5.95, 0, 0);
  hillock.scale.set(1, 1, 0.88);
  tag(hillock, "axon-hillock");
  root.add(hillock);

  const axonCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-5.35, 0, 0),
    new THREE.Vector3(-2.8, 0.04, 0.02),
    new THREE.Vector3(0.2, -0.03, -0.02),
    new THREE.Vector3(2.9, 0.03, 0.01),
    new THREE.Vector3(5.05, 0, 0),
  ]);
  const ventralRootMaterial = makeMaterial(0x86bcb3, 0.78, 0, 0.26);
  ventralRootMaterial.depthWrite = false;
  const ventralRoot = makeTube(
    [
      new THREE.Vector3(-5.5, 0, 0),
      new THREE.Vector3(-5.0, -0.08, -0.03),
      new THREE.Vector3(-4.45, 0, 0),
    ],
    0.25,
    ventralRootMaterial,
    quality,
  );
  tag(ventralRoot, "axon");
  root.add(ventralRoot);

  const peripheralNerveMaterial = makeMaterial(0x4a6f6a, 0.82, 0, 0.12);
  peripheralNerveMaterial.depthWrite = false;
  const peripheralNerve = makeTube(
    [
      new THREE.Vector3(-4.45, 0, 0),
      new THREE.Vector3(0.1, -0.02, 0),
      new THREE.Vector3(4.82, 0, 0),
    ],
    0.39,
    peripheralNerveMaterial,
    quality,
  );
  peripheralNerve.renderOrder = -1;
  tag(peripheralNerve, "axon");
  root.add(peripheralNerve);

  const axonSegments: THREE.Mesh[] = [];
  const axonMaterial = makeMaterial(COLORS.axon, 0.66);
  const segmentCount = lowPower ? 22 : 30;
  for (let i = 0; i < segmentCount; i += 1) {
    const startT = i / segmentCount;
    const endT = Math.min(1, (i + 0.94) / segmentCount);
    const segment = makeTube(
      [axonCurve.getPointAt(startT), axonCurve.getPointAt(endT)],
      0.115,
      axonMaterial,
      quality,
    );
    segment.userData.segmentIndex = i;
    segment.userData.segmentCount = segmentCount;
    axonSegments.push(segment);
    root.add(segment);
  }
  tag(axonSegments[Math.floor(axonSegments.length / 2)], "axon");

  const myelin = new THREE.Group();
  const schwann = new THREE.Group();
  const myelinMaterial = makeMaterial(COLORS.myelinLight, 0.48, 0.03, 0.76);
  const myelinCoreMaterial = makeMaterial(COLORS.myelin, 0.66, 0.02, 0.38);
  const schwannMaterial = makeMaterial(0x4d6b66, 0.7);
  const myelinPositions = [-4.55, -3.28, -2.0, -0.72, 0.56, 1.84, 3.12, 4.25];
  myelinPositions.forEach((x, index) => {
    const segment = makeCapsule(0.94, 0.31, myelinMaterial, quality);
    segment.position.set(x, 0, 0);
    segment.scale.z = 0.9;
    const inner = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 0.94, quality > 0 ? 14 : 8),
      myelinCoreMaterial,
    );
    inner.rotation.z = Math.PI / 2;
    segment.add(inner);
    myelin.add(segment);

    const nucleusMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 10, 7),
      schwannMaterial,
    );
    nucleusMesh.scale.set(1.7, 0.65, 0.55);
    nucleusMesh.position.set(x + (index % 2 ? 0.12 : -0.12), 0.27, 0.12);
    schwann.add(nucleusMesh);
  });
  tag(myelin, "myelin");
  tag(schwann, "schwann-cell");
  root.add(myelin, schwann);

  const cargoMaterials = {
    mitochondria: makeMaterial(0xcabef2, 0.5),
    protein: makeMaterial(COLORS.transportOut, 0.58),
    vesicle: makeMaterial(COLORS.transportBack, 0.5, 0.08, 0.92),
    rna: makeMaterial(0x6f5fb0, 0.55),
  };
  const cargo: CargoRef[] = [];
  const cargoKinds: CargoRef["kind"][] = ["mitochondria", "protein", "vesicle", "rna"];
  const copies = lowPower ? 1 : 2;
  for (let copy = 0; copy < copies; copy += 1) {
    cargoKinds.forEach((kind, kindIndex) => {
      ([-1, 1] as const).forEach((direction, directionIndex) => {
        let mesh: THREE.Object3D;
        if (kind === "mitochondria") {
          mesh = makeMitochondrion(cargoMaterials.mitochondria, quality);
        } else if (kind === "protein") {
          mesh = new THREE.Mesh(
            new THREE.DodecahedronGeometry(0.12, 0),
            cargoMaterials.protein,
          );
        } else if (kind === "vesicle") {
          mesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.1, quality > 0 ? 12 : 8, quality > 0 ? 8 : 6),
            cargoMaterials.vesicle,
          );
        } else {
          mesh = makeRna(cargoMaterials.rna, quality);
        }
        mesh.userData.structureId = kind === "mitochondria" ? "mitochondria" : "transport";
        root.add(mesh);
        cargo.push({
          mesh,
          progress: (kindIndex * 0.21 + copy * 0.37 + directionIndex * 0.11) % 1,
          direction,
          speed: 0.022 + kindIndex * 0.004,
          lane: direction * 0.12,
          kind,
        });
      });
    });
  }

  const aggregates = new THREE.Group();
  const aggregateMaterial = makeMaterial(0x8a4438, 0.78);
  for (let i = 0; i < (lowPower ? 9 : 16); i += 1) {
    const aggregate = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.09 + (i % 3) * 0.025, 0),
      aggregateMaterial,
    );
    aggregate.position.set(
      -7.4 + (i % 5) * 0.24,
      -0.65 + ((i * 3) % 7) * 0.19,
      0.35 + (i % 2) * 0.25,
    );
    aggregates.add(aggregate);
  }
  aggregates.visible = false;
  root.add(aggregates);

  const stressHaloMaterial = new THREE.MeshBasicMaterial({
    color: COLORS.stress,
    transparent: true,
    opacity: 0.13,
    side: THREE.BackSide,
  });
  const stressHalo = new THREE.Mesh(
    new THREE.SphereGeometry(1.4, quality > 0 ? 20 : 12, quality > 0 ? 12 : 8),
    stressHaloMaterial,
  );
  stressHalo.scale.set(1.2, 1, 0.9);
  stressHalo.position.set(-7.05, 0, 0);
  stressHalo.visible = false;
  root.add(stressHalo);

  const terminals: THREE.Group[] = [];
  const terminalMaterials: THREE.MeshStandardMaterial[] = [];
  const endplates: THREE.Group[] = [];
  const denervationMarkers: THREE.Group[] = [];
  const acetylcholine: THREE.Group[] = [];
  const muscles: THREE.Group[] = [];
  const muscleMaterials: THREE.MeshStandardMaterial[] = [];
  const fiberY = [-1.8, -0.9, 0, 0.9, 1.8];
  fiberY.forEach((y, fiberIndex) => {
    const terminalMaterial = makeMaterial(COLORS.axon, 0.68);
    terminalMaterials.push(terminalMaterial);
    const terminal = new THREE.Group();
    terminal.position.set(5.02, 0, 0);
    const branch = makeTube(
      [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0.5, y * 0.45, 0.05 * (fiberIndex - 2)),
        new THREE.Vector3(1.12, y, 0),
      ],
      0.075,
      terminalMaterial,
      quality,
    );
    terminal.add(branch);
    const bouton = new THREE.Mesh(
      new THREE.SphereGeometry(0.17, quality > 0 ? 14 : 9, quality > 0 ? 9 : 6),
      makeMaterial(COLORS.neuronLight, 0.55),
    );
    bouton.scale.set(1.3, 0.85, 0.85);
    bouton.position.set(1.12, y, 0);
    terminal.add(bouton);
    terminal.userData.baseY = y;
    tag(terminal, "terminal");
    terminals.push(terminal);
    root.add(terminal);

    const achGroup = new THREE.Group();
    const achMaterial = new THREE.MeshBasicMaterial({
      color: COLORS.signal,
      transparent: true,
      opacity: 0,
    });
    const particleCount = lowPower ? 3 : 6;
    for (let particle = 0; particle < particleCount; particle += 1) {
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.035, 7, 5),
        achMaterial.clone(),
      );
      dot.position.set(6.16 + particle * 0.025, y + (particle % 3 - 1) * 0.07, (particle % 2 ? 1 : -1) * 0.05);
      achGroup.add(dot);
    }
    tag(achGroup, "acetylcholine");
    acetylcholine.push(achGroup);
    root.add(achGroup);

    const nmj = new THREE.Group();
    const cleft = new THREE.Mesh(
      new THREE.BoxGeometry(0.085, 0.42, 0.24),
      new THREE.MeshBasicMaterial({ color: 0x202020, transparent: true, opacity: 0.84 }),
    );
    cleft.position.set(6.42, y, 0);
    const endplate = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.25, 0.06, quality > 0 ? 18 : 10),
      makeMaterial(0x8aa4ae, 0.72, 0, 0.92),
    );
    endplate.rotation.z = Math.PI / 2;
    endplate.scale.set(1, 1.28, 0.7);
    endplate.position.set(6.51, y, 0);
    nmj.add(cleft, endplate);
    tag(nmj, "nmj");
    endplates.push(nmj);
    root.add(nmj);

    const denervationMarker = new THREE.Group();
    const markerMaterial = new THREE.MeshBasicMaterial({ color: COLORS.stress });
    const markerA = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.035, 0.035), markerMaterial);
    const markerB = markerA.clone();
    markerA.rotation.z = Math.PI / 4;
    markerB.rotation.z = -Math.PI / 4;
    denervationMarker.add(markerA, markerB);
    denervationMarker.position.set(6.23, y, 0.22);
    denervationMarker.visible = false;
    tag(denervationMarker, "denervation");
    denervationMarkers.push(denervationMarker);
    root.add(denervationMarker);

    const muscleMaterial = makeMaterial(COLORS.muscle, 0.78);
    muscleMaterials.push(muscleMaterial);
    const muscle = makeCapsule(3.55, 0.34, muscleMaterial, quality);
    muscle.position.set(8.62, y, 0);
    muscle.userData.baseY = y;
    muscle.userData.baseScale = new THREE.Vector3(1, 1, 1);
    const ringCount = lowPower ? 4 : 7;
    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x557079, transparent: true, opacity: 0.34 });
    for (let ringIndex = 0; ringIndex < ringCount; ringIndex += 1) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.345, 0.015, 5, quality > 0 ? 14 : 9),
        ringMaterial,
      );
      ring.rotation.y = Math.PI / 2;
      ring.position.x = -1.35 + (ringIndex / Math.max(1, ringCount - 1)) * 2.7;
      muscle.add(ring);
    }
    tag(muscle, "muscle");
    muscles.push(muscle);
    root.add(muscle);
  });

  const collateral = new THREE.Group();
  const collateralMaterial = makeMaterial(COLORS.reinnervation, 0.62);
  const neighboringAxon = makeTube(
    [
      new THREE.Vector3(-5.6, -3.1, -0.2),
      new THREE.Vector3(-1.5, -3.12, -0.18),
      new THREE.Vector3(3.3, -3.1, -0.2),
    ],
    0.12,
    collateralMaterial,
    quality,
  );
  const collateralTrunk = makeTube(
    [
      new THREE.Vector3(3.3, -3.1, -0.2),
      new THREE.Vector3(4.4, -2.8, 0),
      new THREE.Vector3(5.35, -1.6, 0),
      new THREE.Vector3(6.1, -0.9, 0),
    ],
    0.085,
    collateralMaterial,
    quality,
  );
  const collateralBranch = makeTube(
    [
      new THREE.Vector3(5.15, -1.75, 0),
      new THREE.Vector3(5.65, -1.9, 0),
      new THREE.Vector3(6.1, -1.8, 0),
    ],
    0.07,
    collateralMaterial,
    quality,
  );
  collateral.add(neighboringAxon, collateralTrunk, collateralBranch);

  const neighborMyelinMaterial = makeMaterial(0xa3cfc8, 0.58, 0, 0.72);
  [-4.8, -3.6, -2.4, -1.2, 0, 1.2, 2.4].forEach((x) => {
    const segment = makeCapsule(0.8, 0.25, neighborMyelinMaterial, quality);
    segment.position.set(x, -3.1, -0.2);
    segment.scale.z = 0.86;
    collateral.add(segment);
  });
  const newTerminalA = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 8), collateralMaterial);
  const newTerminalB = newTerminalA.clone();
  newTerminalA.position.set(6.13, -0.9, 0);
  newTerminalB.position.set(6.13, -1.8, 0);
  collateral.add(newTerminalA, newTerminalB);
  tag(collateral, "reinnervation");
  collateral.visible = false;
  root.add(collateral);

  const collateralPulse = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 10, 7),
    new THREE.MeshBasicMaterial({ color: COLORS.signal }),
  );
  collateralPulse.visible = false;
  collateral.add(collateralPulse);

  const signalPulse = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, quality > 0 ? 14 : 9, quality > 0 ? 9 : 6),
    new THREE.MeshBasicMaterial({ color: COLORS.signal }),
  );
  signalPulse.visible = false;
  root.add(signalPulse);

  const failureMarker = new THREE.Group();
  const failureRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.19, 0.028, 6, 16),
    new THREE.MeshBasicMaterial({ color: COLORS.stress }),
  );
  const failureBar = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.035, 0.035),
    new THREE.MeshBasicMaterial({ color: COLORS.stress }),
  );
  failureBar.rotation.z = Math.PI / 4;
  failureMarker.add(failureRing, failureBar);
  failureMarker.visible = false;
  root.add(failureMarker);

  tag(root, "motor-unit");
  return {
    root,
    soma,
    somaMaterial,
    nucleus,
    dendrites,
    dendriteMaterial,
    hillock,
    axonCurve,
    axonSegments,
    myelin,
    schwann,
    terminals,
    terminalMaterials,
    endplates,
    denervationMarkers,
    muscles,
    muscleMaterials,
    cargo,
    cargoMaterials,
    aggregates,
    stressHalo,
    acetylcholine,
    collateral,
    collateralPulse,
    signalPulse,
    failureMarker,
    motorUnitStage: 0,
    signalProgress: 0,
  };
}

export function connectedFibers(stage: number) {
  if (stage <= 1) return [0, 1, 2, 3, 4];
  if (stage === 2) return [0, 2, 3];
  if (stage === 3) return [0, 2];
  if (stage === 4) return [0, 2, 3, 4];
  return [];
}

export function originalTerminalFibers(stage: number) {
  if (stage === 4) return [0, 2];
  return connectedFibers(stage);
}

export function applyUnitStage(unit: UnitRefs, stage: number) {
  unit.motorUnitStage = stage;
  const severe = stage >= 5;
  unit.aggregates.visible = stage >= 1;
  unit.stressHalo.visible = stage >= 1;
  unit.soma.scale.set(1.22, 1, 0.9).multiplyScalar(severe ? 0.7 : 1);
  setMaterialOpacity(unit.somaMaterial, severe ? 0.2 : 1);
  setMaterialOpacity(unit.dendriteMaterial, severe ? 0.14 : 1);
  unit.nucleus.visible = !severe;

  const connected = connectedFibers(stage);
  const originalConnections = originalTerminalFibers(stage);
  unit.axonSegments.forEach((segment, index) => {
    const fraction = index / unit.axonSegments.length;
    const fragmented = stage >= 3 && fraction > 0.57 && (index % 4 === 1 || index % 7 === 3);
    const lost = severe && fraction > 0.32 && index % 3 !== 0;
    segment.visible = !fragmented && !lost;
  });
  unit.myelin.visible = true;
  unit.myelin.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      const material = object.material as THREE.MeshStandardMaterial;
      setMaterialOpacity(material, severe ? 0.42 : 0.76);
    }
  });
  unit.schwann.visible = true;

  unit.terminals.forEach((terminal, index) => {
    const isConnected = originalConnections.includes(index) && !severe;
    terminal.scale.x = isConnected ? 1 : stage >= 3 ? 0.38 : 0.52;
    setMaterialOpacity(unit.terminalMaterials[index], isConnected ? 1 : severe ? 0.08 : 0.62);
    terminal.visible = !severe || index === 2;
    unit.denervationMarkers[index].visible = !isConnected;
    unit.denervationMarkers[index].scale.setScalar(severe ? 0.72 : 1);
    unit.endplates[index].traverse((object) => {
      if (object instanceof THREE.Mesh) {
        const material = object.material as THREE.MeshStandardMaterial | THREE.MeshBasicMaterial;
        setMaterialOpacity(material, isConnected ? 0.92 : severe ? 0.3 : 0.68);
      }
    });
  });

  unit.muscles.forEach((muscle, index) => {
    const isConnected = connected.includes(index);
    const atrophy = severe ? (index === 2 ? 0.72 : 0.48) : 1;
    muscle.scale.set(1, atrophy, atrophy);
    muscle.position.y = muscle.userData.baseY;
    setMaterialOpacity(unit.muscleMaterials[index], severe ? 0.48 : isConnected ? 1 : 0.52);
  });

  unit.collateral.visible = stage >= 4;
  unit.collateral.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      const material = object.material as THREE.MeshStandardMaterial | THREE.MeshBasicMaterial;
      setMaterialOpacity(material, severe ? 0.2 : 1);
    }
  });

  const cargoOpacity = stage >= 5 ? 0.2 : stage >= 3 ? 0.52 : 1;
  Object.values(unit.cargoMaterials).forEach((material) => setMaterialOpacity(material, cargoOpacity));
  unit.cargoMaterials.mitochondria.color.setHex(stage >= 1 ? 0xa8766c : 0xcabef2);
  unit.failureMarker.visible = false;
}

export function updateCargo(unit: UnitRefs, delta: number, playing: boolean, speed: number, reducedMotion: boolean) {
  const stageFactor = [1, 0.58, 0.46, 0.22, 0.3, 0.035][unit.motorUnitStage] ?? 1;
  unit.cargo.forEach((cargo, index) => {
    if (playing && !reducedMotion) {
      cargo.progress = (cargo.progress + delta * cargo.speed * cargo.direction * stageFactor * speed + 1) % 1;
    }
    const point = unit.axonCurve.getPointAt(cargo.progress);
    cargo.mesh.position.copy(point);
    cargo.mesh.position.y += cargo.lane;
    cargo.mesh.position.z += cargo.direction * 0.12;
    cargo.mesh.visible = !(unit.motorUnitStage >= 3 && index % 3 === 1);
  });
}

export function updateSignal(
  unit: UnitRefs,
  delta: number,
  playing: boolean,
  speed: number,
  reducedMotion: boolean,
  journey: JourneyVisualState,
) {
  const stage = unit.motorUnitStage;
  const connected = connectedFibers(stage);
  if (journey.routeProgress !== null) {
    unit.signalProgress = journey.routeProgress;
  } else if (playing && !reducedMotion) {
    unit.signalProgress = (unit.signalProgress + delta * 0.18 * speed) % 1;
  }

  const progress = unit.signalProgress;
  const maxPath = stage >= 5 ? 0.56 : 1;
  if (progress <= 0.68) {
    const axonProgress = Math.min(maxPath, progress / 0.68);
    const point = unit.axonCurve.getPointAt(axonProgress);
    unit.signalPulse.position.copy(point);
    unit.signalPulse.visible = true;
    unit.failureMarker.visible = false;
    if (stage >= 5 && axonProgress >= maxPath - 0.01) {
      unit.signalPulse.visible = false;
      unit.failureMarker.position.copy(unit.axonCurve.getPointAt(maxPath));
      unit.failureMarker.visible = true;
    }
  } else if (stage < 5 && progress <= 0.9) {
    const terminalProgress = (progress - 0.68) / 0.22;
    unit.signalPulse.position.set(5.05 + terminalProgress * 1.42, 0, 0.12);
    unit.signalPulse.visible = true;
    unit.failureMarker.visible = false;
  } else if (stage < 5) {
    const muscleProgress = Math.min(1, (progress - 0.9) / 0.1);
    unit.signalPulse.position.set(6.55 + muscleProgress * 2.2, 0, 0.16);
    unit.signalPulse.visible = true;
    unit.failureMarker.visible = false;
  } else {
    unit.signalPulse.visible = false;
    if (stage >= 5) {
      unit.failureMarker.position.copy(unit.axonCurve.getPointAt(maxPath));
      unit.failureMarker.visible = true;
    }
  }

  const release = progress > 0.68 ? Math.min(1, (progress - 0.68) / 0.22) : 0;
  const muscleActivation = journey.routeProgress !== null
    ? progress >= 0.88 ? Math.sin(Math.min(1, (progress - 0.88) / 0.12) * Math.PI / 2) : 0
    : release > 0 ? Math.sin(release * Math.PI) : 0;
  unit.acetylcholine.forEach((group, fiberIndex) => {
    const active = connected.includes(fiberIndex) && release > 0 && release < 1;
    group.children.forEach((child, particleIndex) => {
      const particle = child as THREE.Mesh;
      const material = particle.material as THREE.MeshBasicMaterial;
      material.opacity = active ? Math.sin(release * Math.PI) * 0.95 : 0;
      particle.position.x = 6.16 + release * 0.22 + particleIndex * 0.018;
    });
  });

  unit.muscles.forEach((muscle, fiberIndex) => {
    const atrophy = stage >= 5 ? (fiberIndex === 2 ? 0.72 : 0.48) : 1;
    const contraction = connected.includes(fiberIndex) && muscleActivation > 0
      ? 1 - muscleActivation * 0.12
      : 1;
    muscle.scale.set(contraction, atrophy, atrophy);
    const baseY = muscle.userData.baseY as number;
    const twitch = stage >= 5 && fiberIndex === 2 && playing && !reducedMotion
      ? Math.sin(performance.now() * 0.025) * 0.025 * (Math.sin(performance.now() * 0.0017) > 0.83 ? 1 : 0)
      : 0;
    muscle.position.y = baseY + twitch;
  });

  unit.collateralPulse.visible = stage === 4;
  if (stage === 4) {
    const collateralProgress = (progress + 0.15) % 1;
    const start = new THREE.Vector3(-5.2, -3.1, -0.2);
    const end = new THREE.Vector3(6.1, -0.9, 0);
    unit.collateralPulse.position.copy(start.lerp(end, Math.min(1, collateralProgress / 0.72)));
  }
}
