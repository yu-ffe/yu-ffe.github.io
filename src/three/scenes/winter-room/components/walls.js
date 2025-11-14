// Stream_LiveGame :: 벽면 지오메트리 생성을 위해 Three.js를 사용한다.
import * as THREE from "three";
import { FLOOR_THICKNESS, ROOM_SIZE, WALL_THICKNESS } from "../constants.js";

const CORNER_RADIUS = 1.2;

export function addWalls(parent) {
  const { width, depth, height, floorLevel } = ROOM_SIZE;

  // Stream_LiveGame :: 기본 벽과 강조 요소에 사용할 재질을 정의한다.
  const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0xe9f1ff,
    roughness: 0.7,
    metalness: 0.06,
    emissive: new THREE.Color(0x1c2737).multiplyScalar(0.06),
  });

  const accentMaterial = new THREE.MeshStandardMaterial({
    color: 0xf7d9b9,
    roughness: 0.55,
    metalness: 0.12,
  });

  const { mesh: leftWall, openingMetrics } = createLeftWallWithWindowOpening({
    depth,
    height,
    material: wallMaterial,
  });
  const wallCenterY = floorLevel + height / 2 - FLOOR_THICKNESS / 2;

  // Stream_LiveGame :: 왼쪽 벽 배치
  leftWall.position.set(-width / 2 + WALL_THICKNESS / 2, wallCenterY, 0);
  parent.add(leftWall);

  // Stream_LiveGame :: 후면 벽 배치
  const backWall = new THREE.Mesh(
    createRoundedPanelGeometry({
      width,
      height: height + FLOOR_THICKNESS,
      depth: WALL_THICKNESS,
      radius: CORNER_RADIUS,
      bottomRadius: 0,
      radii: {
        topLeft: CORNER_RADIUS,
        topRight: 0,
        bottomLeft: 0,
        bottomRight: 0,
      },
    }),
    wallMaterial
  );
  backWall.position.set(0, wallCenterY, -depth / 2 + WALL_THICKNESS / 2);
  backWall.castShadow = true;
  backWall.receiveShadow = true;
  parent.add(backWall);

  // Stream_LiveGame :: 코너 기둥 추가 (왼쪽-후면 코너를 깔끔하게 덮는다)
  const cornerPillar = createCornerPillar({
    height: height + FLOOR_THICKNESS,
    diameter: WALL_THICKNESS, // 벽과 약간 겹치게 해서 틈 제거
    material: accentMaterial,
  });

  // 방 내부 좌표계 기준: 왼쪽(back-left) 코너 위치
  cornerPillar.position.set(
    -width / 2 + WALL_THICKNESS / 2,
    wallCenterY,
    -depth / 2 + WALL_THICKNESS / 2
  );
  cornerPillar.castShadow = true;
  cornerPillar.receiveShadow = true;
  parent.add(cornerPillar);

  return {
    windowConfig: {
      width: openingMetrics.width,
      height: openingMetrics.height,
      bottomY: leftWall.position.y + openingMetrics.bottom,
      centerZ: openingMetrics.centerZ,
    },
  };
}

function createLeftWallWithWindowOpening({ depth, height, material }) {
  const halfDepth = depth / 2;
  const openingWidth = depth / 3;
  const windowOpening = {
    width: openingWidth,
    height: (openingWidth * 4) / 3 * 0.8, 
  };

  const wallHeight = height + FLOOR_THICKNESS;

  const wallShape = createRoundedRectShape({
    width: depth,
    height: wallHeight,
    radius: CORNER_RADIUS,
    bottomRadius: 0,
    radii: {
      topLeft: CORNER_RADIUS * 1.8,
      topRight: CORNER_RADIUS,
      bottomLeft: 0,
      bottomRight: 0,
    },
  });

  const centeredTopMargin = Math.max(0, wallHeight / 2 - windowOpening.height / 2);

// 원래 쓰던 살짝 위로 올리는 값들
const upwardShift = windowOpening.height * 0.22;
const downwardRelax = windowOpening.height * 0.06;

// 여기에 추가로 위로 올릴 값 더하기
const extraLift = 1.5; // ★ 창문 전체를 위로 0.5만큼 이동
const verticalShift = upwardShift - downwardRelax + extraLift;

const holeTop = wallHeight / 2 - centeredTopMargin + verticalShift;
const holeBottom = holeTop - windowOpening.height;

  const centeredFrontMargin = Math.max(0, halfDepth - windowOpening.width / 2);
  const holeFront = halfDepth - centeredFrontMargin;
  const holeBack = holeFront - windowOpening.width;

  const windowPath = new THREE.Path();
  windowPath.moveTo(holeBack, holeBottom);
  windowPath.lineTo(holeFront, holeBottom);
  windowPath.lineTo(holeFront, holeTop);
  windowPath.lineTo(holeBack, holeTop);
  windowPath.lineTo(holeBack, holeBottom);
  wallShape.holes.push(windowPath);

  const wallGeometry = new THREE.ExtrudeGeometry(wallShape, {
    depth: WALL_THICKNESS,
    bevelEnabled: false,
    steps: 1,
  });
  wallGeometry.center();
  wallGeometry.rotateY(-Math.PI / 2);

  const mesh = new THREE.Mesh(wallGeometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  return {
    mesh,
    openingMetrics: {
      bottom: holeBottom,
      centerZ: (holeFront + holeBack) / 2,
      width: windowOpening.width,
      height: windowOpening.height,
    },
  };
}

function createRoundedPanelGeometry({
  width,
  height,
  depth,
  radius,
  bottomRadius = radius,
  radii,
}) {
  const panelShape = createRoundedRectShape({ width, height, radius, bottomRadius, radii });
  const geometry = new THREE.ExtrudeGeometry(panelShape, {
    depth,
    bevelEnabled: false,
    steps: 1,
  });
  geometry.center();
  return geometry;
}

function createRoundedRectShape({ width, height, radius = 0, bottomRadius = radius, radii }) {
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const resolvedRadii = radii
    ? {
        topLeft: radii.topLeft ?? radius,
        topRight: radii.topRight ?? radius,
        bottomRight: radii.bottomRight ?? bottomRadius,
        bottomLeft: radii.bottomLeft ?? bottomRadius,
      }
    : {
        topLeft: radius,
        topRight: radius,
        bottomRight: bottomRadius,
        bottomLeft: bottomRadius,
      };

  const clampRadius = (value) => Math.max(0, Math.min(value, halfWidth, halfHeight));

  const clamped = {
    topLeft: clampRadius(resolvedRadii.topLeft),
    topRight: clampRadius(resolvedRadii.topRight),
    bottomRight: clampRadius(resolvedRadii.bottomRight),
    bottomLeft: clampRadius(resolvedRadii.bottomLeft),
  };

  const shape = new THREE.Shape();
  shape.moveTo(-halfWidth + clamped.bottomLeft, -halfHeight);

  if (clamped.bottomRight > 0) {
    shape.lineTo(halfWidth - clamped.bottomRight, -halfHeight);
    shape.quadraticCurveTo(
      halfWidth,
      -halfHeight,
      halfWidth,
      -halfHeight + clamped.bottomRight
    );
  } else {
    shape.lineTo(halfWidth, -halfHeight);
  }

  shape.lineTo(halfWidth, halfHeight - clamped.topRight);

  if (clamped.topRight > 0) {
    shape.quadraticCurveTo(halfWidth, halfHeight, halfWidth - clamped.topRight, halfHeight);
  } else {
    shape.lineTo(halfWidth, halfHeight);
  }

  shape.lineTo(-halfWidth + clamped.topLeft, halfHeight);

  if (clamped.topLeft > 0) {
    shape.quadraticCurveTo(-halfWidth, halfHeight, -halfWidth, halfHeight - clamped.topLeft);
  } else {
    shape.lineTo(-halfWidth, halfHeight);
  }

  if (clamped.bottomLeft > 0) {
    shape.lineTo(-halfWidth, -halfHeight + clamped.bottomLeft);
    shape.quadraticCurveTo(
      -halfWidth,
      -halfHeight,
      -halfWidth + clamped.bottomLeft,
      -halfHeight
    );
  } else {
    shape.lineTo(-halfWidth, -halfHeight);
  }

  shape.closePath();
  return shape;
}

// Stream_LiveGame :: 코너 기둥 생성 (큐브 형태, 자연스러운 색조)
function createCornerPillar({ height, size, material }) {
  // 벽보다 약간 따뜻하고 채도가 낮은 톤
  const pillarMaterial = new THREE.MeshStandardMaterial({
    color: 0xe5ebf5,        // 벽(#e9f1ff)보다 미세하게 어두운 회청색
    roughness: 0.65,        // 벽보다 살짝 매끈하게
    metalness: 0.08,        // 약간 더 금속감 부여
    emissive: new THREE.Color(0x2a3545).multiplyScalar(0.04), // 벽의 어두운 음영 보완
  });

  const geometry = new THREE.BoxGeometry(size, height, size);
  const mesh = new THREE.Mesh(geometry, pillarMaterial);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}
