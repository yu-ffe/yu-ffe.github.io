import * as THREE from "three";
import { ROOM_SIZE, WALL_THICKNESS } from "../constants.js";

const CORNER_RADIUS = 1.2;

export function addWalls(parent) {
  const { width, depth, height, floorLevel } = ROOM_SIZE;

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
  leftWall.position.set(-width / 2 + WALL_THICKNESS / 2, floorLevel + height / 2, 0);
  parent.add(leftWall);

  const holeBottomWorldY = floorLevel + height / 2 + holeMetrics.bottom;

  const backWall = new THREE.Mesh(
    createRoundedPanelGeometry({
      width,
      height,
      depth: WALL_THICKNESS,
      radius: CORNER_RADIUS,
    }),
    wallMaterial
  );
  backWall.position.set(0, floorLevel + height / 2, -depth / 2 + WALL_THICKNESS / 2);
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

  const wallShape = createRoundedRectShape({
    width: depth,
    height,
    radius: CORNER_RADIUS,
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

function createRoundedPanelGeometry({ width, height, depth, radius }) {
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

  const shape = new THREE.Shape();
  shape.moveTo(-halfWidth + clampedRadius, -halfHeight);
  shape.lineTo(halfWidth - clampedRadius, -halfHeight);
  shape.quadraticCurveTo(halfWidth, -halfHeight, halfWidth, -halfHeight + clampedRadius);
  shape.lineTo(halfWidth, halfHeight - clampedRadius);
  shape.quadraticCurveTo(halfWidth, halfHeight, halfWidth - clampedRadius, halfHeight);
  shape.lineTo(-halfWidth + clampedRadius, halfHeight);
  shape.quadraticCurveTo(-halfWidth, halfHeight, -halfWidth, halfHeight - clampedRadius);
  shape.lineTo(-halfWidth, -halfHeight + clampedRadius);
  shape.quadraticCurveTo(-halfWidth, -halfHeight, -halfWidth + clampedRadius, -halfHeight);
  shape.closePath();

  return shape;
}
