import * as THREE from "three";
import { FLOOR_THICKNESS, ROOM_SIZE } from "../constants.js";

// [LiveGame] Utility constant to keep irregular plank edges under control.
const EDGE_VARIATION_RATIO = 0.18;

export function addFloor(parent) {
  const { width, depth, floorLevel } = ROOM_SIZE;

  const baseMaterial = new THREE.MeshStandardMaterial({
    color: 0x392b21,
    roughness: 0.82,
    metalness: 0.05,
  });

  const baseFloor = new THREE.Mesh(
    new THREE.BoxGeometry(width, FLOOR_THICKNESS, depth),
    baseMaterial
  );
  baseFloor.position.y = floorLevel - FLOOR_THICKNESS / 2;
  baseFloor.receiveShadow = true;
  parent.add(baseFloor);

  const plankGroup = new THREE.Group();

  const plankCount = 12;
  // [LiveGame] Derive the available width per plank so we can offset their edges.
  const segmentWidth = width / plankCount;
  const plankHeight = 0.18;
  const baseGap = 0.12;

  for (let i = 0; i < plankCount; i += 1) {
    const seed = i * 19.73;
    const toneShift = 0.08 * Math.sin(seed);
    const plankMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x7b5a3c).offsetHSL(0, 0, toneShift),
      roughness: 0.6,
      metalness: 0.08,
    });

    const gapBefore =
      i === 0
        ? THREE.MathUtils.lerp(baseGap * 0.2, baseGap * 0.6, seededNoise(seed))
        : THREE.MathUtils.lerp(baseGap * 0.6, baseGap * 1.6, seededNoise(seed));
    const gapAfter = THREE.MathUtils.lerp(
      baseGap * 0.4,
      baseGap * 1.4,
      seededNoise(seed + 5.31)
    );

    const availableWidth = Math.max(
      segmentWidth * 0.55,
      segmentWidth - gapBefore - gapAfter
    );
    const plankWidth = THREE.MathUtils.lerp(
      availableWidth * 0.72,
      availableWidth * 0.97,
      seededNoise(seed + 2.17)
    );
    const depthScale = THREE.MathUtils.lerp(
      0.96,
      0.995,
      seededNoise(seed + 8.51)
    );

    const plankDepth = depth * depthScale;

    const plankGeometry = new THREE.BoxGeometry(
      plankWidth,
      plankHeight,
      plankDepth,
      2,
      1,
      6
    );

    // [LiveGame] Roughen the plank edges so the floor boards feel aged.
    addSplinteredEdgeDetails({
      geometry: plankGeometry,
      seed,
      plankWidth,
      plankDepth,
    });

    const plank = new THREE.Mesh(plankGeometry, plankMaterial);
    const segmentStart = -width / 2 + segmentWidth * i;
    plank.position.x = segmentStart + gapBefore + plankWidth / 2;
    plank.position.y =
      floorLevel + 0.02 + THREE.MathUtils.lerp(-0.015, 0.018, seededNoise(seed + 3.89));
    plank.position.z = THREE.MathUtils.lerp(
      -0.14,
      0.14,
      seededNoise(seed + 11.63)
    );
    plank.rotation.y = THREE.MathUtils.degToRad(
      THREE.MathUtils.lerp(-0.6, 0.6, seededNoise(seed + 6.42))
    );
    plank.castShadow = true;
    plank.receiveShadow = true;

    plankGroup.add(plank);
  }

  parent.add(plankGroup);
}

// [LiveGame] Provide deterministic pseudo-noise so planks stay stable across renders.
function seededNoise(seed) {
  return (Math.sin(seed * 12.9898) + 1) / 2;
}

// [LiveGame] Bend the vertices close to the plank ends for a subtle splitting effect.
function addSplinteredEdgeDetails({ geometry, seed, plankWidth, plankDepth }) {
  const position = geometry.attributes.position;
  const halfDepth = plankDepth / 2;
  const endThreshold = halfDepth * (1 - EDGE_VARIATION_RATIO * 0.35);
  const halfWidth = plankWidth / 2;

  for (let i = 0; i < position.count; i += 1) {
    const originalX = position.getX(i);
    const originalY = position.getY(i);
    const originalZ = position.getZ(i);

    const normalizedX = (originalX + halfWidth) / (plankWidth || 1);
    const depthEdgeSign = Math.sign(originalZ);
    const nearEnd = Math.abs(originalZ) >= endThreshold;

    if (nearEnd) {
      const splitSeed = seed + depthEdgeSign * 41.29 + normalizedX * 13.7;
      const splitOffset = THREE.MathUtils.lerp(
        -plankWidth * EDGE_VARIATION_RATIO,
        plankWidth * EDGE_VARIATION_RATIO,
        seededNoise(splitSeed)
      );

      position.setX(i, originalX + splitOffset * 0.35);

      const notchSeed = seed + depthEdgeSign * 97.11 + normalizedX * 27.61;
      const notchDepth = THREE.MathUtils.lerp(
        -plankDepth * 0.045,
        plankDepth * 0.08,
        seededNoise(notchSeed)
      );

      if (originalY >= 0) {
        position.setZ(i, originalZ + notchDepth * 0.55);
      } else {
        position.setZ(i, originalZ + notchDepth * 0.18);
      }
    }

    if (originalY > 0 && Math.abs(originalZ) < endThreshold) {
      const warpSeed = seed + normalizedX * 52.13 + i * 0.17;
      const warp = THREE.MathUtils.lerp(
        -plankWidth * 0.015,
        plankWidth * 0.015,
        seededNoise(warpSeed)
      );
      position.setX(i, position.getX(i) + warp * (1 - Math.abs(originalZ) / halfDepth));
    }
  }

  position.needsUpdate = true;
  geometry.computeVertexNormals();
}
