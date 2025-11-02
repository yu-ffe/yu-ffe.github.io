import * as THREE from "three";
import { ROOM_SIZE, WALL_THICKNESS } from "../constants.js";

export function addWalls(parent) {
  const { width, depth, height, floorLevel } = ROOM_SIZE;

  const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0xf2f7fc,
    roughness: 0.78,
    metalness: 0.12,
    emissive: new THREE.Color(0x13283d).multiplyScalar(0.08),
  });

  const accentMaterial = new THREE.MeshStandardMaterial({
    color: 0xbdd7f4,
    roughness: 0.7,
    metalness: 0.18,
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
    new THREE.BoxGeometry(width, height, WALL_THICKNESS),
    wallMaterial
  );
  backWall.position.set(0, floorLevel + height / 2, -depth / 2 + WALL_THICKNESS / 2);
  backWall.castShadow = true;
  backWall.receiveShadow = true;
  parent.add(backWall);

  const baseboardHeight = 0.65;
  const baseboardDepth = 0.3;

  const leftBaseboard = new THREE.Mesh(
    new THREE.BoxGeometry(baseboardDepth, baseboardHeight, depth),
    accentMaterial
  );
  leftBaseboard.position.set(
    -width / 2 + baseboardDepth / 2,
    floorLevel + baseboardHeight / 2,
    0
  );
  parent.add(leftBaseboard);

  const backBaseboard = new THREE.Mesh(
    new THREE.BoxGeometry(width, baseboardHeight, baseboardDepth),
    accentMaterial
  );
  backBaseboard.position.set(
    0,
    floorLevel + baseboardHeight / 2,
    -depth / 2 + baseboardDepth / 2
  );
  parent.add(backBaseboard);

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

  const wallShape = new THREE.Shape();
  wallShape.moveTo(-halfDepth, -height / 2);
  wallShape.lineTo(halfDepth, -height / 2);
  wallShape.lineTo(halfDepth, height / 2);
  wallShape.lineTo(-halfDepth, height / 2);
  wallShape.lineTo(-halfDepth, -height / 2);

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
