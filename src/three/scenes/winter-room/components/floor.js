// Stream_LiveGame :: 바닥 메시 구성에 Three.js를 사용한다.
import * as THREE from "three";
import { FLOOR_THICKNESS, ROOM_SIZE } from "../constants.js";

export function addFloor(parent) {
  const { width, depth, floorLevel } = ROOM_SIZE;

  // Stream_LiveGame :: 기본 바닥재의 공통 재질을 정의한다.
  const baseMaterial = new THREE.MeshStandardMaterial({
    color: 0x392b21,
    roughness: 0.82,
    metalness: 0.5,
  });

  // Stream_LiveGame :: 두꺼운 베이스 바닥을 생성하여 그림자를 받게 한다.
  const baseFloor = new THREE.Mesh(
    new THREE.BoxGeometry(width, FLOOR_THICKNESS, depth),
    baseMaterial
  );
  baseFloor.position.y = floorLevel - FLOOR_THICKNESS / 2;
  baseFloor.receiveShadow = true;
  parent.add(baseFloor);

  const plankGroup = new THREE.Group();

  // Stream_LiveGame :: 따뜻한 목재 느낌을 위한 판재 파라미터.
  const plankCount = 12;
  const segmentWidth = width / plankCount;
  const plankHeight = 0.68;
  const baseGap = 0.12;

  for (let i = 0; i < plankCount; i += 1) {
    const seed = i * 19.73;
    const toneShift = 0.08 * Math.sin(seed);
    // Stream_LiveGame :: 각 판재마다 약간씩 다른 색감을 부여한다.
    const plankMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x7b5a3c).offsetHSL(0, 0, toneShift),
      roughness: 0.6,
      metalness: 0.08,
    });

    // Stream_LiveGame :: 판재 사이의 불규칙한 간격을 생성한다.
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
    // Stream_LiveGame :: 깊이 방향 스케일을 미세하게 변형한다.
    const depthScale = THREE.MathUtils.lerp(
      0.96,
      0.995,
      seededNoise(seed + 8.51)
    );

    const plankGeometry = new THREE.BoxGeometry(
      plankWidth,
      plankHeight,
      depth * depthScale
    );

    const plank = new THREE.Mesh(plankGeometry, plankMaterial);
    const segmentStart = -width / 2 + segmentWidth * i;
    // Stream_LiveGame :: 간격과 랜덤성을 반영하여 위치/회전을 조정한다.
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

  // Stream_LiveGame :: 완성된 판재 그룹을 부모에 추가한다.
  parent.add(plankGroup);
}

function seededNoise(seed) {
  // Stream_LiveGame :: 반복 가능하도록 사인 함수를 활용한 의사 난수.
  return (Math.sin(seed * 12.9898) + 1) / 2;
}
