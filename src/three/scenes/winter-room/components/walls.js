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

  const { mesh: leftWall, holeMetrics } = createLeftWallWithEscapeExit({
    depth,
    height,
    material: wallMaterial,
  });
  // Stream_LiveGame :: 왼쪽 벽을 방 내부 위치에 배치한다.
  leftWall.position.set(
    -width / 2 + WALL_THICKNESS / 2,
    floorLevel - FLOOR_THICKNESS + height / 2,
    0
  );
  parent.add(leftWall);

  // Stream_LiveGame :: 계단 생성에 필요한 탈출구 기준 좌표를 계산한다.
  const holeBottomWorldY = leftWall.position.y + holeMetrics.bottom;

  const backWall = new THREE.Mesh(
    createRoundedPanelGeometry({
      width,
      height,
      depth: WALL_THICKNESS,
      radius: CORNER_RADIUS,
    }),
    wallMaterial
  );
  backWall.position.set(
    0,
    floorLevel - FLOOR_THICKNESS + height / 2,
    -depth / 2 + WALL_THICKNESS / 2
  );
  backWall.castShadow = true;
  backWall.receiveShadow = true;
  parent.add(backWall);


  return {
    stairsConfig: {
      floorLevel,
      holeBottomY: holeBottomWorldY,
      holeCenterZ: holeMetrics.centerZ,
      holeWidth: holeMetrics.width,
      roomWidth: width,
    },
  };
}

function createLeftWallWithEscapeExit({ depth, height, material }) {
  const halfDepth = depth / 2;
  const escapeHole = {
    width: 3.6,
    height: 4.2,
    topMargin: 1.4,
    frontMargin: 1.1,
  };

  // Stream_LiveGame :: 둥근 모서리를 가진 기본 벽 형태를 만든다.
  const wallShape = createRoundedRectShape({
    width: depth,
    height,
    radius: CORNER_RADIUS,
  });

  const holeTop = height / 2 - escapeHole.topMargin;
  const holeBottom = holeTop - escapeHole.height;
  const holeFront = halfDepth - escapeHole.frontMargin;
  const holeBack = holeFront - escapeHole.width;

  // Stream_LiveGame :: 탈출구 모양을 정의하여 벽에 구멍을 뚫는다.
  const escapePath = new THREE.Path();
  escapePath.moveTo(holeBack, holeBottom);
  escapePath.lineTo(holeFront, holeBottom);
  escapePath.lineTo(holeFront, holeTop);
  escapePath.lineTo(holeBack, holeTop);
  escapePath.lineTo(holeBack, holeBottom);
  wallShape.holes.push(escapePath);

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
    holeMetrics: {
      bottom: holeBottom,
      centerZ: (holeFront + holeBack) / 2,
      width: escapeHole.width,
    },
  };
}

function createRoundedPanelGeometry({ width, height, depth, radius }) {
  // Stream_LiveGame :: 후면 벽 패널을 위해 모서리가 둥근 형상을 생성한다.
  const panelShape = createRoundedRectShape({ width, height, radius });
  const geometry = new THREE.ExtrudeGeometry(panelShape, {
    depth,
    bevelEnabled: false,
    steps: 1,
  });
  geometry.center();
  return geometry;
}

function createRoundedRectShape({ width, height, radius }) {
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const clampedRadius = Math.min(radius, halfWidth, halfHeight);

  // Stream_LiveGame :: 하단은 직각, 상단만 라운딩된 경로를 정의한다.
  const shape = new THREE.Shape();
  shape.moveTo(-halfWidth, -halfHeight);
  shape.lineTo(halfWidth, -halfHeight);

  if (clampedRadius > 0) {
    shape.lineTo(halfWidth, halfHeight - clampedRadius);
    shape.quadraticCurveTo(halfWidth, halfHeight, halfWidth - clampedRadius, halfHeight);
    shape.lineTo(-halfWidth + clampedRadius, halfHeight);
    shape.quadraticCurveTo(-halfWidth, halfHeight, -halfWidth, halfHeight - clampedRadius);
  } else {
    shape.lineTo(halfWidth, halfHeight);
    shape.lineTo(-halfWidth, halfHeight);
  }

  shape.lineTo(-halfWidth, -halfHeight);
  shape.closePath();

  return shape;
}
