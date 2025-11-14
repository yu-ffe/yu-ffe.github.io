// stair.js
// Stream_LiveGame :: 오두막풍 오픈 계단 (벽 없음, 양쪽 노출) — 경사방향 수정본
import * as THREE from "three";
import { ROOM_SIZE, WALL_THICKNESS } from "../constants.js";

export function addEscapeStairs(parent, config) {
  if (!config) return;

  const { floorLevel, holeBottomY, holeCenterZ, holeWidth, roomWidth } = config;

  // 기본 치수
  const stepCount   = 7;
  const treadDepth  = 1.02;
  const totalRise   = Math.max(0.4, holeBottomY - floorLevel);
  const riserHeight = totalRise / stepCount;
  const nosing      = 0.05;
  const treadThk    = 0.10;
  const riserThk    = 0.035;
  const stringerThk = 0.10;
  const landingLen  = 0.90;
  const landingThk  = 0.10;

  // 벽 여유 제거한 오픈 폭
  const stairsWidth = Math.max(0.7, holeWidth);

  // 상단 첫 트레드 중심 X (상단이 더 "왼쪽"에 위치하도록 구성됨)
  const wallInnerFaceX = -roomWidth / 2 + WALL_THICKNESS;
  const firstTreadCenterX = wallInnerFaceX + treadDepth / 2 + 0.2;

  // 전체 러닝
  const runLen = treadDepth * stepCount;

  // 재질
  const mat = createCabinMaterials();

  // 그룹
  const stairs = new THREE.Group();
  stairs.name = "EscapeStairs";
  parent.add(stairs);

  // 스트링어 중앙 X를 트레드 중앙 러닝에 정렬
  const stringerCenterX = firstTreadCenterX + (runLen - treadDepth) / 2;


  // ───────────────── 트레드/라이저 ─────────────────
  for (let i = 0; i < stepCount; i++) {
    const idxFromTop = stepCount - 1 - i;

    // 트레드
    const tread = new THREE.Mesh(
      new THREE.BoxGeometry(treadDepth + nosing, treadThk, stairsWidth),
      mat.tread
    );
    tread.position.set(
      firstTreadCenterX + idxFromTop * treadDepth + nosing * 0.5,
      floorLevel + riserHeight * (i + 1) - treadThk / 2,
      holeCenterZ
    );
    tread.castShadow = tread.receiveShadow = true;
    stairs.add(tread);

    // 라이저
    const riser = new THREE.Mesh(
      new THREE.BoxGeometry(treadDepth - 0.02, riserThk, stairsWidth * 0.99),
      mat.riser
    );
    riser.position.set(
      firstTreadCenterX + idxFromTop * treadDepth - 0.01,
      floorLevel + riserHeight * i + riserThk / 2,
      holeCenterZ
    );
    riser.castShadow = riser.receiveShadow = true;
    stairs.add(riser);
  }

  // ───────────────── 상단 랜딩 ─────────────────
  const landing = new THREE.Mesh(
    new THREE.BoxGeometry(landingLen, landingThk, stairsWidth),
    mat.tread
  );
  // 상단 트레드 바로 "왼쪽"으로 살짝 연장되게 배치
  landing.position.set(
    firstTreadCenterX-.9,
    holeBottomY + landingThk / 2,
    holeCenterZ
  );
  landing.castShadow = landing.receiveShadow = true;
  stairs.add(landing);

  // 그림자 일괄
  stairs.traverse(o => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
}

export function addEntrySteps(parent) {
  const { width, depth, floorLevel } = ROOM_SIZE;

  const stepHeights = [0.48, 0.48];
  const stepDepths = [1.4, 1.0];
  const stepWidths = [3.6, 3.1];

  const stepsCenterX = width / 2 - 1.6;
  const frontEdge = depth / 2 - WALL_THICKNESS * 0.35;
  const topStepZ = frontEdge - stepDepths[1] / 2 - 0.05;
  const bottomStepZ = topStepZ + (stepDepths[0] + stepDepths[1]) / 2 - 0.16;

  const totalRise = stepHeights.reduce((sum, h) => sum + h, 0);

  const mat = createCabinMaterials();

  const steps = new THREE.Group();
  steps.name = "FrontRightEntrySteps";

  let remainingHeight = totalRise;
  for (let i = 0; i < stepHeights.length; i += 1) {
    const stepHeight = stepHeights[i];
    const stepDepth = stepDepths[i];
    const stepWidth = stepWidths[i];

    remainingHeight -= stepHeight;

    const tread = new THREE.Mesh(
      new THREE.BoxGeometry(stepWidth, stepHeight, stepDepth),
      mat.tread
    );

    const stepZ = i === 0 ? bottomStepZ : topStepZ;
    tread.position.set(
      stepsCenterX,
      floorLevel - remainingHeight - stepHeight / 2,
      stepZ
    );
    steps.add(tread);

    const riser = new THREE.Mesh(
      new THREE.BoxGeometry(stepWidth * 0.98, stepHeight * 0.92, 0.08),
      mat.riser
    );
    riser.position.set(
      stepsCenterX,
      tread.position.y - stepHeight / 2 + stepHeight * 0.46,
      stepZ - stepDepth / 2 + 0.04
    );
    steps.add(riser);
  }

  const stringerDepth = stepDepths[0] + 0.22;
  const stringerHeight = totalRise + 0.12;
  const stringerOffsetX = stepWidths[0] / 2 - 0.18;
  const stringerZ = bottomStepZ - stepDepths[0] / 2 + stringerDepth / 2 - 0.08;

  [1, -1].forEach((dir) => {
    const stringer = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, stringerHeight, stringerDepth),
      mat.stringer
    );
    stringer.position.set(
      stepsCenterX + dir * stringerOffsetX,
      floorLevel - totalRise / 2 - 0.06,
      stringerZ
    );
    steps.add(stringer);
  });

  steps.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  parent.add(steps);
  return steps;
}

// 따뜻한 목재 재질
function createCabinMaterials() {
  return {
    tread: new THREE.MeshStandardMaterial({
      color: 0x8a5a3b,
      roughness: 0.46,
      metalness: 0.06,
      emissive: new THREE.Color(0x2d160c).multiplyScalar(0.04),
    }),
    riser: new THREE.MeshStandardMaterial({
      color: 0xa3714d,
      roughness: 0.5,
      metalness: 0.05,
    }),
    stringer: new THREE.MeshStandardMaterial({
      color: 0x6c4a32,
      roughness: 0.56,
      metalness: 0.06,
      emissive: new THREE.Color(0x1b0f08).multiplyScalar(0.03),
    }),
  };
}