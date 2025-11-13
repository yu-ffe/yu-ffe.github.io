// floor.js
// Stream_LiveGame :: 바닥 메시 구성에 Three.js를 사용한다.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { FLOOR_THICKNESS, ROOM_SIZE, WALL_THICKNESS } from "../constants.js";

export function addFloor(parent) {
  const { width, depth, floorLevel } = ROOM_SIZE;

  // 벽과 겹침 방지 인셋: 벽 두께 절반 + 여유
  const INSET = WALL_THICKNESS * 0.5 + 0.02;
  const innerWidth = Math.max(0.1, width - INSET * 2);
  const innerDepth = Math.max(0.1, depth - INSET * 2);

  const baseMaterial = new THREE.MeshStandardMaterial({
    color: 0x392b21,
    roughness: 0.82,
    metalness: 0.5,
  });

  // 두꺼운 베이스 바닥
  const baseFloor = new THREE.Mesh(
    new THREE.BoxGeometry(innerWidth, FLOOR_THICKNESS, innerDepth),
    baseMaterial
  );
  baseFloor.position.y = floorLevel - FLOOR_THICKNESS / 2;
  baseFloor.receiveShadow = true;
  parent.add(baseFloor);

  // 마루 플랭크
  const plankGroup = new THREE.Group();

  const plankCount = 12;
  const segmentWidth = innerWidth / plankCount;
  const plankHeight = 0.68;
  const baseGap = 0.12;

  // 플랭크가 벽/가구와 시각적 간섭 없도록 전방/후방 살짝 줄임
  const depthTrim = innerDepth * 0.02;

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

    const availableWidth = Math.max(segmentWidth * 0.55, segmentWidth - gapBefore - gapAfter);
    const plankWidth = THREE.MathUtils.lerp(
      availableWidth * 0.72,
      availableWidth * 0.97,
      seededNoise(seed + 2.17)
    );

    const depthScale = THREE.MathUtils.lerp(0.96, 0.992, seededNoise(seed + 8.51));

    const plankGeometry = new RoundedBoxGeometry(
      plankWidth,
      plankHeight,
      innerDepth * depthScale - depthTrim * 2,
      2,
      Math.min(plankHeight, plankWidth) * 0.08
    );

    const plank = new THREE.Mesh(plankGeometry, plankMaterial);
    const segmentStart = -innerWidth / 2 + segmentWidth * i;

    plank.position.x = segmentStart + gapBefore + plankWidth / 2;
    plank.position.y =
      floorLevel +
      0.02 +
      THREE.MathUtils.lerp(-0.012, 0.015, seededNoise(seed + 3.89));
    plank.position.z = THREE.MathUtils.lerp(
      -innerDepth * 0.018,
      innerDepth * 0.018,
      seededNoise(seed + 11.63)
    );
    plank.rotation.y = THREE.MathUtils.degToRad(
      THREE.MathUtils.lerp(-0.5, 0.5, seededNoise(seed + 6.42))
    );
    plank.castShadow = true;
    plank.receiveShadow = true;

    plankGroup.add(plank);
  }

  parent.add(plankGroup);
}

function seededNoise(seed) {
  return (Math.sin(seed * 12.9898) + 1) / 2;
}
