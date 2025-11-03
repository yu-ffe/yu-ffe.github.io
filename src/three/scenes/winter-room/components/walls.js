import * as THREE from "three";
import { FLOOR_THICKNESS, ROOM_SIZE, WALL_THICKNESS } from "../constants.js";

const CORNER_RADIUS = 1.2;

export function addWalls(parent) {
  const { width, depth, height, floorLevel } = ROOM_SIZE;

  // [LiveGame] Anchor the walls directly on the foundation rather than the finish floor.
  const wallBaseLevel = floorLevel - FLOOR_THICKNESS;

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
  leftWall.position.set(
    -width / 2 + WALL_THICKNESS / 2,
    wallBaseLevel + height / 2,
    0
  );
  parent.add(leftWall);

  const holeBottomWorldY = wallBaseLevel + height / 2 + holeMetrics.bottom;

  const backWall = new THREE.Mesh(
    createRoundedPanelGeometry({
      width,
      height,
      depth: WALL_THICKNESS,
      topRadius: CORNER_RADIUS,
    }),
    wallMaterial
  );
  backWall.position.set(
    0,
    wallBaseLevel + height / 2,
    -depth / 2 + WALL_THICKNESS / 2
  );
  backWall.castShadow = true;
  backWall.receiveShadow = true;
  parent.add(backWall);

  const baseboardHeight = 0.65;
  const baseboardDepth = 0.3;

  // [LiveGame] Keep the trim aligned with the finished floor surface for visual cohesion.
  const leftBaseboard = new THREE.Mesh(
    new THREE.BoxGeometry(baseboardDepth, baseboardHeight, depth - baseboardDepth),
    accentMaterial
  );
  leftBaseboard.position.set(
    -width / 2 + baseboardDepth / 2,
    floorLevel + baseboardHeight / 2,
    baseboardDepth / 2
  );
  parent.add(leftBaseboard);

  const backBaseboard = new THREE.Mesh(
    new THREE.BoxGeometry(width - baseboardDepth, baseboardHeight, baseboardDepth),
    accentMaterial
  );
  backBaseboard.position.set(
    baseboardDepth / 2,
    floorLevel + baseboardHeight / 2,
    -depth / 2 + baseboardDepth / 2
  );
  parent.add(backBaseboard);

  const cornerCove = new THREE.Mesh(
    new THREE.CylinderGeometry(CORNER_RADIUS, CORNER_RADIUS, height, 32, 1, true, 0, Math.PI / 2),
    wallMaterial
  );
  // [LiveGame] Seat the curved corner on the same foundation-driven datum as the other walls.
  cornerCove.position.set(
    -width / 2 + CORNER_RADIUS,
    wallBaseLevel + height / 2,
    -depth / 2 + CORNER_RADIUS
  );
  cornerCove.rotation.y = Math.PI / 2;
  cornerCove.castShadow = true;
  cornerCove.receiveShadow = true;
  parent.add(cornerCove);

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

// [LiveGame] Create the left wall, keeping a squared bottom edge for structural realism.
function createLeftWallWithEscapeExit({ depth, height, material }) {
  const halfDepth = depth / 2;
  const escapeHole = {
    width: 3.6,
    height: 4.2,
    topMargin: 1.4,
    frontMargin: 1.1,
  };

  const wallShape = createRoundedRectShape({
    width: depth,
    height,
    topRadius: CORNER_RADIUS,
  });

  const holeTop = height / 2 - escapeHole.topMargin;
  const holeBottom = holeTop - escapeHole.height;
  const holeFront = halfDepth - escapeHole.frontMargin;
  const holeBack = holeFront - escapeHole.width;

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

function createRoundedPanelGeometry({ width, height, depth, topRadius }) {
  const panelShape = createRoundedRectShape({ width, height, topRadius });
  const geometry = new THREE.ExtrudeGeometry(panelShape, {
    depth,
    bevelEnabled: false,
    steps: 1,
  });
  geometry.center();
  return geometry;
}

// [LiveGame] Generate a rectangle with only the top corners chamfered.
function createRoundedRectShape({ width, height, topRadius, bottomRadius = 0 }) {
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const safeTopRadius = Math.min(topRadius ?? 0, halfWidth, halfHeight);
  const safeBottomRadius = Math.min(bottomRadius ?? 0, halfWidth, halfHeight);

  const shape = new THREE.Shape();

  // [LiveGame] Start at the bottom-left edge and move clockwise.
  shape.moveTo(-halfWidth, -halfHeight + safeBottomRadius);

  if (safeBottomRadius > 0) {
    shape.quadraticCurveTo(
      -halfWidth,
      -halfHeight,
      -halfWidth + safeBottomRadius,
      -halfHeight
    );
  } else {
    shape.lineTo(-halfWidth, -halfHeight);
  }

  shape.lineTo(halfWidth, -halfHeight);

  if (safeBottomRadius > 0) {
    shape.quadraticCurveTo(
      halfWidth,
      -halfHeight,
      halfWidth,
      -halfHeight + safeBottomRadius
    );
  }

  shape.lineTo(halfWidth, halfHeight - safeTopRadius);

  if (safeTopRadius > 0) {
    shape.quadraticCurveTo(
      halfWidth,
      halfHeight,
      halfWidth - safeTopRadius,
      halfHeight
    );
  }

  shape.lineTo(-halfWidth + safeTopRadius, halfHeight);

  if (safeTopRadius > 0) {
    shape.quadraticCurveTo(
      -halfWidth,
      halfHeight,
      -halfWidth,
      halfHeight - safeTopRadius
    );
  }

  shape.lineTo(-halfWidth, -halfHeight + safeBottomRadius);
  shape.closePath();

  return shape;
}
