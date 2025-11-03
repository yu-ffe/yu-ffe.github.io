// Stream_LiveGame :: 바닥 메시 구성에 Three.js를 사용한다.
import * as THREE from "three";
import { FLOOR_THICKNESS, ROOM_SIZE, WALL_THICKNESS } from "../constants.js";

export function addFloor(parent) {
  const { width, depth, floorLevel } = ROOM_SIZE;

  // 벽과 겹침 방지용 인셋: 벽 두께의 절반 + 알파
  const INSET = WALL_THICKNESS * 0.5 + 0.01;
  const innerWidth = Math.max(0.1, width - INSET * 2);
  const innerDepth = Math.max(0.1, depth - INSET * 2);

  // Stream_LiveGame :: 기본 바닥재의 공통 재질
  const baseMaterial = new THREE.MeshStandardMaterial({
    color: 0x392b21,
    roughness: 0.82,
    metalness: 0.5,
  });

  // Stream_LiveGame :: 두꺼운 베이스 바닥 (벽과 안 겹치게 사이즈 축소)
  const baseFloor = new THREE.Mesh(
    new THREE.BoxGeometry(innerWidth, FLOOR_THICKNESS, innerDepth),
    baseMaterial
  );
  baseFloor.position.y = floorLevel - FLOOR_THICKNESS / 2;
  baseFloor.receiveShadow = true;
  parent.add(baseFloor);

  const plankGroup = new THREE.Group();

  // Stream_LiveGame :: 따뜻한 목재 느낌 파라미터
  const plankCount = 12;
  const segmentWidth = innerWidth / plankCount; // 내부 폭 기준으로 재계산
  const plankHeight = 0.68;
  const baseGap = 0.12;

  for (let i = 0; i < plankCount; i += 1) {
    const seed = i * 19.73;
    const toneShift = 0.08 * Math.sin(seed);

    const plankMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x7b5a3c).offsetHSL(0, 0, toneShift),
      roughness: 0.6,
      metalness: 0.08,
    });

    // 간격과 폭 계산도 내부 폭 기준
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

    // 깊이 스케일은 내부 깊이 기준
    const depthScale = THREE.MathUtils.lerp(
      0.96,
      0.995,
      seededNoise(seed + 8.51)
    );

    const plankGeometry = new THREE.BoxGeometry(
      plankWidth,
      plankHeight,
      innerDepth * depthScale
    );

    const plank = new THREE.Mesh(plankGeometry, plankMaterial);
    const segmentStart = -innerWidth / 2 + segmentWidth * i;

    // 내부 영역 안에서만 흔들리도록 배치
    plank.position.x = segmentStart + gapBefore + plankWidth / 2;
    plank.position.y =
      floorLevel + 0.02 + THREE.MathUtils.lerp(-0.015, 0.018, seededNoise(seed + 3.89));
    plank.position.z = THREE.MathUtils.lerp(
      -innerDepth * 0.02,
      innerDepth * 0.02,
      seededNoise(seed + 11.63)
    );
    plank.rotation.y = THREE.MathUtils.degToRad(
      THREE.MathUtils.lerp(-0.6, 0.6, seededNoise(seed + 6.42))
    );
    plank.castShadow = true;
    plank.receiveShadow = true;

    plankGroup.add(plank);
  }

  // 바닥 그룹은 중앙 정렬된 내부 영역에 놓임
  parent.add(plankGroup);
}

function seededNoise(seed) {
  // Stream_LiveGame :: 반복 가능한 의사 난수
  return (Math.sin(seed * 12.9898) + 1) / 2;
}
